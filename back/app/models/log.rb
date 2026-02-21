class Log < ApplicationRecord
  belongs_to :game
  belongs_to :sender_player, class_name: "Player", foreign_key: :sender_player_id, optional: true
  has_many :log_receivers
  has_many :receiver_players, through: :log_receivers, source: :player

  validates :amount, numericality: { greater_than: 0 }
end
