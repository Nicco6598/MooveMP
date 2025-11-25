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
  <div className="flex justify-center items-center min-h-screen bg-neutral-950">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-2 border-neutral-800 border-t-accent-500"></div>
      <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-accent-500"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <ProviderProvider>
        <div className="flex flex-col min-h-screen bg-neutral-950 bg-hero-glow">
          <Navbar />
          <main className="flex-grow">
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
                  <div className="container mx-auto max-w-7xl px-4 py-24 text-center">
                    <div className="glass-card rounded-3xl p-12 max-w-lg mx-auto">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h1 className="text-3xl font-bold text-white mb-3">404</h1>
                      <p className="text-neutral-400 mb-8">La pagina che stai cercando non esiste o è stata spostata.</p>
                      <a href="/marketplace" className="btn-primary inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Torna al marketplace
                      </a>
                    </div>
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

