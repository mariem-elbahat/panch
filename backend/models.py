from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import time

class DealState(str, Enum):
    CREATED = "CREATED"
    FUNDED = "FUNDED"
    DELIVERED = "DELIVERED"
    DISPUTED = "DISPUTED"
    SETTLED = "SETTLED"
    REFUNDED = "REFUNDED"

class ResolutionOutcome(str, Enum):
    RELEASE_TO_SELLER = "RELEASE_TO_SELLER"
    REFUND_TO_BUYER = "REFUND_TO_BUYER"
    SPLIT_SETTLEMENT = "SPLIT_SETTLEMENT"

class Deliverable(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    is_completed: bool = False

class EvidenceAttachment(BaseModel):
    id: str
    uploaded_by: str # 'buyer' or 'seller'
    title: str
    description: str
    url_or_hash: str
    created_at: int = Field(default_factory=lambda: int(time.time()))

class TimelineEvent(BaseModel):
    id: str
    deal_id: str
    event_type: str
    title: str
    description: str
    actor: str
    is_on_chain: bool = False
    transaction_id: Optional[str] = None
    topic_id: Optional[str] = None
    sequence_number: Optional[int] = None
    hashscan_url: Optional[str] = None
    created_at: int = Field(default_factory=lambda: int(time.time()))

class DealCreateRequest(BaseModel):
    title: str
    description: str
    buyer_address: str
    buyer_name: Optional[str] = "Buyer"
    seller_address: str
    seller_name: Optional[str] = "Seller"
    arbiter_address: Optional[str] = "0.0.381042"
    arbiter_name: Optional[str] = "Carol (TRUSETT Certified Arbiter)"
    amount_usdc: float
    deadline_timestamp: int
    deliverables: List[str]
    acceptance_criteria: str
    service_category: Optional[str] = "Design & Development"

class DeliverySubmitRequest(BaseModel):
    notes: str
    attachments: List[EvidenceAttachment] = []

class DisputeRaiseRequest(BaseModel):
    reason: str
    claim_details: str
    attachments: List[EvidenceAttachment] = []

class DisputeResolutionRequest(BaseModel):
    outcome: ResolutionOutcome
    seller_split_percentage: Optional[float] = 50.0 # for SPLIT_SETTLEMENT (0-100)
    arbiter_notes: str

class Deal(BaseModel):
    id: str # e.g. TRU-2026-001
    title: str
    description: str
    service_category: str
    buyer_address: str
    buyer_name: str
    seller_address: str
    seller_name: str
    arbiter_address: str
    arbiter_name: str
    amount_usdc: float
    deadline_timestamp: int
    acceptance_criteria: str
    state: DealState = DealState.CREATED
    created_at: int
    funded_at: Optional[int] = None
    delivered_at: Optional[int] = None
    settled_at: Optional[int] = None
    deliverables: List[Deliverable] = []
    delivery_notes: Optional[str] = None
    dispute_reason: Optional[str] = None
    dispute_claim_details: Optional[str] = None
    evidence_items: List[EvidenceAttachment] = []
    seller_payout_usdc: Optional[float] = None
    buyer_refund_usdc: Optional[float] = None
    hcs_topic_id: Optional[str] = None
    funding_tx_id: Optional[str] = None
    settlement_tx_id: Optional[str] = None
    is_demo: bool = True
