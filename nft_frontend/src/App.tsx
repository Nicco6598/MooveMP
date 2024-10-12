import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/Navbar';
import './index.css';
import { ProviderProvider } from './pages/ProviderContext';
import Footer from './pages/Footer';

const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const MintNFT = React.lazy(() => import('./pages/MintNFT'));
const NFTDetails = React.lazy(() => import('./pages/NFTDetails'));
const OwnedNFTs = React.lazy(() => import('./pages/OwnedNFTs'));
const PurchaseHistory = React.lazy(() => import('./pages/PurchaseHistory'));
const AuctionPage = React.lazy(() => import('./pages/AuctionPage'));
const Rides = React.lazy(() => import('./pages/CorseViaggi'));

const App: React.FC = () => {
  return (
    <Router>
      <ProviderProvider>
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/mint" element={<MintNFT />} />
            <Route path="/owned" element={<OwnedNFTs />} />
            <Route path="/nft/:tokenId" element={<NFTDetails />} />
            <Route path="/history" element={<PurchaseHistory />} />
            <Route path="/auctions" element={<AuctionPage />} />
            <Route path="/rides" element={<Rides />} />
            <Route path="/" element={<Marketplace />} />  {/* Route di default */}
          </Routes>
        </Suspense>
        <Footer />
      </ProviderProvider>
    </Router>
  );
};

export default App;
