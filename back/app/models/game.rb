class Game < ApplicationRecord
  has_many :players, dependent: :destroy
  has_many :logs, dependent: :destroy
end
