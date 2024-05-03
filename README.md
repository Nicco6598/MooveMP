# MooveMP

Benvenuti al repository del MooveMP, una piattaforma innovativa sviluppata da Moove, dove gli utenti possono acquistare, vendere e scambiare NFT legati al tema dei viaggi.

## Tecnologie Utilizzate

- **Blockchain**: Ethereum (Rete Sepolia)
- **Smart Contract**: Solidity
- **Ambiente di Sviluppo**: Hardhat
- **Frontend**: React (Create React App)

## Struttura del Progetto

- `contracts/`: Contiene i contratti intelligenti del marketplace.
- `artifacts/`: Contiene il JSON Abi per richiamare le funzioni del contratto.
- `nft_frontend/`: Codice sorgente dell'interfaccia utente, costruita con React.
- `test/`: Test per i contratti intelligenti utilizzando Hardhat.

## Setup Iniziale

Prerequisiti: È necessario avere installato [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) e [Hardhat](https://hardhat.org/getting-started/).

1. Clona il repository:
   ```bash
   git clone [https://github.com/Nicco6598/MooveMP.git]
   cd MooveMp
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Compila i contratti:
   ```bash
   npx hardhat compile
   ```

4. Lancia i test dei contratti:
   ```bash
   npx hardhat test
   ```

5. Deploy dei contratti su Sepolia:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```

### Uso del Marketplace

Per avviare l'interfaccia utente:

1. Vai alla cartella del frontend:
   ```bash
   cd nft_frontend
   ```

2. Avvia l'applicazione React:
   ```bash
   npm start
   ```

L'applicazione sarà disponibile all'indirizzo [http://localhost:3000](http://localhost:3000).

### Smart Contract

Il contratto principale `MooveNFT.sol` gestisce la creazione e la vendita di NFT. Qui sotto trovi l'indirizzo del contratto su Sepolia e un esempio di un NFT:

- Address: [0xFE95943310e47129CDC7eEb3722119C599C7a1Cb](https://sepolia.etherscan.io/address/0xFE95943310e47129CDC7eEb3722119C599C7a1Cb "Indirizzo del Contratto")
- Esempio di NFT:
  - Token ID: 0
  - Address Token: [0xfe95943310e47129cdc7eeb3722119c599c7a1cb/#0](https://sepolia.etherscan.io/nft/0xfe95943310e47129cdc7eeb3722119c599c7a1cb/0 "Indirizzo dell'NFT #0")

## Amministrazione

### Deploy del Contratto e Configurazione dell'Admin Moove

Per effettuare il deploy del contratto e quindi diventare l'Admin Moove (l'entità che ha il permesso di mintare NFT), segui queste istruzioni:

### Utilizzo di Hardhat

1. **Configurazione del progetto**:
   - Assicurati di avere un file `.env` nella root del tuo progetto Hardhat che contiene le chiavi private del tuo wallet e l'API key per un provider come Infura. Questo permetterà di interagire con la blockchain.
   - Aggiorna il file `hardhat.config.ts` per includere le configurazioni della rete Sepolia, facendo riferimento alle credenziali nel file `.env`.

2. **Deploy**:
   - Crea una folder scripts con all'interno un file deploy.ts (`scripts/deploy.ts`) (puoi tranquillamente generarlo con qualsiasi chatbot AI oppure cercarlo su Guthub/   Stackoverflow), poi eseguilo utilizzando il comando:
     ```bash
     npx hardhat run scripts/deploy.ts --network sepolia
     ```
   - Al termine del deploy, lo script stamperà l'indirizzo del contratto deployato. Assicurati di annotarlo.

3. **Diventare Admin Moove**:
   - Una volta effettuato il deploy sarai automaticamente l'admin di Moove che potrà mintare gli NFT (Ovvero l'*OWNER* del contratto).

### Utilizzo di Remix con Injected Web3 Provider

1. **Configurazione**:
   - Connettiti a Remix utilizzando un browser compatibile con un wallet come MetaMask.
   - Assicurati che il tuo wallet sia collegato alla rete Sepolia.

2. **Caricamento e compilazione del contratto**:
   - Carica i file del contratto nel tuo workspace su Remix.
   - Compila il contratto utilizzando la versione corretta del compilatore.

3. **Deploy**:
   - Nella sezione "Deploy & Run Transactions" di Remix, seleziona "Injected Web3" come ambiente.
   - Scegli il contratto da deployare e clicca su "Deploy".
   - Conferma la transazione nel tuo wallet.

### Verifica

Dopo aver completato il deploy, è possibile interagire con il contratto attraverso il frontend o direttamente tramite uno script Hardhat o la console di Remix per mintare i tuoi NFT.


## Frontend del Marketplace

Il frontend del TravelNFT Marketplace è costruito con React e offre diverse pagine attraverso cui gli utenti possono interagire con i servizi offerti dalla piattaforma. Di seguito vengono descritte le principali pagine del sito e le loro funzionalità:

### Home Page

- **URL**: `/`
- **Descrizione**: La Home Page fornisce una panoramica generale del marketplace. Include tutti gli NFT sia in vendita che non, è possibile acquistarli direttamente o visualizzarne i dettagli.
- **Funzionalità principali**:
  - Visualizzazione degli NFT in evidenza.
  - Link rapido ai dettagli del singolo NFT.

### Minting NFT

- **URL**: `/mint`
- **Descrizione**: Questa pagina permette all'admin di Moove (Owner del contratto) di mintari nuovi NFT con le caratteristiche desiderate a un prezzo scelto al momento del minting.
- **Funzionalità principali**:
  - Minting NFT's.
  - Opzioni per aggiunta caratterstiche e prezzo.

### Pagina Dettaglio NFT

- **URL**: `/nft/:id`
- **Descrizione**: La pagina di dettaglio mostra tutte le informazioni relative a un singolo NFT, inclusi metadati dettagliati e possibilità di acquistarlo o metterlo in asta se si è i proprietari.
- **Funzionalità principali**:
  - Visualizzazione completa dell'immagine NFT e delle specifiche.
  - Opzione per acquistare o fare offerte per l'NFT.

### Cronologia Acquisti/Vendite

- **URL**: `/history`
- **Descrizione**: Una lista con lo storico ordinato cronologicamente delle vendite o degli acquisti effetuati dal wallet connesso.
- **Funzionalità principali**:
  - Accesso alla cronologia delle transazioni personali.
  - Visualizzazione data, buyer, seller e prezzo di acquisto/vendita.

### Pagina NFT posseduti

- **URL**: `/owned`
- **Descrizione**: Una pagina dedicata alla visualizzazione degli NFT posseduti dal wallet connesso.
- **Funzionalità principali**:
  - Visualizzazione NFT posseduti con metadati.
  - Opzione per visualizzarne i dettagli specifici.

## Tecnologie Frontend Utilizzate

Il frontend è sviluppato utilizzando le seguenti tecnologie:
- **React**: Libreria JavaScript per la costruzione dell'interfaccia utente.
- **Web3.js/Ethers.js**: Per l'interazione con la blockchain Ethereum.
- **Tailwind CSS**: Framework CSS per il design responsivo e moderno.

# Licenza

Questo progetto è rilasciato sotto la Licenza MIT. Per i dettagli completi, consulta il file [LICENSE](LICENSE).