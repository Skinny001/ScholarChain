# 🎓 ScholarChain

ScholarChain is a decentralized platform that brings complete transparency, accountability, and cryptographic trust to student scholarships. 

Instead of handing over bulk cash directly to students—where donors have zero visibility into how their funds are spent—ScholarChain holds all donations securely in an on-chain escrow smart contract. Funds are divided into "tranches" and are only released when students prove they have achieved their academic milestones (like uploading passing grades or tuition receipts to IPFS).

Built for the **BOT Chain Testnet**.

## ✨ Features

- **Transparent Escrow:** Donors give USDT to a student's scholarship pool. The funds are held in a trustless smart contract.
- **Milestone-Based Funding:** Students do not receive the money all at once. Funding is divided into three equal tranches.
- **Decentralized Storage (IPFS):** Scholarship metadata and student milestone proofs (like PDFs or receipts) are pinned permanently to IPFS via Pinata.
- **Admin Review Dashboard:** Verifiers can view submitted proofs on-chain and trigger the release of funds with a single click.
- **Sleek Web3 UI:** Built using Next.js 14, TailwindCSS, and Ethers.js for a seamless user experience.

---

## 🔗 Deployed Contracts (BOT Chain Testnet)

The platform is fully live on the BOT Chain Testnet.

- **Scholar Vault (Core Logic):** `0x7Ff7E3523846B293b3B3C3926bcf2eA983E13e9c`
- **Scholar NFT (Credentials):** `0x5abe6B88ebF5986efD71Df338503fd99E66DCA9B`
- **Mock USDT (Test Token):** `0x27AfcC1b6C645acF64b67f19C98ed48641aC37A8`

**Network Details:**
- **Network Name:** BOT Chain Testnet
- **RPC URL:** `https://rpc.bohr.life`
- **Chain ID:** `968`
- **Symbol:** `BOHR`

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Blockchain Interaction:** Ethers.js v6
- **Smart Contracts:** Solidity, Foundry (Forge)
- **Decentralized Storage:** IPFS (via Pinata)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/scholar-chain.git
cd scholar-chain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
NEXT_PUBLIC_USDT_ADDRESS=0x27AfcC1b6C645acF64b67f19C98ed48641aC37A8
NEXT_PUBLIC_VAULT_ADDRESS=0x7Ff7E3523846B293b3B3C3926bcf2eA983E13e9c
NEXT_PUBLIC_NFT_ADDRESS=0x5abe6B88ebF5986efD71Df338503fd99E66DCA9B
NEXT_PUBLIC_RPC=https://rpc.bohr.life

# Add your Pinata JWT here for IPFS uploads
PINATA_JWT=your_pinata_jwt_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 👥 How to use the platform

### For Donors
1. Connect your MetaMask wallet (make sure you are on the BOT Chain Testnet).
2. Browse active, verified scholarships.
3. Click "Support student" to donate Test USDT directly into their smart contract escrow pool.

### For Students
1. Connect the wallet address that the Admin registered for you.
2. The "My Scholarship" tab will appear in the navigation bar.
3. Once you hit an academic milestone, click "Submit Milestone Proof" and provide a link to your receipt or transcript.

### For Admins (Verifiers)
1. Connect the Admin wallet (the wallet that deployed the contract).
2. The "Admin Review" tab will appear in the navigation bar.
3. Review proofs submitted by students. 
4. Click "Release Tranche" to approve the proof and instantly release funds from the escrow vault to the student.

---

## 📜 License
MIT
