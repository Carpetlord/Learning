import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    
    const[hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const[buyer, setBuyer] = useState(null)
    const[seller, setSeller] = useState(null)
    const[lender, setLender] = useState(null)
    const[inspector, setInspector] = useState(null)

    const[owner, setOwner] = useState(null)
      
    //we want to fetch different accounts from contract to determine whats gonna appear
    //we got them defined in escrow contract
    const fetchDetails = async() => {
        //buyer that will return eth address from escrow contract
        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)
        //we wanna keep track of buyers actions
        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought)
        //seller
        const seller = await escrow.seller()
        setSeller(seller)

        const hasSold = await escrow.approval(home.id, seller)
        setHasSold(hasSold)
        //lender
        const lender = await escrow.lender()
        setLender(lender)

        const hasLended = await escrow.approval(home.id, lender)
        setHasLended(hasLended)
        //inspector
        const inspector = await escrow.inspector()
        setInspector(inspector)

        const hasInspected = await escrow.inspectionPassed(home.id)
        setHasInspected(hasInspected)

    }
    //we want to fetch the owner of property
    const fetchOwner = async () => {
        //we want to make sure the house is listed
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    
    const buyHandler = async () => {
        //how much escrow money for transaction
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner()

        // Buyer deposit earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Buyer approves...
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        // Inspector updates status
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait()

        setHasInspected(true)
        
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner()

        // Lender approves...
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Lender sends funds to contract...
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
        
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        // Seller approves...
        let transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Seller finalize...
        transaction = await escrow.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasSold(true)
        
    }


    // we want to use both functions
    useEffect(() => {
        fetchDetails()
        fetchOwner()
        //and make sure if hasSold status changed 
        //(if this variable changes, then previous functions are recalled)
    }, [hasSold])

    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt="Home" />
                </div>
                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>


                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38,42)}
                        </div>
                    ) : (
                        <div>
                            {(account === inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                Approve Inspection
                                </button>

                            ) : (account === lender) ? (
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                Approve and Lend
                                </button>

                            ) : (account === seller) ? (
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                Approve and Sell
                                </button>

                            ) : (
                                <div>
                                    <button className='home__buy'onClick={buyHandler} disabled={hasBought}>
                                     Buy
                                    </button>
                                  </div>
                            )}

                        <button className='home__contact'>
                            Contact agent
                        </button>


                        </div>
                    )}
              
                        
                        <hr />

                        <h2>Overview</h2>
                        <p>
                            {home.description}
                        </p>

                        <hr />

                        <h2>Facts and features</h2>

                        <ul>
                            {home.attributes.map((attribute, index) => (
                                <li key={index}><strong>{attribute.trait_type}</strong> :{attribute.value}</li>
                            ))}
                        </ul>
                </div>

                    <button onClick={togglePop} className="home__close">
                        <img src={close} alt="Close" />
                    </button>
                    
            </div>
            
        </div>
    );
}

export default Home;
