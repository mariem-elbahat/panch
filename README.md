# TRUSETT — Trust Meets Settlement
### Hedera-Powered Payment Protection Protocol for Freelancers & Digital Agencies

[![Hedera](https://img.shields.io/badge/Hedera-HCS%20%7C%20HTS%20%7C%20HSCS-174B3A?style=flat&logo=hedera)](https://hedera.com)
[![Vite](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Vite-2F6B4F?style=flat)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.15-C6DF78?style=flat)](https://fastapi.tiangolo.com)
[![Solidity](https://img.shields.io/badge/Smart%20Contracts-Solidity%200.8.20-1C3028?style=flat)](https://soliditylang.org)

TRUSETT intercepts irreversible stablecoin payments and wraps them in a verifiable milestone escrow, delivery evidence verification, and AI-assisted dispute resolution framework on the **Hedera Network**.

---

## 1. Product Architecture & Hedera Tri-Service Design

```
+---------------------------------------------------------------------------------------+
|                                    OFF-CHAIN LAYER                                    |
|   • React + TypeScript + Vite UI (Warm cream, forest green, modular square geometry)  |
|   • FastAPI Backend API + Local Persistent Database                                    |
|   • Sensitive documents, design files, & client code stay OFF-CHAIN for privacy       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                HEDERA ON-CHAIN LAYER                                  |
|                                                                                       |
|   1. Hedera Smart Contract Service (HSCS)                                             |
|      • `contracts/TrusettEscrow.sol`                                                  |
|      • Manages non-custodial milestone funds custody, deal states, & settlement        |
|      • Validates deadlines, prevents reentrancy, and enforces authorized rulings      |
|                                                                                       |
|   2. Hedera Token Service (HTS)                                                       |
|      • Native USDC token movement (Hedera Testnet Token `0.0.456858`)                 |
|      • Contract automatically executes `associateToken` via precompile `0x167`        |
|                                                                                       |
|   3. Hedera Consensus Service (HCS)                                                   |
|      • Implemented with `hiero_sdk_python` (built upon `hello_panch.py`)              |
|      • Immutable public audit log of all deal milestones & arbitration outcomes       |
|      • Verified via HashScan Testnet Explorer: https://hashscan.io/testnet            |
+---------------------------------------------------------------------------------------+
```

---

## 2. Core Product Screens Built

1. **Dashboard (`/`)**:
   - Live metrics: Total Escrowed USDC, Active Deals, Disputed Deals, and Settled Deals.
   - Quick filter tabs (All, Active, Awaiting Deposit, Disputed, Settled).
   - Real-time consensus audit ticker with links to HashScan.
   - Header with active Role Switcher (Alice, Bob, Carol) and Demo/Testnet mode switcher.

2. **Create Deal Modal**:
   - Deal Title, Category, Scope description, Amount in USDC, and Milestone deadline.
   - Dynamic Deliverables checklist builder.
   - Objective Acceptance criteria definition.
   - Live **Payment Protection Pass** summary preview before confirmation.

3. **Deal Room (`deal-room`)**:
   - Unified transaction workspace with a 5-stage progress indicator:
     `1. Agreement` $\rightarrow$ `2. Escrow Deposit` $\rightarrow$ `3. Delivery` $\rightarrow$ `4. Dispute Review` $\rightarrow$ `5. Settlement`.
   - Role-specific contextual action banner indicating the current user's next step.
   - Deliverables completion checklist & evidence attachment vault.
   - Counterparty accounts and Hedera HCS topic audit link.

4. **Seller Workspace (`seller-workspace`)**:
   - Filtered view for Bob Martinez (Seller / Agency Lead).
   - Submit Delivery notes, attach GitHub PR / Figma links / IPFS hashes, and mark work delivered.

5. **Buyer Workspace (`buyer-workspace`)**:
   - Filtered view for Alice Chen (Buyer / Fintech Founder).
   - Single-click **Deposit USDC into Escrow** simulator / testnet executor.
   - Inspect submitted deliverables, **Accept Delivery & Release Funds**, or **Raise Dispute**.

6. **Dispute Resolution Workspace (`dispute-resolution`)**:
   - 3-column tripartite comparison: Original Agreement vs Buyer Claim vs Seller Defense.
   - **AI Evidence Assistant Panel**:
     - Extracts key claims and deliverables.
     - Detects inconsistencies (e.g. deadline overruns, missing responsive breakpoints).
     - Identifies missing proof elements.
     - Proposes recommended outcome with structured reasoning steps.
     - **Mandatory Guardrail:** Clearly labeled as an informational recommendation; AI never controls funds.
   - **Authorized Arbiter Console**:
     - 3 ruling outcomes: **Release to Seller (100%)**, **Refund to Buyer (100%)**, or **Split Settlement (% slider)**.
     - Mandatory confirmation modal before executing on Hedera.

7. **Audit Timeline (`audit-timeline`)**:
   - Chronological event stream with filters.
   - Clearly labels **Hedera Confirmed (On-Chain)** vs **Local Demo Event**.
   - Displays consensus timestamps, sequence numbers, and direct HashScan topic links.

---

## 3. Quick Start & Execution

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Setup

1. **Install Backend Dependencies:**
   ```powershell
   python -m pip install -r requirements.txt
   ```

2. **Install Frontend Dependencies:**
   ```powershell
   cd frontend
   npm install
   cd ..
   ```

3. **Configure Environment Variables (Optional for Live Testnet):**
   Copy `.env.example` to `.env`:
   ```ini
   OPERATOR_ID=0.0.xxxxxxx
   OPERATOR_KEY=your_private_key_here
   HEDERA_NETWORK=testnet
   USDC_TOKEN_ID=0.0.456858
   DEMO_MODE=true
   ```
   *(By default, `DEMO_MODE=true` allows full end-to-end demonstrations without gas costs or testnet wallet dependencies).*

### Run Application

#### Option A: One-Click Launcher (PowerShell / Windows)
```powershell
.\run_app.ps1
```
Or double-click `run_app.bat`.

#### Option B: Manual Launch
In Terminal 1 (Backend):
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

In Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**.

---

## 4. End-to-End 12-Step Hackathon Demo Walkthrough

Follow this exact flow during demonstrations or judge presentations:

1. **Dashboard & Accounts:** Open http://localhost:5173. Note the 3 pre-seeded deals and the active role indicator (**Alice Chen - Buyer**).
2. **Create a Deal:** Click **+ Create New Deal**. Fill in title (*e.g. "Mobile Banking Checkout SDK"*), 500 USDC, 7 days deadline, add 2 deliverables, and click **Review Deal Summary**.
3. **Confirm & Record:** Click **Confirm & Create Deal**. The deal is established with ID `TRU-2026-XXXX` and logged to the HCS audit stream.
4. **Deposit into Escrow:** In the Deal Room, click **Deposit $500 USDC**. The status changes to `FUNDED`, locking funds in contract custody.
5. **Switch Role to Seller:** In the top-right header, switch active role to **Bob Martinez (Seller)**.
6. **Navigate to Seller Workspace:** Click **Seller** in navigation. Click **Submit Delivery & Evidence**. Enter handover notes and a GitHub PR link. Submit.
7. **Switch Role to Buyer:** Switch role back to **Alice Chen (Buyer)**.
8. **Raise a Dispute:** View the delivered deal. Click **Raise Dispute**. Select *"Incomplete Deliverables"*, enter grievance details, and submit. The status transitions to `DISPUTED`.
9. **Open Dispute Resolution:** Click **Open Dispute Console & AI Analysis**.
10. **Inspect AI Evidence Assistant:** Review the automated cross-reference of agreement vs buyer claims vs seller handover, the discrepancy warnings, and the recommended 60/40 Split Settlement.
11. **Switch Role to Arbiter:** Switch active role in header to **Carol Vance (Certified Arbiter)**.
12. **Execute Settlement Ruling:** Select **Split Settlement**, adjust the slider to 70% Seller / 30% Buyer, enter arbiter rationale notes, and click **Confirm Arbiter Settlement Ruling**.
13. **Verify Final State & Audit Trail:** Confirm final status is `SETTLED` with exact USDC distribution. Open **Audit Trail** to view all recorded events with HashScan links.

---

## 5. Security & Privacy Guardrails

- **Private Files Stay Off-Chain:** Sensitive client source code, design files, and communications remain off-chain; only cryptographic hashes and references are logged to Hedera.
- **Human Authority:** AI serves strictly as an analytical aid. Smart contracts allow only the designated arbiter address to resolve disputes.
- **Zero Key Leaks:** Private keys and personal access tokens are stored in `.env` (which is excluded via `.gitignore`) and are never exposed to the frontend.
- **Honest Mode Representation:** Simulated demo transactions are explicitly labeled as `SIMULATED` or `Local Demo Event`, while live Hedera transactions provide authentic transaction IDs and explorer links.
