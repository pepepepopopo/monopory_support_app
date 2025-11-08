const CreateGame = async() => {
  const url = `${import.meta.env.VITE_API_BASEURL}games`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({game: { start_money: 15000}})
    });
    if (!response.ok) {
      throw new Error(`ゲーム作成失敗: ${response.status}`);
    }
    return response.json();
  }catch(error) {
    console.error("ゲーム作成エラー", error)
  }
};

export default CreateGame;
