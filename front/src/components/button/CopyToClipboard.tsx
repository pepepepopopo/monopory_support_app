import React, { useState } from "react"

type TextProps = {
  text: string;
}

const CopyToClipboard: React.FC<TextProps> = ({text}) =>{
  const [copySuccess, setCopySuccess] = useState('');
  const handleCopy = async () =>{
    try{
      await navigator.clipboard.writeText(text);
      setCopySuccess("copied!")
      setTimeout(() => setCopySuccess(""), 1500);
    }catch(error){
      setCopySuccess("failed;;")
      setTimeout(() => setCopySuccess(""), 1500);
    }
  }

  return(
    <>
      <div className={`tooltip tooltip-top ${copySuccess ? "tooltip-open" : ""}`} data-tip={copySuccess ? copySuccess : ""}>
        <button onClick={handleCopy} className="btn">Copy</button>
      </div>
    </>
  )
}

export default CopyToClipboard;