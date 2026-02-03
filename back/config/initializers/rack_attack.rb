# frozen_string_literal: true

class Rack::Attack
  # キャッシュストアの設定（Rails.cacheを使用）
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # ----------------------------------------
  # スロットリング設定
  # ----------------------------------------

  # ゲーム作成: 1分間に5回まで（大量ゲーム作成防止）
  throttle("game_creation/ip", limit: 5, period: 1.minute) do |req|
    if req.path == "/api/games" && req.post?
      req.ip
    end
  end

  # プレイヤー作成: 1分間に10回まで
  throttle("player_creation/ip", limit: 10, period: 1.minute) do |req|
    if req.path.match?(%r{^/api/games/[^/]+/players$}) && req.post?
      req.ip
    end
  end

  # ゲーム参照（join_token推測防止）: 1分間に30回まで
  throttle("game_lookup/ip", limit: 30, period: 1.minute) do |req|
    if req.path.match?(%r{^/api/games/[^/]+$}) && req.get?
      req.ip
    end
  end

  # 送金: 1分間に60回まで（連続送金は許可しつつDoS防止）
  throttle("transfer/ip", limit: 60, period: 1.minute) do |req|
    if req.path.match?(%r{^/api/games/[^/]+/logs$}) && req.post?
      req.ip
    end
  end

  # 全般的なAPI制限: 1分間に300リクエストまで
  throttle("api/ip", limit: 300, period: 1.minute) do |req|
    if req.path.start_with?("/api/")
      req.ip
    end
  end

  # ----------------------------------------
  # レスポンス設定
  # ----------------------------------------

  self.throttled_responder = lambda do |request|
    match_data = request.env["rack.attack.match_data"]
    now = match_data[:epoch_time]
    retry_after = match_data[:period] - (now % match_data[:period])

    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After" => retry_after.to_s
      },
      [{ error: "リクエストが多すぎます。しばらく待ってから再試行してください。" }.to_json]
    ]
  end
end
