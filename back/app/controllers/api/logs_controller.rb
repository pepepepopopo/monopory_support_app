class Api::LogsController < ApplicationController
  before_action :authenticate_player!
  before_action :set_game_by_token

  def index
    logs = @game.logs.includes(:sender_player, log_receivers: :player).order(created_at: :desc)

    render json: logs.map { |log|
      {
        id: log.id,
        amount: log.amount,
        sender: log.sender_player&.as_json(only: [:id, :name, :color]),
        receivers: log.log_receivers.map { |lr|
          {
            player: lr.player.as_json(only: [:id, :name, :color]),
            amount: lr.amount
          }
        },
        created_at: log.created_at
      }
    }
  end

  def create
    result = TransferService.new(
      game: @game,
      sender_player_id: params[:sender_player_id],
      receivers: params[:receivers],
      current_player: current_player
    ).call

    if result.success
      render json: { log: result.log.as_json }
    else
      status = result.error&.match?(/ホストのみ|他のプレイヤー/) ? :forbidden : :bad_request
      render json: { error: result.error }, status: status
    end
  end
end
