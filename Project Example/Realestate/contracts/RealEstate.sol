//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


//everything according to erc721 standards on openzeppelin
contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Real Estate", "REAL") {}

    //tokens minting (function is needed from scratch, but its properties are from openzeppelin)
    //theres tokenURI in it, due to standard for URIstorage in rec721 - metadata for each token on its own
    //we're gonna throw out player address (we wont give any tokens)
    function mint(string memory tokenURI) public returns(uint256) {
        //numbers tokens from 0 (it updates it)
        _tokenIds.increment();
        //new token has given its id and last nr is as current
        uint256 newItemId = _tokenIds.current();
        //in openzeppelin theres player, but here wont be given, only selected address will mint
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
    //defining tolalsuppy of tokens
    function totalSupply() public view returns(uint256) {
        //checkign how many tokens are currently
        return _tokenIds.current();
    }


}
