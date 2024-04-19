import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'; // Ethers plugin
import '@nomiclabs/hardhat-waffle'; // Waffle plugin for testing

// If you are using dotenv to manage environment variables
// import * as dotenv from 'dotenv';
// dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      // Configuration specific to the hardhat network
      chainId: 1337 // Standard chain ID for local Hardhat network
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    // You can define other networks here as needed.
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000 // Timeout for test cases
  }
};

export default config;
