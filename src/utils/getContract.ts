// src/utils/getContract.ts

import { ethers, Signer, Provider } from 'ethers';
import MooveNFT from './MooveNFT.json';

const CONTRACT_ADDRESS = "0xFE95943310e47129CDC7eEb3722119C599C7a1Cb";

/**
 * Creates a contract instance for MooveNFT
 * @param signerOrProvider - Signer or Provider to connect the contract
 * @returns Contract instance
 */
const getContract = (signerOrProvider: Signer | Provider) => {
    return new ethers.Contract(CONTRACT_ADDRESS, MooveNFT.abi, signerOrProvider);
}

export default getContract;
export { CONTRACT_ADDRESS };