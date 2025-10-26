class CreateLogReceivers < ActiveRecord::Migration[8.0]
  def change
    create_table :log_receivers do |t|
      t.references :log, null: false, foreign_key: true
      t.references :player, null: false, foreign_key:true
      t.integer :amount

      t.timestamps
    end
  end
end
