class Player < ApplicationRecord
  belongs_to :game
  has_many :log_receivers
  has_many :player_logs, through: :log_receivers, source: :log

  # バリデーション
  validates :name,
    presence: { message: "プレイヤー名を入力してください" },
    length: { minimum: 1, maximum: 20, message: "プレイヤー名は1〜20文字で入力してください" },
    format: {
      with: /\A[\p{Hiragana}\p{Katakana}\p{Han}a-zA-Z0-9\s]+\z/,
      message: "プレイヤー名に使用できない文字が含まれています"
    }

  validates :color,
    presence: { message: "色を選択してください" },
    format: {
      with: /\A#[0-9A-Fa-f]{6}\z/,
      message: "無効な色形式です"
    }

  validates :money,
    numericality: { greater_than_or_equal_to: 0, message: "残高は0以上である必要があります" }
end
