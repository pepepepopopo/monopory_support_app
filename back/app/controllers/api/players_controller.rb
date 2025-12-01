class Api::PlayersController < ApplicationController
  def index
    render json: { status: 200, players: player.all }
  end

  def create
    player = Player.new(player_params)
    if player.save
      render json: { status:200, player: player }
    else
      render json: { status:500, message:"プレイヤー作成に失敗しました"}
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
