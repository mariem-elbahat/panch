# TRUSETT — Quick Presentation Notes

**Pitch target:** 3–4 minutes  
**One-line description:** TRUSETT protects digital-service payments by combining USDC escrow, delivery evidence, and a structured dispute process on Hedera.

## What to say

### 1. Introduction
“Hi everyone. We’re presenting TRUSETT, a payment-protection solution for online work. Our goal is simple: make payments safer for both buyers and sellers.”

### 2. The problem
“Buyers worry about paying and never receiving the work. Sellers worry about delivering the work and not getting paid. A normal wallet transfer moves money, but it does not resolve disagreements about the work.”

### 3. Who needs it?
“We’re starting with freelancers and small digital agencies doing remote projects. Their work usually has clear prices, deadlines, and deliverables, which makes it a practical place to start.”

### 4. How TRUSETT works
“The buyer and seller agree on the work and terms. The buyer deposits USDC into escrow. The seller delivers the work and submits evidence. The buyer accepts it or opens a dispute. AI helps organize the evidence, while an authorized human makes the final decision. The contract then follows the agreed outcome: release, refund, or split payment, if supported.”

### 5. Why Hedera?
“We use Hedera for three jobs: smart contracts manage escrow rules, the token service supports token transfers, and the consensus service records important events. Private documents stay off-chain. AI assists the reviewer; it does not control the money.”

### 6. Business model
“Our planned revenue comes from a small transaction fee, optional dispute-resolution fees, and future integrations for agencies or platforms. Our next priorities are testing the complete payment flow, validating demand with freelancers, and getting the contracts reviewed for security.”

### 7. Closing
“TRUSETT is built on one idea: a payment should not be the end of the trust process. We want to make online work safer and fairer for both sides. Thank you.”

## Simple demo flow

1. Create a deal and show the agreed terms.
2. Show the escrow deposit **only if it has actually succeeded**.
3. Show delivery evidence.
4. Show how a dispute is opened.
5. Show the AI summary and explain that a human decides.
6. Show the settlement or the latest verified transaction.

If something fails, say: “This step has not completed successfully, so I won’t present it as working. I’ll show the last verified step instead.”

## Questions judges may ask

**What problem does TRUSETT solve?**  
It adds an agreement, escrow, evidence, and dispute process around a digital-service payment.

**Why Hedera?**  
We use its smart-contract, token, and consensus services for escrow logic, token handling, and an auditable event history.

**Why use AI?**  
AI summarizes and organizes evidence. It does not make the final decision or release funds by itself.

**Who decides a dispute?**  
An authorized human reviewer, following rules agreed before the deal is funded.

**Can you reverse a normal wallet transfer?**  
No. TRUSETT can only protect funds deposited into its escrow flow before settlement.

**Is the whole product working right now?**  
Be honest. Name only the parts you have tested and show their transaction or deployment proof. Clearly label everything else as in progress.

**How will you earn revenue?**  
Through a transaction fee, optional dispute-resolution fees, and future business integrations.

**What is your biggest challenge?**  
Building a dispute process both sides trust, while keeping the contracts secure and easy to use.

## Remember before presenting

- Know what works and what is still a prototype.
- Keep your contract address, token ID, HCS topic ID, and successful transaction links ready, if available.
- Never claim a payment succeeded unless you can verify it.
- Do not say AI decides who is right.
- Keep the explanation simple: **agree → deposit → deliver → resolve → settle**.
