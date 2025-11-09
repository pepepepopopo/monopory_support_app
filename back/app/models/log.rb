class Log < ApplicationRecord
  belongs_to :game
  belongs_to :sender_player, class_name: "Player", foreign_key: :sender_player_id
  has_many :log_receivers
  has_many :log_player, through: :player, source: :player
end
