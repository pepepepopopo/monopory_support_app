class Api::GamesController < ApplicationController
  before_action :authenticate_player!, only: [:start, :finish, :destroy]
  before_action :set_game, only: [:show]

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
    game = Game.find_by!(join_token: params[:join_token])

    unless current_player.is_host && current_player.game_id == game.id
      render json: { error: "ホストのみがゲームを削除できます" }, status: :forbidden
      return
    end

    if game.destroy
      render json: { status:200, game:game }
    else
      render json: { status:500, message:"ゲーム削除に失敗しました"}
    end
  end

  def start
    game = Game.find_by!(join_token: params[:join_token])

    unless current_player.is_host && current_player.game_id == game.id
      render json: { error: "ホストのみがゲームを開始できます" }, status: :forbidden
      return
    end

    unless game.waiting?
      render json: { status: 400, message: "ゲームは既に開始されています" }, status: :bad_request
      return
    end

    start_money = params[:start_money] || game.start_money

    game.players.update_all(money: start_money)
    game.update(start_money: start_money, status: :playing)

    GameChannel.broadcast_to(game, {
      type: "GAME_STARTED",
      game: game.as_json,
      players: game.players.as_json
    })

    render json: { status: 200, game: game, players: game.players.as_json }
  end

  def finish
    game = Game.find_by!(join_token: params[:join_token])

    unless current_player.is_host && current_player.game_id == game.id
      render json: { error: "ホストのみがゲームを終了できます" }, status: :forbidden
      return
    end

    unless game.playing?
      render json: { status: 400, message: "ゲームはプレイ中ではありません" }, status: :bad_request
      return
    end

    game.update(status: :finished)

    GameChannel.broadcast_to(game, {
      type: "GAME_FINISHED",
      all_players: game.players.order(money: :desc).as_json
    })

    render json: { status: 200, game: game, players: game.players.order(money: :desc).as_json }
  end

  private
  def set_game
    @game = Game.find_by!(join_token: params[:join_token])
  end

  def game_params
    params.require(:game).permit(:start_money, :join_token)
  end
end
