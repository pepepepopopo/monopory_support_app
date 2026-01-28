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
    if player.destroy
      render json: { status:200, player:player }
    else
      render json: { status:500, message:"プレイヤー削除に失敗しました"}
    end
  end

  private
  def player_params
    params.require(:player).permit(:game_id, :name, :color, :is_host, :money)
  end
end
