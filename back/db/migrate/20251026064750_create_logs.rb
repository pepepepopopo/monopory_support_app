class CreateLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :logs do |t|
      t.references :game, null: false, foreign_key: true
      t.references :sender_player, null: false, foreign_key: { to_table: :players }
      t.integer :amount

      t.timestamps
    end
  end
end
