class Api::PlayersController < ApplicationController
  def index
    game = Game.find_by(join_token: params[:game_join_token])
    render json: game.players
  end

  def create
    @player = Player.new(player_params)

    # ゲームが待機中でなければ参加を拒否
    game = Game.find_by(id: player_params[:game_id])
    unless game&.waiting?
      render json: { error: "このゲームは既に開始されているため参加できません" }, status: :forbidden
      return
    end

    if @player.save
      # 保存したプレイヤーに紐づくゲームを取得
      game = @player.game

      # そのゲームのチャンネルに対してブロードキャスト
      Rails.logger.info "🔔 PLAYER_ADDED イベント送信: game_id=#{game.id}, players=#{game.players.count}名"
      GameChannel.broadcast_to(game, {
        type: "PLAYER_ADDED",
        all_players: game.players.as_json
      })

      render json: @player, status: :created
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  def destroy
    player = Player.find(params[:id])
    game = player.game

    Rails.logger.info "🗑️ プレイヤー削除リクエスト: player_id=#{player.id}, name=#{player.name}, is_host=#{player.is_host}"

    if player.is_host
      # ホストが退出する場合: ゲームごと削除
      # ActionCableで全員に通知（削除前に実行）
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
      # 一般プレイヤーが退出する場合: プレイヤーのみ削除
      if player.destroy
        # 残りのメンバーに更新を通知
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

  private
  def player_params
    params.require(:player).permit(:game_id, :name, :color, :is_host, :money)
  end
end
