# TRUSETT — Presentation Script

**Presenter:** Mariem El Bahat  
**Pitch target:** 3–4 minutes  
**One-line description:** TRUSETT protects digital-service payments by combining USDC escrow, delivery evidence, and a structured dispute process on Hedera.

## Speaking script

### Slide 1 — Introduction

“Good morning/afternoon, everyone. My name is Mariem El Bahat, and today I’m presenting TRUSETT — a payment-protection solution for online work.

Our idea comes from a simple problem: sending money online is easy, but making sure both sides keep their promises is much harder. TRUSETT aims to make digital transactions safer for both buyers and sellers.”

### Slide 2 — The problem

“Imagine hiring someone online to build a website or design an application. The buyer may worry about paying upfront and never receiving the work. At the same time, the freelancer may worry about completing the project and never getting paid.

A normal wallet transfer can confirm that money has moved, but it does not decide whether the agreed work was actually delivered. When something goes wrong, both sides are often left with messages, screenshots, and informal negotiations. That is the gap we want to address.”

### Slide 3 — Who needs it?

“We are initially focusing on freelancers and small digital agencies that work with remote clients. Their projects usually have a price, a deadline, and specific deliverables. This makes them a practical starting point for a structured payment-protection process.

We want to start with this focused group, understand how they currently handle payment disputes, and validate whether they would use a solution like TRUSETT.”

### Slide 4 — How TRUSETT works

“Here is how the process works. First, the buyer and seller create a deal and agree on the amount, deliverables, deadline, and acceptance conditions.

The buyer deposits the agreed USDC into escrow. The seller then completes the work and submits delivery evidence. The buyer can review and accept the work, or open a dispute if something does not match the agreement.

This is where TRUSETT adds another layer. AI helps organize the submitted evidence, summarize the situation, and highlight possible gaps. However, AI does not make the final decision. An authorized human arbiter reviews the case and decides the outcome. The escrow contract then follows the permitted result: releasing the funds, refunding the buyer, or splitting the payment where supported.”

### Slide 5 — Why Hedera?

“We chose Hedera because its services fit different parts of this process. Smart contracts manage the escrow rules and settlement logic. Hedera Token Service supports the token interactions, while Hedera Consensus Service records important events so the transaction history can be inspected.

We also keep private documents and personal information off-chain. This helps us separate the payment and audit process from sensitive evidence. AI assists the reviewer, but the contract and authorized roles govern settlement.”

### Slide 6 — Business model and next steps

“Our planned business model includes a small fee on completed protected transactions, optional dispute-resolution fees, and future integrations for agencies or platforms.

Our next priorities are to test the complete payment flow, validate the need with freelancers and agencies, improve the dispute experience, and have the smart contracts reviewed for security. We want to build something people can rely on, not just something that looks good in a demo.”

### Slide 7 — Closing

“To conclude, TRUSETT is built around one idea: a payment should not be the end of the trust process.

By bringing agreed terms, escrow, delivery evidence, and dispute resolution into one workflow, we want to make online work safer and fairer for both sides.

Thank you for your time. I’m happy to answer your questions.”

## Simple demo flow

1. Create a deal and show the agreed terms.
2. Show the escrow deposit **only if it has actually succeeded**.
3. Switch to the seller view and show delivery evidence.
4. Switch to the buyer view and show acceptance or dispute.
5. Show the AI summary and explain that a human makes the final decision.
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
