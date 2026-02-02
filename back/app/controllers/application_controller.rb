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
end
