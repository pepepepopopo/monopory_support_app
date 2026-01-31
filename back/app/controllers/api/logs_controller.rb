class Api::LogsController < ApplicationController
  def index
    game = Game.find_by!(join_token: params[:game_join_token])
    logs = game.logs.includes(:sender_player, log_receivers: :player).order(created_at: :desc)

    render json: logs.map { |log|
      {
        id: log.id,
        amount: log.amount,
        sender: log.sender_player&.as_json(only: [:id, :name, :color]),
        receivers: log.log_receivers.map { |lr|
          {
            player: lr.player.as_json(only: [:id, :name, :color]),
            amount: lr.amount
          }
        },
        created_at: log.created_at
      }
    }
  end

  def create
    game = Game.find_by!(join_token: params[:game_join_token])
    sender_player_id = params[:sender_player_id]
    receivers = params[:receivers] || []

    ActiveRecord::Base.transaction do
      # 送金元の残高を減らす（銀行の場合はスキップ）
      if sender_player_id.present?
        sender = game.players.find(sender_player_id)
        total_amount = receivers.sum { |r| r[:amount].to_i }
        sender.update!(money: sender.money - total_amount)
      end

      # ログを作成
      log = game.logs.create!(
        sender_player_id: sender_player_id.presence,
        amount: receivers.sum { |r| r[:amount].to_i }
      )

      # 各受取人の残高を増やし、log_receiverを作成
      receivers.each do |receiver|
        player = game.players.find(receiver[:player_id])
        player.update!(money: player.money + receiver[:amount].to_i)

        log.log_receivers.create!(
          player_id: receiver[:player_id],
          amount: receiver[:amount].to_i
        )
      end

      # 全プレイヤーにブロードキャスト
      GameChannel.broadcast_to(game, {
        type: "MONEY_TRANSFERRED",
        all_players: game.players.reload.as_json,
        log: {
          id: log.id,
          amount: log.amount,
          sender: log.sender_player&.as_json(only: [:id, :name, :color]),
          receivers: log.log_receivers.map { |lr|
            {
              player: lr.player.as_json(only: [:id, :name, :color]),
              amount: lr.amount
            }
          },
          created_at: log.created_at
        }
      })

      render json: { status: 200, log: log.as_json }
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
