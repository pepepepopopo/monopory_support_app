class GameChannel < ApplicationCable::Channel
  def subscribed
    game= Game.find_by(join_token: params[:game_id])

    if game
      stream_for game
    else
      reject
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
