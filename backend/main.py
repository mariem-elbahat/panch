import time
import uuid
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    Deal, DealState, Deliverable, EvidenceAttachment, TimelineEvent,
    DealCreateRequest, DeliverySubmitRequest, DisputeRaiseRequest,
    DisputeResolutionRequest, ResolutionOutcome
)
from .storage import storage
from .hedera_service import hedera_service
from .ai_assistant import ai_assistant

app = FastAPI(
    title="TRUSETT API",
    description="Hedera-Powered Payment Protection Protocol & Dispute Resolution Engine",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def get_status():
    """Returns network operational status, demo mode flag, and Hedera configuration."""
    return hedera_service.get_status()


class ModeToggleRequest(BaseModel):
    demo_mode: bool

@app.post("/api/mode")
def toggle_mode(req: ModeToggleRequest):
    hedera_service.set_demo_mode(req.demo_mode)
    return {"message": "Mode updated", "status": hedera_service.get_status()}


@app.get("/api/deals", response_model=List[Deal])
def list_deals(
    role: Optional[str] = Query(None, description="Filter by role address: buyer or seller"),
    state: Optional[str] = Query(None, description="Filter by deal state")
):
    deals = storage.get_all_deals()
    if role:
        deals = [d for d in deals if d.buyer_address == role or d.seller_address == role or d.arbiter_address == role]
    if state:
        deals = [d for d in deals if d.state == state]
    return deals


@app.get("/api/deals/{deal_id}", response_model=Deal)
def get_deal(deal_id: str):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@app.post("/api/deals", response_model=Deal)
def create_deal(req: DealCreateRequest):
    now = int(time.time())
    unique_suffix = str(uuid.uuid4())[:4].upper()
    deal_id = f"TRU-2026-{unique_suffix}"

    deliverables = [
        Deliverable(id=f"del-{idx+1}", title=title, is_completed=False)
        for idx, title in enumerate(req.deliverables)
    ]

    deal = Deal(
        id=deal_id,
        title=req.title,
        description=req.description,
        service_category=req.service_category or "Service Contract",
        buyer_address=req.buyer_address,
        buyer_name=req.buyer_name or "Buyer",
        seller_address=req.seller_address,
        seller_name=req.seller_name or "Seller",
        arbiter_address=req.arbiter_address or "0.0.381042",
        arbiter_name=req.arbiter_name or "Carol (TRUSETT Certified Arbiter)",
        amount_usdc=req.amount_usdc,
        deadline_timestamp=req.deadline_timestamp,
        acceptance_criteria=req.acceptance_criteria,
        state=DealState.CREATED,
        created_at=now,
        deliverables=deliverables,
        is_demo=hedera_service.demo_mode
    )

    # Log to HCS
    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="DEAL_CREATED",
        payload={
            "title": deal.title,
            "amount_usdc": deal.amount_usdc,
            "buyer": deal.buyer_address,
            "seller": deal.seller_address,
            "deadline": deal.deadline_timestamp
        }
    )
    deal.hcs_topic_id = hcs_res.get("topic_id")

    storage.save_deal(deal)

    # Record Timeline Event
    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="DEAL_CREATED",
        title="Payment Protection Deal Established",
        description=f"Agreement created for {deal.amount_usdc} USDC. Awaiting buyer escrow deposit.",
        actor=f"{deal.buyer_address} ({deal.buyer_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/deposit", response_model=Deal)
def deposit_escrow(deal_id: str):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.state != DealState.CREATED:
        raise HTTPException(status_code=400, detail=f"Cannot deposit in state {deal.state}")

    now = int(time.time())
    deal.state = DealState.FUNDED
    deal.funded_at = now

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="ESCROW_FUNDED",
        payload={
            "amount_usdc": deal.amount_usdc,
            "token": hedera_service.usdc_token_id,
            "deposited_by": deal.buyer_address,
            "timestamp": now
        }
    )

    deal.funding_tx_id = hcs_res.get("transaction_id")
    storage.save_deal(deal)

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="ESCROW_FUNDED",
        title="USDC Escrow Successfully Funded",
        description=f"{deal.amount_usdc} USDC locked in non-custodial smart contract custody.",
        actor=f"{deal.buyer_address} ({deal.buyer_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/deliver", response_model=Deal)
def submit_delivery(deal_id: str, req: DeliverySubmitRequest):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.state != DealState.FUNDED:
        raise HTTPException(status_code=400, detail=f"Cannot submit delivery in state {deal.state}")

    now = int(time.time())
    deal.state = DealState.DELIVERED
    deal.delivered_at = now
    deal.delivery_notes = req.notes

    # Mark all deliverables completed
    for d in deal.deliverables:
        d.is_completed = True

    if req.attachments:
        deal.evidence_items.extend(req.attachments)

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="DELIVERY_SUBMITTED",
        payload={
            "seller": deal.seller_address,
            "notes": deal.delivery_notes,
            "attachment_count": len(deal.evidence_items),
            "timestamp": now
        }
    )

    storage.save_deal(deal)

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="DELIVERY_SUBMITTED",
        title="Deliverables & Evidence Submitted",
        description="Seller submitted work milestones and proof attachments. Inspection window open.",
        actor=f"{deal.seller_address} ({deal.seller_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/accept", response_model=Deal)
def accept_delivery(deal_id: str):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.state != DealState.DELIVERED:
        raise HTTPException(status_code=400, detail=f"Cannot accept delivery in state {deal.state}")

    now = int(time.time())
    deal.state = DealState.SETTLED
    deal.settled_at = now
    deal.seller_payout_usdc = deal.amount_usdc
    deal.buyer_refund_usdc = 0.0

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="DELIVERY_ACCEPTED",
        payload={
            "buyer": deal.buyer_address,
            "seller_payout": deal.seller_payout_usdc,
            "timestamp": now
        }
    )
    deal.settlement_tx_id = hcs_res.get("transaction_id")
    storage.save_deal(deal)

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="DELIVERY_ACCEPTED",
        title="Delivery Accepted & Settlement Executed",
        description=f"Buyer accepted work. 100% of escrow ({deal.seller_payout_usdc} USDC) released to seller.",
        actor=f"{deal.buyer_address} ({deal.buyer_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/dispute", response_model=Deal)
def raise_dispute(deal_id: str, req: DisputeRaiseRequest):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.state not in [DealState.FUNDED, DealState.DELIVERED]:
        raise HTTPException(status_code=400, detail=f"Cannot raise dispute in state {deal.state}")

    now = int(time.time())
    deal.state = DealState.DISPUTED
    deal.dispute_reason = req.reason
    deal.dispute_claim_details = req.claim_details

    if req.attachments:
        deal.evidence_items.extend(req.attachments)

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="DISPUTE_RAISED",
        payload={
            "raised_by": deal.buyer_address,
            "reason": req.reason,
            "timestamp": now
        }
    )
    storage.save_deal(deal)

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="DISPUTE_RAISED",
        title="Formal Dispute Opened",
        description=f"Reason: {req.reason}. Case referred to designated arbiter with AI analysis assistance.",
        actor=f"{deal.buyer_address} ({deal.buyer_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/evidence", response_model=Deal)
def add_evidence(deal_id: str, attachment: EvidenceAttachment):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal.evidence_items.append(attachment)
    storage.save_deal(deal)

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="EVIDENCE_SUBMITTED",
        payload={
            "uploader": attachment.uploaded_by,
            "title": attachment.title,
            "reference": attachment.url_or_hash
        }
    )

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="EVIDENCE_SUBMITTED",
        title=f"New Evidence Appended by {attachment.uploaded_by.capitalize()}",
        description=f"Artifact: {attachment.title} ({attachment.description})",
        actor=f"{attachment.uploaded_by.capitalize()}",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.post("/api/deals/{deal_id}/ai-analyze")
def analyze_dispute(deal_id: str):
    """Executes AI evidence analysis on agreement, delivery notes, and claims."""
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    analysis = ai_assistant.analyze_dispute(deal)
    return analysis


@app.post("/api/deals/{deal_id}/resolve", response_model=Deal)
def resolve_dispute(deal_id: str, req: DisputeResolutionRequest):
    deal = storage.get_deal(deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if deal.state != DealState.DISPUTED:
        raise HTTPException(status_code=400, detail=f"Cannot resolve deal in state {deal.state}")

    now = int(time.time())
    total_amount = deal.amount_usdc

    if req.outcome == ResolutionOutcome.RELEASE_TO_SELLER:
        deal.state = DealState.SETTLED
        deal.seller_payout_usdc = total_amount
        deal.buyer_refund_usdc = 0.0
    elif req.outcome == ResolutionOutcome.REFUND_TO_BUYER:
        deal.state = DealState.REFUNDED
        deal.seller_payout_usdc = 0.0
        deal.buyer_refund_usdc = total_amount
    elif req.outcome == ResolutionOutcome.SPLIT_SETTLEMENT:
        deal.state = DealState.SETTLED
        split_pct = max(0.0, min(100.0, req.seller_split_percentage or 50.0))
        deal.seller_payout_usdc = round(total_amount * (split_pct / 100.0), 2)
        deal.buyer_refund_usdc = round(total_amount - deal.seller_payout_usdc, 2)
    else:
        raise HTTPException(status_code=400, detail="Unknown resolution outcome")

    deal.settled_at = now

    hcs_res = hedera_service.log_deal_event(
        deal_id=deal_id,
        event_type="ARBITER_RULING",
        payload={
            "arbiter": deal.arbiter_address,
            "outcome": req.outcome.value,
            "seller_payout": deal.seller_payout_usdc,
            "buyer_refund": deal.buyer_refund_usdc,
            "arbiter_notes": req.arbiter_notes,
            "timestamp": now
        }
    )
    deal.settlement_tx_id = hcs_res.get("transaction_id")
    storage.save_deal(deal)

    storage.add_timeline_event(TimelineEvent(
        id=f"evt-{int(time.time()*1000)}",
        deal_id=deal_id,
        event_type="ARBITER_RULING",
        title="Authorized Arbiter Ruling Executed",
        description=f"Ruling: {req.outcome.value}. Payout: {deal.seller_payout_usdc} USDC to Seller, {deal.buyer_refund_usdc} USDC refunded to Buyer. Notes: {req.arbiter_notes}",
        actor=f"{deal.arbiter_address} ({deal.arbiter_name})",
        is_on_chain=hcs_res.get("is_on_chain", False),
        topic_id=hcs_res.get("topic_id"),
        transaction_id=hcs_res.get("transaction_id"),
        sequence_number=hcs_res.get("sequence_number"),
        hashscan_url=hcs_res.get("hashscan_url")
    ))

    return deal


@app.get("/api/deals/{deal_id}/timeline", response_model=List[TimelineEvent])
def get_deal_timeline(deal_id: str):
    return storage.get_deal_timeline(deal_id)


@app.get("/api/timeline", response_model=List[TimelineEvent])
def get_global_timeline():
    return storage.get_all_timeline()


@app.post("/api/seed")
def seed_deals():
    storage.seed_sample_deals()
    return {"message": "Deals re-seeded with realistic sample data", "count": len(storage.deals)}
