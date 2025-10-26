class CreateGames < ActiveRecord::Migration[8.0]
  def change
    create_table :games do |t|
      t.integer :start_money

      t.timestamps
    end
  end
end
