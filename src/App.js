import { useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
// eth wallet detector
import detectEthereumProvider from '@metamask/detect-provider'

function App() {
  //store state of web3
  const [web3Api, setWeb3Api] = useState({
    provider:null,
    web3:null
  })
  //store state of account
  const[account, setAccount] = useState(null)

  useEffect(()=> {

    const loadProvider = async() =>{
      
      let provider = await detectEthereumProvider()
      if(provider)  {
        // provider.request({method:"eth_requestAccounts"}) // this will connect the wallet automatically
        setWeb3Api({
          web3: new Web3(provider),
          provider
        })
      }else{
        console.log("install metamask")
      }
      
    }
    loadProvider()
    
  },[])
  
  useEffect(() => {
    const getAccount = async()=>{
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    web3Api.web3 && getAccount(); // its like if statement
  },[web3Api.web3])// this will update the account whenevr the wallet is connected

  return (
    <>
    
    <div className="faucet-rapper">
      <div className="faucet">
        <div className="is-flex is-align-items-center">
          <span>
            <strong className="mr-2">Account:</strong>
          </span>
          <h1>{account ? account:
          <button className="button is-small" onClick = {
          ()=>web3Api.provider.request({method:"eth_requestAccounts"})}>
            Connect wallet
          </button>}</h1>
        </div>
        <div className="balance-view is-size-2 my-4">
          Current Balance: <strong>10</strong> ETH
        </div>
        <button className="button is-primary mr-2">Deposit</button>
        <button className="button is-link">Withdraw</button>
      </div>
    </div>
    
    </>
  );
}

export default App;
