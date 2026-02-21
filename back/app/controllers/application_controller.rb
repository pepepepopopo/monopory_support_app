class ApplicationController < ActionController::API
  private

  def authenticate_player!
    token = request.headers["Authorization"]&.split(" ")&.last
    decoded = JsonWebToken.decode(token) if token
    if decoded
      @current_player = Player.find_by(id: decoded[:player_id])
    end
    render json: { error: "認証が必要です" }, status: :unauthorized unless @current_player
  end

  def current_player
    @current_player
  end

  def authorize_host!(game)
    unless current_player&.is_host && current_player.game_id == game.id
      render json: { error: "ホストのみが実行できます" }, status: :forbidden
      return false
    end
    true
  end

  def set_game_by_token
    token = params[:join_token] || params[:game_join_token]
    @game = Game.find_by!(join_token: token)
  end
end
