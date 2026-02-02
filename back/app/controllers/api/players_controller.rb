class Api::PlayersController < ApplicationController
  before_action :authenticate_player!, only: [:destroy]

  def index
    game = Game.find_by(join_token: params[:game_join_token])
    render json: game.players
  end

  def create
    game = Game.find_by(id: params[:player][:game_id])
    unless game&.waiting?
      render json: { error: "このゲームは既に開始されているため参加できません" }, status: :forbidden
      return
    end

    is_host = game.players.empty?
    @player = Player.new(
      game_id: game.id,
      name: params[:player][:name],
      color: params[:player][:color],
      is_host: is_host,
      money: 0
    )

    if @player.save
      token = JsonWebToken.encode(
        player_id: @player.id,
        game_id: game.id,
        is_host: is_host
      )

      Rails.logger.info "🔔 PLAYER_ADDED イベント送信: game_id=#{game.id}, players=#{game.players.count}名"
      GameChannel.broadcast_to(game, {
        type: "PLAYER_ADDED",
        all_players: game.players.as_json
      })

      render json: { player: @player, token: token }, status: :created
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  def destroy
    player = Player.find(params[:id])
    game = player.game

    unless current_player.id == player.id || current_player.is_host
      render json: { error: "権限がありません" }, status: :forbidden
      return
    end

    Rails.logger.info "🗑️ プレイヤー削除リクエスト: player_id=#{player.id}, name=#{player.name}, is_host=#{player.is_host}"

    if player.is_host
      GameChannel.broadcast_to(game, {
        type: "GAME_DELETED",
        message: "ホストが退出したため、ゲームが終了しました"
      })

      if game.destroy
        render json: { status: 200, message: "ゲームを削除しました" }
      else
        render json: { status: 500, message: "ゲーム削除に失敗しました" }
      end
    else
      if player.destroy
        GameChannel.broadcast_to(game, {
          type: "PLAYER_REMOVED",
          all_players: game.players.as_json
        })
        render json: { status: 200, message: "プレイヤーを削除しました" }
      else
        render json: { status: 500, message: "プレイヤー削除に失敗しました" }
      end
    end
  end
end
