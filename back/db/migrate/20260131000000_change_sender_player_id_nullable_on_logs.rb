class ChangeSenderPlayerIdNullableOnLogs < ActiveRecord::Migration[8.0]
  def change
    change_column_null :logs, :sender_player_id, true
  end
end
