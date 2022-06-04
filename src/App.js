import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
// eth wallet detector
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";

function App() {
  //store state of web3
  const [web3Api, setWeb3Api] = useState({
    provider:null,
    web3:null,
    contract:null,
    isProviderLoaded:false
  })
  //store state of account
  const[account, setAccount] = useState(null)
  const[balance, setBalance] = useState(null)

  const[shouldReload, reload] = useState(false)
  //reloadEffect is created only when state changes of should Reload
  const canConnectToContract = account && web3Api.contract
  const reloadEffect = useCallback (() => reload(!shouldReload),[shouldReload])

  const setAccountListener = (provider) => {
    provider.on("accountsChanged",_=>window.location.reload())
    provider.on("chainChanged",_=>window.location.reload())

    // provider._jsonRpcConnection.events.on("notification", (payload)=>{
    //   const {method} = payload
    //   if(method==="metamask_unlockStateChanged")
    //     setAccount(null)
    // })

  }

  useEffect(()=> {

    const loadProvider = async() =>{
      
      let provider = await detectEthereumProvider()

      // debugger
      if(provider)  {
        const contract = await loadContract("Faucet",provider)
        // provider.request({method:"eth_requestAccounts"}) // this will connect the wallet automatically
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded:true
        })
      }else{
        setWeb3Api(api => ({...api, isProviderLoaded:true}))
        console.log("install metamask")
      }
      
    }
    loadProvider()
    
  },[])
  
  useEffect(()=>{
    const loadbalance = async()=> {
      const{contract, web3} = web3Api
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance,"ether"))
    }

    web3Api.contract && loadbalance()
  },[web3Api,shouldReload])

  useEffect(() => {
    const getAccount = async()=>{
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    web3Api.web3 && getAccount(); // its like if statement
  },[web3Api.web3])// this will update the account whenevr the wallet is connected

  const addFunds = useCallback(async ()=>{
    const {contract, web3} = web3Api;
    await contract.addFunds({from:account,value:web3.utils.toWei("1","ether")})
    // window.location.reload()
    reloadEffect()
  },[web3Api,account,reloadEffect])

  const withdrawFunds = async ()=>{
    const {contract, web3} = web3Api;
    const amount = web3.utils.toWei("0.1","ether")
    await contract.withdraw(amount,{from:account})
    // window.location.reload()
    reloadEffect()
  }

  return (
    <>
    
    <div className="faucet-rapper">
      <div className="faucet">
        {
          web3Api.isProviderLoaded ?
          <div className="is-flex is-align-items-center">
            <span>
              <strong className="mr-2">Account:</strong>
            </span>
            <h1>{account ? account:
            !web3Api.provider ? 
            <>
            <div className="notification is-warning is-size-6 is-rounded">
                Wallet is not detected!{` `}
                <a
                  rel="noreferrer" 
                  target="_blank" href="https://docs.metamask.io">
                  Install Metamask
                </a>
            </div>
            </> :
            <button className="button is-small" onClick = {
            ()=>web3Api.provider.request({method:"eth_requestAccounts"})}>
              Connect wallet
            </button>}</h1>
          </div> :
          <span>Loading Web3...</span>
        }
        <div className="balance-view is-size-2 my-4">
          Current Balance: <strong>{balance}</strong> ETH
        </div>
        { !canConnectToContract &&
            <i className="is-block">
              Connect to Ganache
            </i>
        }
        <button disabled={!canConnectToContract} className="button is-primary mr-2" onClick={addFunds}>Deposit 1 ether</button>
        <button disabled={!canConnectToContract} className="button is-link" onClick={withdrawFunds}>Withdraw</button>
      </div>
    </div>
    
    </>
  );
}

export default App;
