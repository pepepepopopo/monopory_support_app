class Game < ApplicationRecord
  has_many :players, dependent: :destroy
  has_many :logs, dependent: :destroy

  enum status: {
    waiting: 0,
    playing: 1,
    finished: 2
  }

  before_create :generate_join_token

  validates :join_token, uniqueness: true, presence: true

  private

  def generate_join_token
    loop do
      token = SecureRandom.base58(8)
      unless Game.exists?(join_token: token)
        self.join_token = token
        break
      end
    end
  end
end
