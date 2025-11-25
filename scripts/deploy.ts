import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying MooveNFT contract...');
  
  const MooveNFT = await ethers.getContractFactory('MooveNFT');
  const mooveNFT = await MooveNFT.deploy();
  
  await mooveNFT.waitForDeployment();
  
  const address = await mooveNFT.getAddress();
  console.log('MooveNFT deployed to:', address);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
