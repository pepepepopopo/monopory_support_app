const CreateGame = async (startMoney: number) => {
  const url = `${import.meta.env.VITE_API_BASEURL}games`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ game: { start_money: startMoney } })
  });
  if (!response.ok) {
    throw new Error(`ゲーム作成失敗: ${response.status}`);
  }
  return response.json();
};

export default CreateGame;
