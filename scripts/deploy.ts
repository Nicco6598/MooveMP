import { ethers } from 'hardhat';

async function main() {
  const ContractFactory = await ethers.getContractFactory('NomeDelTuoContratto');
  console.log('Deploying contract...');
  const contract = await ContractFactory.deploy(/* parametri del costruttore */);
  await contract.deployed();
  console.log('Contract deployed to:', contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
