class Api::GamesController < ApplicationController
  before_action :authenticate_player!, only: [:start, :finish, :destroy]
  before_action :set_game_by_token, only: [:show, :start, :finish, :destroy]

  def show
    render json: { game: @game }
  end

  def create
    game = Game.new(game_params)
    if game.save
      render json: { game: game }, status: :created
    else
      render json: { error: "ゲーム作成に失敗しました" }, status: :unprocessable_entity
    end
  end

  def destroy
    return unless authorize_host!(@game)

    if @game.destroy
      render json: { game: @game }
    else
      render json: { error: "ゲーム削除に失敗しました" }, status: :unprocessable_entity
    end
  end

  def start
    return unless authorize_host!(@game)

    unless @game.waiting?
      render json: { error: "ゲームは既に開始されています" }, status: :bad_request
      return
    end

    start_money = params[:start_money] || @game.start_money

    @game.players.update_all(money: start_money)
    @game.update(start_money: start_money, status: :playing)

    GameChannel.broadcast_to(@game, {
      type: "GAME_STARTED",
      game: @game.as_json,
      players: @game.players.as_json
    })

    render json: { game: @game, players: @game.players.as_json }
  end

  def finish
    return unless authorize_host!(@game)

    unless @game.playing?
      render json: { error: "ゲームはプレイ中ではありません" }, status: :bad_request
      return
    end

    @game.update(status: :finished)

    GameChannel.broadcast_to(@game, {
      type: "GAME_FINISHED",
      all_players: @game.players.order(money: :desc).as_json
    })

    render json: { game: @game, players: @game.players.order(money: :desc).as_json }
  end

  private

  def game_params
    params.require(:game).permit(:start_money, :join_token)
  end
end
