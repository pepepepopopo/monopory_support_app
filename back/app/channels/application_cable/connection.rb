module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_player

    def connect
      self.current_player = find_verified_player
    end

    private

    def find_verified_player
      token = request.params[:token]
      if token
        decoded = JsonWebToken.decode(token)
        if decoded
          player = Player.find_by(id: decoded[:player_id])
          return player if player
        end
      end
      reject_unauthorized_connection
    end
  end
end
