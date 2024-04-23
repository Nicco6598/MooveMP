// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MooveNFT is ERC721, ReentrancyGuard, Ownable {
    using Strings for uint256;

    mapping(uint256 => uint256) public tokenPrices; // Maps token ID to its price
    uint256 public nextTokenId = 0; // Next token ID to be minted
    mapping(uint256 => address) public highestBidder; // Maps token ID to highest bidder
    mapping(uint256 => uint256) public highestBid; // Maps token ID to highest bid
    mapping(uint256 => mapping(address => uint256)) public refunds; // Maps addresses to their refunds
    mapping(uint256 => uint256) public auctionEnds; // Maps token ID to auction end timestamps
    mapping(uint256 => string) public tokenAttributes; // Maps token ID to its attributes

    // Mapping per tenere traccia dello storico degli acquisti e delle vendite
    mapping(uint256 => PurchaseHistory) public purchaseHistories;

    struct PurchaseHistory {
        address buyer;
        address seller;
        uint256 price;
        uint256 timestamp;
        string transactionType; // "Auction" o "Direct Purchase"
    }

    constructor() ERC721("MooveNFT", "MVT") Ownable(msg.sender) {}

    // Funzione per mintare un nuovo NFT e impostare gli attributi
    function createNFT(uint256 price, string memory rarity, string memory discount, string memory discountOn) public onlyOwner {
        _mint(owner(), nextTokenId);
        tokenPrices[nextTokenId] = price;
        tokenAttributes[nextTokenId] = string(abi.encodePacked("Rarity: ", rarity, ", Discount: ", discount, ", Discount On: ", discountOn));
        nextTokenId++;
    }

    // Funzione per visualizzare gli attributi di un token
    function getTokenAttributes(uint256 tokenId) public view returns (string memory) {
        return tokenAttributes[tokenId];
    }

    // Funzione per ottenere la durata rimanente di un'asta
    function getAuctionDuration(uint256 tokenId) public view returns (uint256) {
        require(auctionEnds[tokenId] > block.timestamp, "Auction ended");
        return auctionEnds[tokenId] - block.timestamp;
    }

    // Funzione per acquistare un NFT tramite asta
    function purchaseNFT(uint256 tokenId) public payable nonReentrant {
        require(msg.value == tokenPrices[tokenId], "Incorrect price");
        require(ownerOf(tokenId) == address(this) || ownerOf(tokenId) == msg.sender, "Caller is not owner nor approved");
        
        // Aggiornamento dello storico degli acquisti e delle vendite
        purchaseHistories[tokenId] = PurchaseHistory({
            buyer: msg.sender,
            seller: ownerOf(tokenId),
            price: msg.value,
            timestamp: block.timestamp,
            transactionType: "Direct Purchase"
        });

        // Trasferimento dell'NFT
        _transfer(ownerOf(tokenId), msg.sender, tokenId);
    }

    // Funzione per effettuare un'offerta in un'asta
    function bid(uint256 tokenId) public payable nonReentrant {
        require(block.timestamp < auctionEnds[tokenId], "Auction ended");
        require(msg.value > highestBid[tokenId], "Bid too low");
        
        if (highestBid[tokenId] != 0) {
            refunds[tokenId][highestBidder[tokenId]] += highestBid[tokenId];
        }

        // Aggiornamento dello storico degli acquisti e delle vendite
        purchaseHistories[tokenId] = PurchaseHistory({
            buyer: msg.sender,
            seller: highestBidder[tokenId],
            price: msg.value,
            timestamp: block.timestamp,
            transactionType: "Auction"
        });

        // Aggiornamento del miglior offerente e dell'offerta più alta
        highestBidder[tokenId] = msg.sender;
        highestBid[tokenId] = msg.value;
    }

    // Funzione per visualizzare il prezzo di un token
    function getPrice(uint256 tokenId) public view returns (uint256) {
        return tokenPrices[tokenId];
    }

    // Funzione per ritirare un rimborso
    function withdrawRefund(uint256 tokenId) public nonReentrant {
        uint256 refund = refunds[tokenId][msg.sender];
        refunds[tokenId][msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: refund}("");
        require(success, "Refund failed");
    }

    // Funzione per riscattare un NFT dopo un'asta
    function redeemNFT(uint256 tokenId) public {
        require(block.timestamp >= auctionEnds[tokenId], "Auction not yet ended");
        require(msg.sender == highestBidder[tokenId], "Not highest bidder");
        
        // Trasferimento dell'NFT
        _transfer(ownerOf(tokenId), msg.sender, tokenId);
        highestBidder[tokenId] = address(0);
        highestBid[tokenId] = 0;
    }

    // Funzione per trasferire un NFT con controlli di proprietà adeguati
    function transferNFT(address from, address to, uint256 tokenId) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "Caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
}
