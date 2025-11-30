const CreatePlayer = async(game_id:string, name:string, color:string, is_host:boolean) => {
  const url = `${import.meta.env.VITE_API_BASEURL}players`;
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({player: {game_id:game_id, name: name, color:color, is_host: is_host, money:0}})
    });
    if(!response.ok){
      throw new Error(`ユーザー作成失敗: ${response.status}`);
    }
    return response.json();
  }catch(error){
    console.error("ユーザー作成エラー", error)
  }
}

export default CreatePlayer;