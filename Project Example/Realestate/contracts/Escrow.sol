//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    //we want to save nft contract address
    address public nftAddress;
    //seller has to be payable to be able to receive tokens from sell
    address payable public seller;
    address public inspector;
    //variables that will define tracking info - lender address (public - will be shown outside smartcotract and will have access to it)
    address public lender;


    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    //making sure that only seller can call this function
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    //storing data about listed nft
    mapping(uint256 => bool) public isListed;
    //storing purchase price of token
    mapping(uint256 => uint256) public purchasePrice;
    //storing amount of escrow
    mapping(uint256 => uint256) public escrowAmount;
    //storing buyer id
    mapping(uint256 => address) public buyer;
    //storing data about passed inspections
    mapping(uint256 => bool) public inspectionPassed;
    //storing data about approvals
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(address _nftAddress, address payable _seller, address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;

      }

   
    //first funcion that lists propierties
    //it has to take nft from wallet(after minting) and transfer it to escrow(setting token price, amount of escrow for transaction fees)
    //we have to get nft id first
    function list(uint256 _nftID, address _buyer, uint256 _purchasePrice, uint256 _escrowAmount) public payable onlySeller{
        //transfering nfts from seller wallet to escrow contract and leaving it till the end of sale
       IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID); 
        //updating of mapping while function is being called
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    } 

    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    function updateInspectionStatus (uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }


    function finalizeSale(uint256 _nftID) public {
    //assumptions
    // Finalize Sale
    // Require inspection status (add more items here, like appraisal)
    require(inspectionPassed[_nftID]);
    // Require sale to be authorized
    require(approval[_nftID][buyer[_nftID]]);
    require(approval[_nftID][seller]);
    require(approval[_nftID][lender]);
    // Require funds to be correct amount
    require(address(this).balance >= purchasePrice[_nftID]);
    
    isListed[_nftID] = false;

    // Transfer Funds to Seller
    (bool success, ) = payable(seller).call{value: address(this).balance}("");
    require(success);
    // Transfer NFT to buyer
    IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    receive() external payable{}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

}
