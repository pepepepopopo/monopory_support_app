const CreatePlayer = async(name:string, color:string, is_host:boolean) => {
  const url = `${import.meta.env.VITE_API_BASEURL}players`;
  try{
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({player: {name: name, color:color, is_host: is_host}})
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