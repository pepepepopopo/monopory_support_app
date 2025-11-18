class Player < ApplicationRecord
  belongs_to :game
  has_many :log_receivers
  has_many :player_logs, through: :log_receivers, source: :log
end
