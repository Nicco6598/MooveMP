import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("MooveNFT", function () {
  let mooveNFT: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any[];

  beforeEach(async function () {
    const MooveNFT = await ethers.getContractFactory("MooveNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    mooveNFT = await MooveNFT.deploy();
    await mooveNFT.deployed();
  });

  describe("Minting", function () {
    it("Should mint a new NFT and set an initial price", async function () {
      await mooveNFT.createNFT(ethers.utils.parseEther("1"));
      expect(await mooveNFT.ownerOf(0)).to.equal(owner.address);
      expect(await mooveNFT.tokenPrices(0)).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("Pricing and Buying", function () {
    it("Should set a new price and allow a user to purchase the NFT", async function () {
        await mooveNFT.createNFT(ethers.utils.parseEther("1"));
        await mooveNFT.setPrice(0, ethers.utils.parseEther("2"));
        await mooveNFT.connect(owner).purchaseNFT(0, { value: ethers.utils.parseEther("2") });
        expect(await mooveNFT.ownerOf(0)).to.equal(owner.address);
    });
  });

  describe("Auctions", function () {
      it("Should handle auctions correctly", async function () {
          await mooveNFT.createNFT(0);
          await mooveNFT.startAuction(0, 300);
          await mooveNFT.connect(addr1).bid(0, { value: ethers.utils.parseEther("1") });
          await ethers.provider.send('evm_increaseTime', [301]);
          await ethers.provider.send('evm_mine', []);
          await mooveNFT.connect(addr1).redeemNFT(0);
          expect(await mooveNFT.ownerOf(0)).to.equal(addr1.address);
      });
  });

  describe("Transferring NFT", function () {
    it("Should transfer an NFT from one user to another", async function () {
        await mooveNFT.createNFT(0);
        await mooveNFT.startAuction(0, 300);
        await mooveNFT.connect(addr1).bid(0, { value: ethers.utils.parseEther("1") });

        // Simulating time passage to end the auction
        await ethers.provider.send('evm_increaseTime', [301]);
        await ethers.provider.send('evm_mine', []);

        // Redeeming the NFT, making addr1 the owner
        await mooveNFT.connect(addr1).redeemNFT(0);
        expect(await mooveNFT.ownerOf(0)).to.equal(addr1.address);

        // Ensuring addr1 is the owner and then transferring to addr2
        expect(await mooveNFT.ownerOf(0)).to.equal(addr1.address);
        await mooveNFT.connect(addr1).transferNFT(addr1.address, addr2.address, 0);
        expect(await mooveNFT.ownerOf(0)).to.equal(addr2.address);
    });
  });
});
