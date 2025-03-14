import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import './index.css';
import { ProviderProvider } from './pages/ProviderContext';
import Footer from './pages/Footer';

// Lazy load components
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const MintNFT = React.lazy(() => import('./pages/MintNFT'));
const NFTDetails = React.lazy(() => import('./pages/NFTDetails'));
const OwnedNFTs = React.lazy(() => import('./pages/OwnedNFTs'));
const PurchaseHistory = React.lazy(() => import('./pages/PurchaseHistory'));
const AuctionPage = React.lazy(() => import('./pages/AuctionPage'));
const Rides = React.lazy(() => import('./pages/CorseViaggi'));

// Loader component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <ProviderProvider>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
          <Navbar />
          <main className="flex-grow pb-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/mint" element={<MintNFT />} />
                <Route path="/owned" element={<OwnedNFTs />} />
                <Route path="/nft/:tokenId" element={<NFTDetails />} />
                <Route path="/history" element={<PurchaseHistory />} />
                <Route path="/auctions" element={<AuctionPage />} />
                <Route path="/rides" element={<Rides />} />
                <Route path="/" element={<Navigate to="/marketplace" replace />} />
                <Route path="*" element={
                  <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold mb-4">Pagina non trovata</h1>
                    <p className="mb-8">La pagina che stai cercando non esiste o è stata spostata.</p>
                    <a href="/marketplace" className="px-4 py-2 bg-primary-500 text-white rounded-lg">
                      Torna al marketplace
                    </a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ProviderProvider>
    </Router>
  );
};

export default App;