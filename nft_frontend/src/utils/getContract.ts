// src/utils/getContract.ts

import { ethers } from 'ethers';
import MooveNFT from './MooveNFT.json';

const getContract = (signerOrProvider: ethers.Signer | ethers.providers.Provider) => {
    const contractAddress = "0xFE95943310e47129CDC7eEb3722119C599C7a1Cb";
    return new ethers.Contract(contractAddress, MooveNFT.abi, signerOrProvider);
}

export default getContract;