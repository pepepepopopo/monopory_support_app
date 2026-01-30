class Api::PlayersController < ApplicationController
  def index
    game = Game.find_by(join_token: params[:game_join_token])
    render json: game.players
  end

  def create
    @player = Player.new(player_params)

    if @player.save
      # 保存したプレイヤーに紐づくゲームを取得
      game = @player.game

      # そのゲームのチャンネルに対してブロードキャスト
      GameChannel.broadcast_to(game, {
        type: "PLAYER_ADDED",
        all_players: game.players
      })

      render json: @player, status: :created
    else
      render json: @player.errors, status: :unprocessable_entity
    end
  end

  def destroy
    player = Player.find(params[:id])
    game = player.game

    if player.is_host
      # ホストが退出する場合: ゲームごと削除
      if game.destroy
        # ActionCableで全員に通知
        GameChannel.broadcast_to(game, {
          type: "GAME_DELETED",
          message: "ホストが退出したため、ゲームが終了しました"
        })
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
          all_players: game.players
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
