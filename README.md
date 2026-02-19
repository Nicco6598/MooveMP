# 🚀 MooveMP

<p align="center">
  <img src="./public/logo.png" width="200" alt="MooveMP Logo">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?logo=hardhat)](https://hardhat.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?logo=ethereum)](https://ethereum.org/)

> **The ultimate NFT Marketplace for travel enthusiasts.**  
> Buy, sell, and auction unique travel-themed NFTs on the Sepolia Ethereum testnet.

---

## ✨ Features / Highlights

- 🌍 **Travel NFT Collection**: Explore a curated marketplace of NFTs inspired by global travel and movement.
- 🔨 **Live Auctions**: Participate in real-time bidding for rare collectibles.
- 🎨 **Seamless Minting**: Admin dashboard for creating new NFTs with custom attributes and pricing.
- ⚡ **Vite-Powered Frontend**: Migrated from CRA to Vite for a lightning-fast development experience (HMR) and optimized production builds.
- 🔐 **Blockchain Provenance**: Full history of ownership, purchases, and sales recorded on-chain.
- 💎 **Modern UI**: Dark-themed, glassmorphic interface built with Tailwind CSS for a premium Web3 feel.

## 🛠️ Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | React 18 / Vite | Modern, fast UI development with SWC |
| **Blockchain** | Solidity / Hardhat | Ethereum Smart Contracts & Development Environment |
| **Web3 Library** | Ethers.js v6 | Interaction with Ethereum nodes and wallets |
| **Styling** | Tailwind CSS v3 | Utility-first CSS for responsive, modern design |
| **Contracts** | OpenZeppelin | Industry-standard secure smart contract templates |
| **Network** | Sepolia Testnet | Ethereum test network for safe experimentation |

## 🏗️ Technical Choices (The "Why")

- **Vite Migration**: We moved from Create React App (CRA) to Vite to improve development speed by ~10x. Vite's use of native ES modules and SWC ensures near-instant hot module replacement (HMR).
- **TypeScript**: Used across the entire stack for type safety, reducing runtime errors and improving codebase maintainability.
- **Ethers.js v6**: Upgraded from Web3.js to Ethers.js v6 for a more modern, Promise-based API and better TypeScript support.
- **Tailwind CSS**: Chosen for its ability to create complex, dark-mode designs rapidly without leaving the HTML.
- **Hardhat**: Selected for its robust testing environment and rich plugin ecosystem (e.g., Hardhat Toolbox).

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Nicco6598/MooveMP.git
cd MooveMp
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Smart Contract Setup
Compile the Solidity contracts:
```bash
pnpm compile
```

Run tests to ensure everything is working:
```bash
pnpm test
```

### 4. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
SEPOLIA_URL=your_infura_or_alchemy_url
PRIVATE_KEY=your_wallet_private_key
```

### 5. Deploy to Sepolia (Optional)
```bash
pnpm deploy:sepolia
```

### 6. Run Frontend
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to explore the marketplace.

## 📂 Project Structure

```bash
mooveMP/
├── contracts/          # Solidity Smart Contracts
├── scripts/            # Deployment and management scripts
├── src/                # React Frontend
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application views (Home, Auction, Mint, etc.)
│   ├── utils/          # Web3 helpers and contract interactions
│   └── index.tsx       # Entry point
├── public/             # Static assets (Logo, Favicon)
├── test/               # Smart Contract tests (Mocha/Chai)
└── vite.config.ts      # Vite configuration
```

## 📖 Main Pages

- **Home (`/`)**: Overview of all NFTs with quick purchase options.
- **Auctions (`/auctions`)**: Active bidding on exclusive travel NFTs.
- **Mint (`/mint`)**: Admin-only tool to create new assets.
- **NFT Detail (`/nft/:id`)**: Full metadata views and action triggers (buy/bid).
- **History (`/history`)**: Personalized transaction log for your wallet.
- **Owned (`/owned`)**: View your personal travel NFT collection.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Marco** - Senior Full-Stack & Web3 Developer  
Made with ❤️ in Milano 🇮🇹

[LinkedIn](https://www.linkedin.com/in/marconiccolini-/) • [Portfolio](https://mn-portfolio-orpin.vercel.app/) • [GitHub](https://github.com/nicco6598)

---

<p align="center">
  <sub>If you like this project, please give it a star! 🌟</sub>
</p>