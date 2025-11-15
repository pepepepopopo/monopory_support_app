class AddColumnToGames < ActiveRecord::Migration[8.0]
  def change
    add_column :games, :join_token, :string
    add_column :games, :status, :integer, default: 0, null: false

    add_index :games, :join_token, unique: true
  end
end
