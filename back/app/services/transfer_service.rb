class TransferService
  class InsufficientBalanceError < StandardError; end

  Result = Data.define(:success, :log, :error)

  def initialize(game:, sender_player_id:, receivers:, current_player:)
    @game = game
    @sender_player_id = sender_player_id
    @receivers = receivers || []
    @current_player = current_player
  end

  def call
    # 送金額バリデーション
    amounts = @receivers.map { |r| r[:amount].to_i }
    if amounts.empty? || amounts.any? { |a| a <= 0 }
      return Result.new(success: false, log: nil, error: "送金額は1以上である必要があります")
    end

    # 認可チェック
    if @sender_player_id.present?
      unless @current_player.id == @sender_player_id.to_i
        return Result.new(success: false, log: nil, error: "他のプレイヤーとして送金することはできません")
      end
    else
      unless @current_player.is_host
        return Result.new(success: false, log: nil, error: "銀行からの送金はホストのみが実行できます")
      end
    end

    log = nil
    ActiveRecord::Base.transaction do
      receiver_ids = @receivers.map { |r| r[:player_id] }
      all_player_ids = @sender_player_id.present? ? [@sender_player_id, *receiver_ids] : receiver_ids
      locked_players = @game.players.where(id: all_player_ids).lock.index_by(&:id)

      if @sender_player_id.present?
        sender = locked_players[@sender_player_id.to_i]
        raise ActiveRecord::RecordNotFound, "送金元プレイヤーが見つかりません" unless sender
        total_amount = amounts.sum
        raise InsufficientBalanceError, "残高が不足しています" if sender.money < total_amount
        sender.update!(money: sender.money - total_amount)
      end

      log = @game.logs.create!(
        sender_player_id: @sender_player_id.presence,
        amount: @receivers.sum { |r| r[:amount].to_i }
      )

      @receivers.each do |receiver|
        player = locked_players[receiver[:player_id].to_i]
        raise ActiveRecord::RecordNotFound, "受取プレイヤーが見つかりません" unless player
        player.update!(money: player.money + receiver[:amount].to_i)
        log.log_receivers.create!(player_id: receiver[:player_id], amount: receiver[:amount].to_i)
      end

      GameChannel.broadcast_to(@game, {
        type: "MONEY_TRANSFERRED",
        all_players: @game.players.reload.as_json,
        log: serialize_log(log)
      })
    end

    Result.new(success: true, log: log, error: nil)
  rescue InsufficientBalanceError => e
    Result.new(success: false, log: nil, error: e.message)
  rescue ActiveRecord::RecordNotFound => e
    Result.new(success: false, log: nil, error: e.message)
  rescue ActiveRecord::RecordInvalid => e
    Result.new(success: false, log: nil, error: e.message)
  end

  private

  def serialize_log(log)
    {
      id: log.id,
      amount: log.amount,
      sender: log.sender_player&.as_json(only: [:id, :name, :color]),
      receivers: log.log_receivers.map { |lr|
        { player: lr.player.as_json(only: [:id, :name, :color]), amount: lr.amount }
      },
      created_at: log.created_at
    }
  end
end
