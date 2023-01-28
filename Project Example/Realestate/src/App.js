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
  //we need to read and set provider to
  const[provider, setProvider] = useState(null)
  //function that reads and set account
  const[account, setAccount] = useState(null)
  //we need to read escrow
  const[escrow, setEscrow] = useState(null)
  //homes, but not null cuz we want to load array
  const[homes, setHomes] = useState([])

  const[home, setHome] = useState({})

  const [toggle, setToggle] = useState(false);


  //connection application to blockchain, that we want to get connections from mm
  //it loads data from blockchain (not calling it on its own)
  const loadBlockchainData = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //console.log(provider)
    //setting provider
    setProvider(provider)
    //we want to get the network
    const network = await provider.getNetwork()
    //importing id of nft's
    //config[network.chainId].RealEstate.address 
    //checking them out
    //console.log(config[network.chainId].realEstate.address, config[network.chainId].escrow.address )
    //doing it through ethersjs
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    //we want to get properties totalsupply
    const totalSupply = await realEstate.totalSupply()
    //console.log(totalSupply, toString())
    
    //we want to store all the homes to list them on the page
    //we want to load them into array
    const homes = []

    //we want to list all the properties on the site, so we have to load into array
    //thanks to saving properties nft in mapping we can get them, but we need to know 
    //how many there are (totalSupply - so we know there are 3 of them (id 1, 2, 3))
    //so we can loop them and fetch 1 by 1 to array homes[]
    for (var i = 1; i <= totalSupply; i++) {
      //
      const uri = await realEstate.tokenURI(i)
      //we need to fetch the uri for metadata from contract
      const response = await fetch(uri)
      //we need the metadata
      const metadata = await response.json()
      //we need to push it into array
      homes.push(metadata) 
    }

    setHomes(homes)
    //console.log(homes)

    //importing id of chain from config file
    //config[network.chainId].escrow.address 
    //we want to load escrow contract in js like did with other contracts
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)
    
    //mm injects to browser
    //window.ethereum
    //getting account from mm
    //const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //console.log(accounts)
    //setting account state to component
    //setAccount(accounts[0])
    //console.log(accounts[0])

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  
    
  } 
  //calling data from blockchain and leaving empty array will detect any changes
  useEffect(() => {
    loadBlockchainData()
  }, [])

  const toggleProp = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div>

      <Navigation account={account} setAccount={setAccount}/>
      <Search />

      <div className='cards__section'>

        <h3>Welcome to Realestate</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (

            <div className='card' key={index} onClick={() => toggleProp(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home"/>
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}

        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} toggleProp={toggleProp} />
      )}

    </div>
  );
}

export default App;
