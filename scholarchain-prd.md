# PRD 01: ScholarChain

**Tagline:** Transparent scholarships. Donors fund students in USDT, funds release in tranches as verified progress is recorded on-chain.
**Target:** BOT Chain Testnet (chain ID 968)
**Stack:** Solidity ^0.8.24, Foundry (forge), OpenZeppelin v5, Next.js (App Router), ethers v6

---

## 0. Common setup (same in every PRD)

| Item | Value |
|---|---|
| Network | BOT Chain Testnet |
| Chain ID | 968 (hex `0x3C8`) |
| RPC | `https://rpc.bohr.life` |
| Explorer | `https://scan.bohr.life` |
| Native token | tBOT (gas). Faucet: `https://faucet.botchain.ai/basic`, 10 tBOT per address per 24h |
| USDT (testnet) | `0x75edC9335175Fc0552D51D48439F229c10420fe3` |

Rules for the whole build:
- The docs do not state USDT decimals. Always read `decimals()` from the token. Never hardcode 6 or 18.
- How you get test USDT is not documented. Day 1: check the faucet and bridge pages. If you cannot get any, deploy your own `MockUSDT` with the same interface and set `NEXT_PUBLIC_USDT_ADDRESS` in env. Put this in your README.
- Do not rely on `eth_getLogs` for core data (it is disabled on the official mainnet RPC; assume the same caution on testnet). Store data in contract state and read it with paginated view functions. Events are a bonus for the explorer.
- Deploy with: `forge script script/Deploy.s.sol --rpc-url https://rpc.bohr.life --broadcast --private-key $PRIVATE_KEY`. If you get an EIP-1559 or gas price error, add `--legacy`.
- You have limited tBOT (10 per day per address). Deploy sparingly, test locally with `forge test` first.

---

## 1. Overview

Scholarship money often disappears into opaque channels. ScholarChain lets a school-approved student create a scholarship fund, lets anyone donate USDT, and releases money to the student in tranches only after a verifier (the school) records progress on-chain. Each scholarship is represented by a non-transferable NFT that holds the student's public progress record.

**Goal for the program review:** a working end-to-end flow: create, donate, report progress, release tranche, view public progress page.

## 2. Assumptions (decisions already made, change if you disagree)

1. **Verifier model:** An admin registers approved schools (Verifiers). Only the verifier assigned to a scholarship can post progress reports for it.
2. **Funds release in tranches.** Total target is split into N equal tranches. A tranche releases when the verifier posts a passing report for that term.
3. **Privacy:** Real grades are NOT stored on-chain. Each report stores a `gradeBand` (0 to 4) and a `reportHash` of the off-chain report document. Student name is not stored; only a display alias and an optional IPFS metadata hash.
4. **The NFT is the scholarship record.** It is minted to the student, non-transferable (soulbound), and holds the scholarship ID. Donors do not get NFTs in MVP (they appear in a donor ledger).
5. **Currency:** USDT only.
6. **Refunds:** If a scholarship is cancelled, donors can claim a pro-rata refund of unreleased funds.

## 3. Users and roles

| Role | How assigned | Can do |
|---|---|---|
| Admin | Deployer | Add/remove verifiers, cancel scholarship, pause |
| Verifier (school) | Admin adds | Create scholarships for students, post progress reports |
| Student | Address in scholarship | View funds, withdraw released tranches |
| Donor | Anyone | Donate USDT, view impact, claim refund on cancel |

## 4. User stories

- As a verifier, I create a scholarship for a student with a target amount, number of terms, and minimum passing grade band.
- As a donor, I browse open scholarships, see progress, and donate USDT.
- As a verifier, I post a term report (grade band + report hash) so the next tranche unlocks.
- As a student, I withdraw each unlocked tranche to my wallet.
- As anyone, I open a public page that shows a scholarship's funding, reports, and tranches released.
- As a donor, if a scholarship is cancelled, I claim my share of what remains.

## 5. Scope

**MVP (build this):** verifier registry, create scholarship, donate, post report, release and withdraw tranche, soulbound NFT, cancel and refund, public progress page, donor dashboard.

**Out of scope:** real KYC of students, fiat on-ramp, multi-token support, governance, gasless transactions.

## 6. Smart contract specification

### 6.1 Contracts

1. `ScholarVault.sol` (core logic, holds USDT)
2. `ScholarNFT.sol` (ERC721, soulbound, minted by the vault)
3. `MockUSDT.sol` (for tests only, in `test/mocks`)

### 6.2 Data structures

```solidity
enum Status { Open, Active, Completed, Cancelled }

struct Scholarship {
    uint256 id;
    address student;
    address verifier;
    string alias;            // display name, not real name
    string metadataCid;      // optional IPFS CID
    uint256 target;          // total USDT target
    uint8 terms;             // number of tranches
    uint8 minGradeBand;      // minimum band to pass a term
    uint256 raised;          // total donated
    uint256 released;        // total unlocked for student
    uint256 withdrawn;       // total withdrawn by student
    uint8 termsCompleted;
    Status status;
}

struct Report {
    uint8 term;
    uint8 gradeBand;         // 0..4
    bytes32 reportHash;
    uint64 timestamp;
}
```

State:
- `mapping(uint256 => Scholarship) scholarships`
- `mapping(uint256 => Report[]) reports`
- `mapping(uint256 => mapping(address => uint256)) donations`
- `mapping(address => bool) isVerifier`
- `uint256 nextId`, `IERC20 usdt`

### 6.3 Functions

| Function | Access | Behavior |
|---|---|---|
| `addVerifier(address)` / `removeVerifier(address)` | Admin | Manage schools |
| `createScholarship(address student, string alias, string metadataCid, uint256 target, uint8 terms, uint8 minGradeBand)` | Verifier | Validates `terms` in 1..12, `target > 0`; mints soulbound NFT to student; status Open |
| `donate(uint256 id, uint256 amount)` | Anyone | `transferFrom` USDT to vault; `raised += amount`; records donor amount; reverts if cancelled or `raised + amount > target` (or accept and cap; choose revert for simplicity); status becomes Active once raised >= target |
| `postReport(uint256 id, uint8 gradeBand, bytes32 reportHash)` | The scholarship's verifier | Term = `termsCompleted + 1`; stores report; if `gradeBand >= minGradeBand`, increments `termsCompleted` and sets `released = raised * termsCompleted / terms`; if all terms done, status Completed |
| `withdraw(uint256 id)` | Student | Sends `released - withdrawn` USDT to student; nonReentrant |
| `cancel(uint256 id)` | Admin or verifier | Status Cancelled; stops donations and releases |
| `claimRefund(uint256 id)` | Donor | If cancelled: refund = `donations[id][msg] * (raised - released) / raised`; zero out donation entry first |
| `getScholarship(id)`, `getReports(id)`, `listScholarships(offset, limit)` | View | Pagination for the frontend |
| `getDonation(id, donor)` | View | Donor amount |

Notes:
- Funds still raised but not yet at target are not released until the verifier posts a passing report. A report before funding reaches target should revert (`NotFunded`) to keep logic simple.
- Use custom errors, `ReentrancyGuard`, `SafeERC20`, and checks-effects-interactions.
- NFT `_update` override: revert on any transfer where `from != address(0)` (soulbound). Provide `tokenURI` returning a simple on-chain JSON or the metadata CID.

### 6.4 Events

`VerifierAdded`, `ScholarshipCreated(id, student, verifier, target)`, `Donated(id, donor, amount)`, `ReportPosted(id, term, gradeBand, reportHash)`, `TrancheReleased(id, termsCompleted, released)`, `Withdrawn(id, student, amount)`, `Cancelled(id)`, `Refunded(id, donor, amount)`.

### 6.5 Security checklist

- Only verifier of that scholarship can report. Student cannot be their own verifier (revert).
- Rounding: compute released with multiplication before division; final term releases the exact remainder (`raised`) to avoid dust.
- No admin function can move user funds except via the defined cancel and refund flow.

## 7. Frontend specification (Next.js + ethers v6)

### 7.1 Pages

| Route | Purpose |
|---|---|
| `/` | Landing, how it works, featured scholarships |
| `/scholarships` | Paginated list, progress bars, filter by status |
| `/scholarships/[id]` | Public progress page: funding bar, tranche timeline, reports (band + hash), donate box |
| `/donor` | My donations, refund button if cancelled |
| `/student` | My scholarship(s), withdrawable amount, withdraw button |
| `/verifier` | Create scholarship form, post report form (only visible to verifiers) |
| `/admin` | Add/remove verifiers, cancel |

### 7.2 Components and behavior

- `ConnectButton`: uses `BrowserProvider(window.ethereum)`. If chain is not 968, call `wallet_switchEthereumChain`, falling back to `wallet_addEthereumChain` with chainId `0x3C8`, RPC `https://rpc.bohr.life`, explorer `https://scan.bohr.life`, currency BOT 18 decimals.
- `useContracts()`: returns vault and USDT contracts. Read-only calls use `JsonRpcProvider("https://rpc.bohr.life")` so pages load without a wallet.
- Donate flow: two steps with clear UI: (1) `approve` (skip if allowance is enough), (2) `donate`. Show pending and confirmed states with explorer links.
- Format all money using USDT `decimals()` read once and cached.
- Show roles from `isVerifier` and admin check to display the right nav items.
- Error handling: map custom errors to readable messages (decode with the contract interface).

### 7.3 UX details reviewers notice

- Empty, loading and error states for every list.
- Transaction toast with hash link to `scan.bohr.life`.
- Mobile layout works.
- A "How verification works" panel on the scholarship page explaining that grade details stay off-chain and only a hash is public.

## 8. Off-chain data

- Optional student metadata JSON (alias, school name, story) on IPFS. For the demo you may host it as a static JSON in `/public/metadata`.
- Report documents are not uploaded anywhere. The verifier UI hashes a selected file in the browser (`keccak256` via ethers) and sends only the hash.

## 9. Foundry test plan (`forge test`)

- Verifier management: only admin can add or remove.
- Create: non-verifier reverts; invalid terms and target revert; NFT minted to student.
- NFT is non-transferable (transfer and approve+transferFrom revert).
- Donate: accumulates, cannot exceed target, cannot after cancel.
- Report: wrong verifier reverts; failing grade does not advance; passing grade releases the right amount; last term releases exact remainder.
- Withdraw: only student, correct amount, cannot double withdraw.
- Cancel and refund: pro-rata math with two donors, cannot refund twice.
- Fuzz: `donate` with random amounts and `postReport` sequences; invariant: `withdrawn <= released <= raised` and vault USDT balance >= unreleased + unwithdrawn.

## 10. Project structure

```
scholarchain/
  contracts/ (foundry)
    src/ScholarVault.sol, ScholarNFT.sol
    test/ScholarVault.t.sol, mocks/MockUSDT.sol
    script/Deploy.s.sol
    foundry.toml
  web/ (next.js)
    app/ ...pages above
    lib/chain.ts, contracts.ts, abis/
    components/
  README.md
```

Env: `PRIVATE_KEY`, `NEXT_PUBLIC_VAULT_ADDRESS`, `NEXT_PUBLIC_NFT_ADDRESS`, `NEXT_PUBLIC_USDT_ADDRESS`, `NEXT_PUBLIC_RPC=https://rpc.bohr.life`.

## 11. Build order (suggested)

1. Contracts + tests locally (core of the review).
2. Deploy script, deploy to testnet, verify addresses in README.
3. Frontend: connect, list, detail, donate.
4. Verifier and student pages.
5. Admin, donor refund, polish, README with screenshots and a demo walkthrough.

## 12. Acceptance criteria

- [ ] All forge tests pass, including fuzz tests.
- [ ] Deployed on testnet with addresses in README and links to the explorer.
- [ ] Full flow works from the UI: create, donate, report, withdraw.
- [ ] Soulbound NFT cannot be transferred.
- [ ] No hardcoded USDT decimals.
- [ ] README explains architecture, roles, and what is on-chain vs off-chain.

## 13. Risks and notes

- Test USDT availability is undocumented. Have the MockUSDT fallback ready.
- Real verification of schools is out of scope. Say clearly in the README that the admin is a trusted role in this demo.
