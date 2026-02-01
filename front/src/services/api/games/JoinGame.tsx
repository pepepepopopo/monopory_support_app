const JoinGame = async (join_token: string) => {
  const url = `${import.meta.env.VITE_API_BASEURL}games/${join_token}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`ゲーム参加失敗: ${response.status}`);
  }
  return response.json();
};

export default JoinGame;
