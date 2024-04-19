// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MooveNFT is ERC721, ReentrancyGuard, Ownable(msg.sender) {
    using Strings for uint256;

    mapping(uint256 => uint256) public tokenPrices; // Maps token ID to its price
    uint256 public nextTokenId = 0; // Next token ID to be minted
    mapping(uint256 => address) public highestBidder; // Maps token ID to highest bidder
    mapping(uint256 => uint256) public highestBid; // Maps token ID to highest bid
    mapping(uint256 => mapping(address => uint256)) public refunds; // Maps addresses to their refunds
    mapping(uint256 => uint256) public auctionEnds; // Maps token ID to auction end timestamps

    constructor() ERC721("MooveNFT", "MVT") {}

    // Function to mint a new NFT and set an initial price
    function createNFT(uint256 price) public onlyOwner {
        _mint(owner(), nextTokenId); // Mint to the contract owner
        tokenPrices[nextTokenId] = price;
        nextTokenId++;
    }

    // Function to allow users to buy NFTs if not in auction
    function purchaseNFT(uint256 tokenId) public payable {
        require(msg.value == tokenPrices[tokenId], "Incorrect price");
        require(ownerOf(tokenId) == address(this) || ownerOf(tokenId) == msg.sender, "Caller is not owner nor approved");
        _transfer(ownerOf(tokenId), msg.sender, tokenId);
    }


    // Function to set the price of an NFT
    function setPrice(uint256 tokenId, uint256 price) public onlyOwner {
        tokenPrices[tokenId] = price;
    }

    // Function to start an auction
    function startAuction(uint256 tokenId, uint256 duration) public onlyOwner {
        auctionEnds[tokenId] = block.timestamp + duration;
        highestBid[tokenId] = 0;
        highestBidder[tokenId] = address(0);
    }

    // Function to bid on an auction
    function bid(uint256 tokenId) public payable {
        require(block.timestamp < auctionEnds[tokenId], "Auction ended");
        require(msg.value > highestBid[tokenId], "Bid too low");
        
        if (highestBid[tokenId] != 0) {
            refunds[tokenId][highestBidder[tokenId]] += highestBid[tokenId];
        }

        highestBidder[tokenId] = msg.sender;
        highestBid[tokenId] = msg.value;
    }

    // Function to withdraw a refund
    function withdrawRefund(uint256 tokenId) public nonReentrant {
        uint256 refund = refunds[tokenId][msg.sender];
        refunds[tokenId][msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: refund}("");
        require(success, "Refund failed");
    }

    // Function to claim an NFT after an auction
    // Redeem NFT with proper ownership checks
    function redeemNFT(uint256 tokenId) public {
        require(block.timestamp >= auctionEnds[tokenId], "Auction not yet ended");
        require(msg.sender == highestBidder[tokenId], "Not highest bidder");
        _transfer(ownerOf(tokenId), msg.sender, tokenId);
        highestBidder[tokenId] = address(0);
        highestBid[tokenId] = 0;
    }

    // Transfer NFT with proper ownership checks
    function transferNFT(address from, address to, uint256 tokenId) public {
        require(_isAuthorized(ownerOf(tokenId), msg.sender, tokenId), "Caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
}
