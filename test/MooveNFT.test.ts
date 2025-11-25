import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("MooveNFT", function () {
  let mooveNFT: Awaited<ReturnType<typeof deployContract>>;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  async function deployContract() {
    const MooveNFT = await ethers.getContractFactory("MooveNFT");
    const contract = await MooveNFT.deploy();
    await contract.waitForDeployment();
    return contract;
  }

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    mooveNFT = await deployContract();
  });

  describe("Minting", function () {
    it("Should mint a new NFT and set an initial price", async function () {
      await mooveNFT.createNFT(parseEther("1"), "Rare", "10%", "All rides");
      expect(await mooveNFT.ownerOf(0)).to.equal(owner.address);
      expect(await mooveNFT.tokenPrices(0)).to.equal(parseEther("1"));
    });
  });

  describe("Pricing and Buying", function () {
    it("Should set a new price and allow a user to purchase the NFT", async function () {
        await mooveNFT.createNFT(parseEther("1"), "Rare", "10%", "All rides");
        await mooveNFT.setPrice(0, parseEther("2"));
        await mooveNFT.connect(owner).purchaseNFT(0, { value: parseEther("2") });
        expect(await mooveNFT.ownerOf(0)).to.equal(owner.address);
    });
  });

  describe("Auctions", function () {
      it("Should handle auctions correctly", async function () {
          await mooveNFT.createNFT(parseEther("0.1"), "Common", "5%", "Scooter");
          await mooveNFT.startAuction(0, 300);
          await mooveNFT.connect(addr1).bid(0, { value: parseEther("1") });
          await ethers.provider.send('evm_increaseTime', [301]);
          await ethers.provider.send('evm_mine', []);
          await mooveNFT.connect(addr1).redeemNFT(0);
          expect(await mooveNFT.ownerOf(0)).to.equal(addr1.address);
      });
  });

  describe("Transferring NFT", function () {
    it("Should transfer an NFT from one user to another", async function () {
        await mooveNFT.createNFT(parseEther("0.1"), "Epic", "20%", "All rides");
        await mooveNFT.startAuction(0, 300);
        await mooveNFT.connect(addr1).bid(0, { value: parseEther("1") });

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
