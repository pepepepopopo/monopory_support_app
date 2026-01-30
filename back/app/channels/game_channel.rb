class GameChannel < ApplicationCable::Channel
  def subscribed
    game= Game.find_by(join_token: params[:game_id])

    if game
      Rails.logger.info "✅ GameChannel購読開始: join_token=#{params[:game_id]}, game_id=#{game.id}"
      stream_for game
    else
      Rails.logger.warn "❌ GameChannel購読拒否: join_token=#{params[:game_id]} (ゲーム未発見)"
      reject
    end
  end

  def unsubscribed
    Rails.logger.info "👋 GameChannel購読終了: join_token=#{params[:game_id]}"
  end
end
