import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
  //function that reads and set account
  const[account, setAccount] = useState(null)

  //connection application to blockchain, that we want to get connections from mm
  //it loads data from blockchain (not calling it on its own)
  const loadBlockchainData = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log(provider)
    //mm injects to browser
    //window.ethereum
    //getting account from mm
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts)
    //setting account state to component
    setAccount(accounts[0])
    console.log(accounts[0])

  } 
  //calling data from blockchain and leaving empty array will detect any changes
  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>

      <Navigation />

      <div className='cards__section'>

        <h3>Welcome to Realestate</h3>

      </div>

    </div>
  );
}

export default App;
