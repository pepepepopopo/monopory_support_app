const CreatePlayer = async (game_id: string, name: string, color: string) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}players`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ player: { game_id, name, color } })
  });
  if (!response.ok) {
    throw new Error(`プレイヤー作成失敗: ${response.status}`);
  }
  return response.json();
};

export default CreatePlayer;
