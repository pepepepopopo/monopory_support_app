class CreatePlayers < ActiveRecord::Migration[8.0]
  def change
    create_table :players do |t|
      t.references :game, foreign_key: true
      t.string :name
      t.string :color
      t.boolean :is_host
      t.integer :money

      t.timestamps
    end
  end
end
