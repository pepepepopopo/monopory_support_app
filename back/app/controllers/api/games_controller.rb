class Api::GamesController < ApplicationController
  before_action :set_game, only: [:show]
  def index
    render json: { status: 200, games: Game.all }
  end

  def show
    render json: { game: @game}
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
  def set_game
    @game = Game.find_by!(join_token: params[:join_token])
  end

  def game_params
    params.require(:game).permit(:start_money, :join_token)
  end
end
