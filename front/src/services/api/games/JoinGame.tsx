const JoinGame = async(join_token: string) =>{
  const url = `${import.meta.env.VITE_API_BASEURL}games/${join_token}`;
  try{
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`参加失敗: ${response.status}`);
    }
    return response.json();
  }catch(error){
    console.error("ゲームがありません", error)
  }
}

export default JoinGame;