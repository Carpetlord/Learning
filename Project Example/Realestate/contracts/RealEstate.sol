//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


//wszystko wg standardu erc721 z openzeppelin
contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Real Estate", "REAL") {}

    //mintowanie tokenów (sama funkcja konieczna od nowa, ale jej właściwości z openzeppelina)
    //jest w niej tokenURI, bo wg standardu dla URIstorage w erc721 - metadata dla każdego tokena z osobna
    //wywalamy tylko address player (bo nie będziemy tokenów rozdawać)
    function mint(string memory tokenURI) public returns(uint256) {
        //numeruje tokeny począwszy od 0 (update jego)
        _tokenIds.increment();
        //nowy token ma nadawane nowe id i ostatni nr jest jako obecny
        uint256 newItemId = _tokenIds.current();
        //w openzeppelin jest player, ale tutaj nie będzie rozdawanych, tylko dany adres będzie mintował
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
    //określenie totalsupply tokenów
    function totalSupply() public view returns(uint256) {
        //sprawdzenie ile obecnie istnieje tokenów
        return _tokenIds.current();
    }


}
