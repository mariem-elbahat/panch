export type DealState =
  | 'CREATED'
  | 'FUNDED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'SETTLED'
  | 'REFUNDED';

export const ResolutionOutcome = {
  RELEASE_TO_SELLER: 'RELEASE_TO_SELLER',
  REFUND_TO_BUYER: 'REFUND_TO_BUYER',
  SPLIT_SETTLEMENT: 'SPLIT_SETTLEMENT'
} as const;

export type ResolutionOutcome = (typeof ResolutionOutcome)[keyof typeof ResolutionOutcome];

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
}

export interface EvidenceAttachment {
  id: string;
  uploaded_by: 'buyer' | 'seller';
  title: string;
  description: string;
  url_or_hash: string;
  created_at: number;
}

export interface TimelineEvent {
  id: string;
  deal_id: string;
  event_type: string;
  title: string;
  description: string;
  actor: string;
  is_on_chain: boolean;
  topic_id?: string;
  transaction_id?: string;
  sequence_number?: number;
  hashscan_url?: string;
  created_at: number;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  service_category: string;
  buyer_address: string;
  buyer_name: string;
  seller_address: string;
  seller_name: string;
  arbiter_address: string;
  arbiter_name: string;
  amount_usdc: number;
  deadline_timestamp: number;
  acceptance_criteria: string;
  state: DealState;
  created_at: number;
  funded_at?: number;
  delivered_at?: number;
  settled_at?: number;
  deliverables: Deliverable[];
  delivery_notes?: string;
  dispute_reason?: string;
  dispute_claim_details?: string;
  evidence_items: EvidenceAttachment[];
  seller_payout_usdc?: number;
  buyer_refund_usdc?: number;
  hcs_topic_id?: string;
  funding_tx_id?: string;
  settlement_tx_id?: string;
  is_demo: boolean;
}

export interface SystemStatus {
  demo_mode: boolean;
  is_live_on_chain: boolean;
  network: string;
  operator_configured: boolean;
  operator_id: string;
  active_topic_id: string;
  usdc_token_id: string;
  escrow_contract_id: string;
  sdk_available: boolean;
  hashscan_topic_url?: string;
}

export interface AIAssistantRecommendation {
  outcome: ResolutionOutcome;
  seller_percentage: number;
  buyer_percentage: number;
  seller_amount_usdc: number;
  buyer_refund_usdc: number;
  reasoning: string[];
}

export interface AIAssistantAnalysis {
  analysis_id: string;
  engine: string;
  disclaimer: string;
  agreement_summary: {
    title: string;
    total_escrow_amount: string;
    category: string;
    agreed_deadline: string;
    core_deliverables_count: number;
    deliverables_list: string[];
    acceptance_criteria: string;
  };
  buyer_claims: {
    grievance_category: string;
    buyer_narrative: string;
    evidence_items_submitted: number;
    evidence_titles: string[];
  };
  seller_defense: {
    delivery_notes: string;
    delivered_at: string;
    evidence_items_submitted: number;
    evidence_titles: string[];
  };
  timeline_audit: Array<{
    milestone: string;
    timestamp: number;
    status?: string;
  }>;
  inconsistencies_detected: string[];
  missing_information: string[];
  confidence_score: number;
  recommendation: AIAssistantRecommendation;
}

export interface UserRole {
  id: string;
  name: string;
  roleType: 'buyer' | 'seller' | 'arbiter';
  address: string;
  avatarInitials: string;
  description: string;
}

export const SAMPLE_USERS: UserRole[] = [
  {
    id: 'user-alice',
    name: 'Alice Chen',
    roleType: 'buyer',
    address: '0.0.482910',
    avatarInitials: 'AC',
    description: 'Fintech Founder (Buyer)'
  },
  {
    id: 'user-bob',
    name: 'Bob Martinez',
    roleType: 'seller',
    address: '0.0.519283',
    avatarInitials: 'BM',
    description: 'Design & Dev Agency Lead (Seller)'
  },
  {
    id: 'user-carol',
    name: 'Carol Vance',
    roleType: 'arbiter',
    address: '0.0.381042',
    avatarInitials: 'CV',
    description: 'TRUSETT Certified Arbiter'
  }
];
