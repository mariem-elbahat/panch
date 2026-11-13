import json
import os
import time
from typing import Dict, List, Optional
from .models import Deal, DealState, Deliverable, EvidenceAttachment, TimelineEvent

STORAGE_DIR = os.path.join(os.path.dirname(__file__), "data")
STORAGE_FILE = os.path.join(STORAGE_DIR, "deals_db.json")
TIMELINE_FILE = os.path.join(STORAGE_DIR, "timeline_db.json")

class Storage:
    def __init__(self):
        os.makedirs(STORAGE_DIR, exist_ok=True)
        self.deals: Dict[str, Deal] = {}
        self.timeline_events: List[TimelineEvent] = []
        self._load()
        if not self.deals:
            self.seed_sample_deals()

    def _load(self):
        if os.path.exists(STORAGE_FILE):
            try:
                with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.deals = {k: Deal(**v) for k, v in data.items()}
            except Exception as e:
                print(f"[Storage] Error loading deals: {e}")
                self.deals = {}

        if os.path.exists(TIMELINE_FILE):
            try:
                with open(TIMELINE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.timeline_events = [TimelineEvent(**v) for v in data]
            except Exception as e:
                print(f"[Storage] Error loading timeline: {e}")
                self.timeline_events = []

    def _save(self):
        try:
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump({k: v.model_dump() for k, v in self.deals.items()}, f, indent=2)
            with open(TIMELINE_FILE, "w", encoding="utf-8") as f:
                json.dump([e.model_dump() for e in self.timeline_events], f, indent=2)
        except Exception as e:
            print(f"[Storage] Error saving state: {e}")

    def get_all_deals(self) -> List[Deal]:
        return list(self.deals.values())

    def get_deal(self, deal_id: str) -> Optional[Deal]:
        return self.deals.get(deal_id)

    def save_deal(self, deal: Deal):
        self.deals[deal.id] = deal
        self._save()

    def add_timeline_event(self, event: TimelineEvent):
        self.timeline_events.insert(0, event) # newest first
        self._save()

    def get_deal_timeline(self, deal_id: str) -> List[TimelineEvent]:
        return [e for e in self.timeline_events if e.deal_id == deal_id]

    def get_all_timeline(self) -> List[TimelineEvent]:
        return self.timeline_events

    def seed_sample_deals(self):
        """Pre-seeds 3 realistic deals reflecting the exact target market from the presentation."""
        now = int(time.time())

        # Deal 1: Brand New Agreement (Ready to test Escrow Deposit)
        deal1 = Deal(
            id="TRU-2026-001",
            title="Fintech Mobile App UI/UX Redesign",
            description="Complete Figma redesign of user onboarding, asset custody screens, and payment checkout flow with mobile auto-layout tokens.",
            service_category="Product Design",
            buyer_address="0.0.482910",
            buyer_name="Alice Chen (Fintech Founder)",
            seller_address="0.0.519283",
            seller_name="Bob Martinez (Design Agency Lead)",
            arbiter_address="0.0.381042",
            arbiter_name="Carol Vance (Certified Arbiter)",
            amount_usdc=2500.0,
            deadline_timestamp=now + (7 * 86400), # 7 days future
            acceptance_criteria="Figma workspace must include responsive auto-layout tokens (iOS 390px, Android 360px), interactive prototype, and exported SVG icon library.",
            state=DealState.CREATED,
            created_at=now - 86400,
            deliverables=[
                Deliverable(id="d1-1", title="User Flow & Wireframe Specs", is_completed=True),
                Deliverable(id="d1-2", title="High-Fidelity Onboarding Components", is_completed=False),
                Deliverable(id="d1-3", title="Design System Styleguide & Tokens", is_completed=False)
            ],
            is_demo=True
        )

        # Deal 2: Delivered Milestone (Ready to test Acceptance OR Dispute)
        deal2 = Deal(
            id="TRU-2026-002",
            title="Smart Contract Security Audit & Fixes",
            description="Comprehensive security assessment of EVM & Hedera Smart Contract escrow functions, reentrancy analysis, and gas optimization.",
            service_category="Security & Engineering",
            buyer_address="0.0.482910",
            buyer_name="Alice Chen (Fintech Founder)",
            seller_address="0.0.519283",
            seller_name="Bob Martinez (Design Agency Lead)",
            arbiter_address="0.0.381042",
            arbiter_name="Carol Vance (Certified Arbiter)",
            amount_usdc=5000.0,
            deadline_timestamp=now + 86400,
            acceptance_criteria="Formal PDF report detailing all High/Med/Low vulnerabilities, Slither analysis logs, and GitHub PR containing remediation patches.",
            state=DealState.DELIVERED,
            created_at=now - (5 * 86400),
            funded_at=now - (4 * 86400),
            delivered_at=now - 3600,
            delivery_notes="Audit completed successfully. Zero critical issues found. PR #14 submitted with gas optimizations and Slither verification passing.",
            deliverables=[
                Deliverable(id="d2-1", title="Automated Static Analysis (Slither)", is_completed=True),
                Deliverable(id="d2-2", title="Manual Reentrancy & Logic Review", is_completed=True),
                Deliverable(id="d2-3", title="Remediation Pull Request on GitHub", is_completed=True)
            ],
            evidence_items=[
                EvidenceAttachment(
                    id="ev-201",
                    uploaded_by="seller",
                    title="Audit_Report_Trusett_v1.0.pdf",
                    description="Formal 24-page security report signed by lead auditor.",
                    url_or_hash="ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
                    created_at=now - 3600
                ),
                EvidenceAttachment(
                    id="ev-202",
                    uploaded_by="seller",
                    title="GitHub PR #14 (Security Patch)",
                    description="Remediation commits addressing findings #1 through #4.",
                    url_or_hash="https://github.com/trusett-demo/contracts/pull/14",
                    created_at=now - 3500
                )
            ],
            is_demo=True
        )

        # Deal 3: Active Dispute (Ready for instant AI Analysis & Arbiter Settlement!)
        deal3 = Deal(
            id="TRU-2026-003",
            title="Brand Identity & Webflow Landing Page",
            description="Visual branding suite including logo mark, typography hierarchy, and a responsive Webflow landing page with custom CMS integration.",
            service_category="Brand & Web",
            buyer_address="0.0.482910",
            buyer_name="Alice Chen (Fintech Founder)",
            seller_address="0.0.519283",
            seller_name="Bob Martinez (Design Agency Lead)",
            arbiter_address="0.0.381042",
            arbiter_name="Carol Vance (Certified Arbiter)",
            amount_usdc=1800.0,
            deadline_timestamp=now - 7200, # overdue by 2 hours
            acceptance_criteria="Responsive Webflow page passing PageSpeed >90, custom typography licensing transferred, and functional newsletter form integration.",
            state=DealState.DISPUTED,
            created_at=now - (6 * 86400),
            funded_at=now - (5 * 86400),
            delivered_at=now - 7200,
            delivery_notes="Webflow site published to staging. Brand vector assets exported in Figma.",
            dispute_reason="Incomplete Mobile Breakpoints & Missing CMS Form Integration",
            dispute_claim_details="The staging site crashes on mobile viewport (<480px) and the newsletter signup form does not write to the agreed webhook endpoint. Seller stopped responding to revision requests.",
            deliverables=[
                Deliverable(id="d3-1", title="Vector Logo Mark & Brand Guidelines", is_completed=True),
                Deliverable(id="d3-2", title="Webflow Desktop Landing Layout", is_completed=True),
                Deliverable(id="d3-3", title="Mobile Responsive Optimization & Form Hook", is_completed=False)
            ],
            evidence_items=[
                EvidenceAttachment(
                    id="ev-301",
                    uploaded_by="buyer",
                    title="Mobile_Breakpoint_Overflow_Bug.mp4",
                    description="Screen recording showing text truncation and layout breakage on iPhone 15 Safari.",
                    url_or_hash="ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
                    created_at=now - 5000
                ),
                EvidenceAttachment(
                    id="ev-302",
                    uploaded_by="seller",
                    title="Figma_Brand_Assets_Master.fig",
                    description="Completed logo variants, typography licenses, and vector source components.",
                    url_or_hash="https://figma.com/@trusett/brand-master-export",
                    created_at=now - 7100
                )
            ],
            is_demo=True
        )

        self.deals = {
            deal1.id: deal1,
            deal2.id: deal2,
            deal3.id: deal3
        }

        # Seed initial timeline events
        self.timeline_events = [
            TimelineEvent(
                id="evt-001",
                deal_id="TRU-2026-003",
                event_type="DISPUTE_RAISED",
                title="Dispute Opened by Buyer",
                description="Alice raised a dispute citing incomplete mobile breakpoints and missing form integration.",
                actor="0.0.482910 (Alice)",
                is_on_chain=False,
                topic_id="0.0.982104",
                hashscan_url="https://hashscan.io/testnet/topic/0.0.982104",
                created_at=now - 5000
            ),
            TimelineEvent(
                id="evt-002",
                deal_id="TRU-2026-002",
                event_type="DELIVERY_SUBMITTED",
                title="Deliverables Submitted by Seller",
                description="Bob submitted audit report PDF and GitHub PR for review.",
                actor="0.0.519283 (Bob)",
                is_on_chain=False,
                topic_id="0.0.982104",
                hashscan_url="https://hashscan.io/testnet/topic/0.0.982104",
                created_at=now - 3600
            ),
            TimelineEvent(
                id="evt-003",
                deal_id="TRU-2026-001",
                event_type="DEAL_CREATED",
                title="Deal Agreement Created",
                description="Alice created a 2,500 USDC protection contract for Fintech App Redesign.",
                actor="0.0.482910 (Alice)",
                is_on_chain=False,
                topic_id="0.0.982104",
                hashscan_url="https://hashscan.io/testnet/topic/0.0.982104",
                created_at=now - 86400
            )
        ]
        self._save()


storage = Storage()
