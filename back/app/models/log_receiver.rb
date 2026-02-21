class LogReceiver < ApplicationRecord
  belongs_to :log
  belongs_to :player

  validates :amount, numericality: { greater_than: 0 }
end
