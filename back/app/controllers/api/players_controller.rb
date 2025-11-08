class Api::PlayersController < ApplicationController
  def index
    render json: { status: 200, users: User.all }
  end

  def create
    player = User.new(player_params)
    if player.save
      render json: { status:200, player: player }
    else
      render json: { status:500, message:"プレイヤー作成に失敗しました"}
    end
  end

  def destroy
    player = User.find(params[:id])
    if player.destroy
      render json: { status:200, player:player }
    else
      render json: { status:500, message:"プレイヤー削除に失敗しました"}
    end
  end

  private
  def player_params
    params = require(:player).permit(:name, :color, :is_host, :money)
  end
end
