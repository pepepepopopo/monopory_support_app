class Api::GamesController < ApplicationController
  def index
    render json: { status: 200, games: Game.all }
  end

  def create
    game = Game.new(game_params)
    if game.save
      render json: { status:200, game: game }
    else
      render json: { status:500, message:"ゲーム作成に失敗しました"}
    end
  end

  def destroy
    game = Game.find(params[:id])

    if game.destroy
      render json: { status:200, game:game }
    else
      render json: { status:500, message:"ゲーム削除に失敗しました"}
    end
  end

  private
  def game_params
    params.require(:game).permit(:start_money)
  end
end
