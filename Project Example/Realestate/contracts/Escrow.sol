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
    //chcemy zapisać adres kontraktu nft
    address public nftAddress;
    //seller musi być payable bo będzie musiał mieć możliwość otrzymywania środków za sprzedaż
    address payable public seller;
    address public inspector;
    //zmienne, które będą definiować śledzone info - adres lendera (public - będzie widoczne poza smartcontractem i będzie można mieć do niej dostęp)
    address public lender;


    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    //upewnienie się, że tylko seller może wywołać funkcję
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    //przechowywanie danych o listowaniu danego nft
    mapping(uint256 => bool) public isListed;
    //przechowywanie ceny zakupu
    mapping(uint256 => uint256) public purchasePrice;
    //przechowywanie ilości escrow
    mapping(uint256 => uint256) public escrowAmount;
    //przechowywanie id kupującego
    mapping(uint256 => address) public buyer;
    //przechowywanie danych o zaliczonych inspekcjach
    mapping(uint256 => bool) public inspectionPassed;
    //przechowywanie danych o approval
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(address _nftAddress, address payable _seller, address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;

      }

    //pierwsza funkcjonalnosc listujaca properties
    //ma wziąć nft z walleta(po mintowaniu) i przemieścić do escrow (ustalenie ceny tokena, ilości escrow do opłat transakcyjnych)
    //musimy najpierw pozyskać id nft
    function list(uint256 _nftID, address _buyer, uint256 _purchasePrice, uint256 _escrowAmount) public payable onlySeller{
        //przetransferować nft z walletu sellera do kontraktu escrow i pozostawić go, aż sprzedaż się dokończy
       IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID); 
        //robienie update do mappingu przy wywoływaniu funkcji
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
    //założenia
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
    //anulowanie transakcji
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
