# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_26_071703) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "games", force: :cascade do |t|
    t.integer "start_money"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "log_receivers", force: :cascade do |t|
    t.bigint "log_id", null: false
    t.bigint "player_id", null: false
    t.integer "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["log_id"], name: "index_log_receivers_on_log_id"
    t.index ["player_id"], name: "index_log_receivers_on_player_id"
  end

  create_table "logs", force: :cascade do |t|
    t.bigint "game_id", null: false
    t.bigint "sender_player_id", null: false
    t.integer "amount"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_logs_on_game_id"
    t.index ["sender_player_id"], name: "index_logs_on_sender_player_id"
  end

  create_table "players", force: :cascade do |t|
    t.bigint "game_id"
    t.string "name"
    t.string "color"
    t.boolean "is_host"
    t.integer "money"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_players_on_game_id"
  end

  add_foreign_key "log_receivers", "logs"
  add_foreign_key "log_receivers", "players"
  add_foreign_key "logs", "games"
  add_foreign_key "logs", "players", column: "sender_player_id"
  add_foreign_key "players", "games"
end
