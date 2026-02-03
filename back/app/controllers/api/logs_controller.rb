class Api::LogsController < ApplicationController
  class InsufficientBalanceError < StandardError; end

  before_action :authenticate_player!

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

    # 送金額バリデーション
    amounts = receivers.map { |r| r[:amount].to_i }
    if amounts.any? { |a| a <= 0 }
      render json: { error: "送金額は1以上である必要があります" }, status: :bad_request
      return
    end

    # 送金元の検証（認可チェック - ロック前に実施）
    if sender_player_id.present?
      # プレイヤー送金: 送金元が自分自身であることを検証
      unless current_player.id == sender_player_id.to_i
        render json: { error: "他のプレイヤーとして送金することはできません" }, status: :forbidden
        return
      end
    else
      # 銀行送金: ホストのみ許可
      unless current_player.is_host
        render json: { error: "銀行からの送金はホストのみが実行できます" }, status: :forbidden
        return
      end
    end

    ActiveRecord::Base.transaction do
      # SELECT FOR UPDATE で関係するプレイヤーをロック（競合状態防止）
      receiver_ids = receivers.map { |r| r[:player_id] }
      all_player_ids = sender_player_id.present? ? [sender_player_id, *receiver_ids] : receiver_ids
      locked_players = game.players.where(id: all_player_ids).lock.index_by(&:id)

      if sender_player_id.present?
        sender = locked_players[sender_player_id.to_i]
        raise ActiveRecord::RecordNotFound, "送金元プレイヤーが見つかりません" unless sender
        total_amount = amounts.sum
        if sender.money < total_amount
          raise InsufficientBalanceError, "残高が不足しています"
        end
        sender.update!(money: sender.money - total_amount)
      end

      log = game.logs.create!(
        sender_player_id: sender_player_id.presence,
        amount: receivers.sum { |r| r[:amount].to_i }
      )

      receivers.each do |receiver|
        player = locked_players[receiver[:player_id].to_i]
        raise ActiveRecord::RecordNotFound, "受取プレイヤーが見つかりません" unless player
        player.update!(money: player.money + receiver[:amount].to_i)

        log.log_receivers.create!(
          player_id: receiver[:player_id],
          amount: receiver[:amount].to_i
        )
      end

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
  rescue InsufficientBalanceError => e
    render json: { error: e.message }, status: :bad_request
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
