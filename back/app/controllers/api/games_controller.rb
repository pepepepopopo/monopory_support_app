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

  def start
    game = Game.find_by!(join_token: params[:join_token])

    unless game.waiting?
      render json: { status: 400, message: "ゲームは既に開始されています" }, status: :bad_request
      return
    end

    start_money = params[:start_money] || game.start_money

    # 全プレイヤーの初期資金を設定
    game.players.update_all(money: start_money)

    # ゲームのステータスをplayingに更新
    game.update(start_money: start_money, status: :playing)

    # 全プレイヤーにゲーム開始を通知
    GameChannel.broadcast_to(game, {
      type: "GAME_STARTED",
      game: game.as_json,
      players: game.players.as_json
    })

    render json: { status: 200, game: game, players: game.players.as_json }
  end

  private
  def set_game
    @game = Game.find_by!(join_token: params[:join_token])
  end

  def game_params
    params.require(:game).permit(:start_money, :join_token)
  end
end
