import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './pages/Navbar';
import './index.css'; // Importa il foglio di stile di Tailwind CSS
import { ProviderProvider } from './pages/ProviderContext';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleConnectMagicLink = () => {
    // Implementa la logica per la connessione con MagicLink
    // Quando l'utente è connesso con successo, imposta isLoggedIn su true
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div>
        <ProviderProvider>
        <Navbar />
        </ProviderProvider>
      </div>
    </Router>
  );
};

export default App;
