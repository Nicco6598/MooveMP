import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/Navbar';
import './index.css'; // Import the Tailwind CSS style sheet
import { ProviderProvider } from './pages/ProviderContext';
import Marketplace from './pages/Marketplace';
import MintNFT from './pages/MintNFT';
import NFTDetails from './pages/NFTDetails';
import OwnedNFTs from './pages/OwnedNFTs';
import PurchaseHistory from './pages/PurchaseHistory';
import Footer from './pages/Footer';
import AuctionPage from './pages/AuctionPage';

const App: React.FC = () => {

  return (
    <Router>
      <div>
        <ProviderProvider>
          <Navbar />
          <Routes>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mint" element={<MintNFT />} />
            <Route path="/owned" element={<OwnedNFTs />} />
            <Route path="/nft/:tokenId" element={<NFTDetails />} />
            <Route path="/history" element={<PurchaseHistory />} />
            <Route path="/auctions" element={<AuctionPage />} />
            <Route path="/" element={<Marketplace />} />  {/* Ensure this is the last Route if you want it to be the default */}
          </Routes>
          <Footer />
        </ProviderProvider>
      </div>
    </Router>
  );
};

export default App;
