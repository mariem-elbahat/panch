import {
  Deal,
  TimelineEvent,
  SystemStatus,
  AIAssistantAnalysis,
  ResolutionOutcome,
  EvidenceAttachment,
  DealState
} from '../types';

// Default sample deals pre-loaded for instant demo
const DEFAULT_DEALS: Deal[] = [
  {
    id: 'TRU-2026-001',
    title: 'Fintech Mobile App UI/UX Redesign',
    description: 'Complete Figma redesign of user onboarding, asset custody screens, and payment checkout flow with mobile auto-layout tokens.',
    service_category: 'Product Design',
    buyer_address: '0.0.482910',
    buyer_name: 'Alice Chen (Fintech Founder)',
    seller_address: '0.0.519283',
    seller_name: 'Bob Martinez (Design Agency Lead)',
    arbiter_address: '0.0.381042',
    arbiter_name: 'Carol Vance (Certified Arbiter)',
    amount_usdc: 2500.0,
    deadline_timestamp: Math.floor(Date.now() / 1000) + 7 * 86400,
    acceptance_criteria: 'Figma workspace must include responsive auto-layout tokens (iOS 390px, Android 360px), interactive prototype, and exported SVG icon library.',
    state: 'CREATED',
    created_at: Math.floor(Date.now() / 1000) - 86400,
    deliverables: [
      { id: 'd1-1', title: 'User Flow & Wireframe Specs', is_completed: true },
      { id: 'd1-2', title: 'High-Fidelity Onboarding Components', is_completed: false },
      { id: 'd1-3', title: 'Design System Styleguide & Tokens', is_completed: false }
    ],
    evidence_items: [],
    is_demo: true
  },
  {
    id: 'TRU-2026-002',
    title: 'Smart Contract Security Audit & Fixes',
    description: 'Comprehensive security assessment of EVM & Hedera Smart Contract escrow functions, reentrancy analysis, and gas optimization.',
    service_category: 'Security & Engineering',
    buyer_address: '0.0.482910',
    buyer_name: 'Alice Chen (Fintech Founder)',
    seller_address: '0.0.519283',
    seller_name: 'Bob Martinez (Design Agency Lead)',
    arbiter_address: '0.0.381042',
    arbiter_name: 'Carol Vance (Certified Arbiter)',
    amount_usdc: 5000.0,
    deadline_timestamp: Math.floor(Date.now() / 1000) + 86400,
    acceptance_criteria: 'Formal PDF report detailing all High/Med/Low vulnerabilities, Slither analysis logs, and GitHub PR containing remediation patches.',
    state: 'DELIVERED',
    created_at: Math.floor(Date.now() / 1000) - 5 * 86400,
    funded_at: Math.floor(Date.now() / 1000) - 4 * 86400,
    delivered_at: Math.floor(Date.now() / 1000) - 3600,
    delivery_notes: 'Audit completed successfully. Zero critical issues found. PR #14 submitted with gas optimizations and Slither verification passing.',
    deliverables: [
      { id: 'd2-1', title: 'Automated Static Analysis (Slither)', is_completed: true },
      { id: 'd2-2', title: 'Manual Reentrancy & Logic Review', is_completed: true },
      { id: 'd2-3', title: 'Remediation Pull Request on GitHub', is_completed: true }
    ],
    evidence_items: [
      {
        id: 'ev-201',
        uploaded_by: 'seller',
        title: 'Audit_Report_Trusett_v1.0.pdf',
        description: 'Formal 24-page security report signed by lead auditor.',
        url_or_hash: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        created_at: Math.floor(Date.now() / 1000) - 3600
      },
      {
        id: 'ev-202',
        uploaded_by: 'seller',
        title: 'GitHub PR #14 (Security Patch)',
        description: 'Remediation commits addressing findings #1 through #4.',
        url_or_hash: 'https://github.com/trusett-demo/contracts/pull/14',
        created_at: Math.floor(Date.now() / 1000) - 3500
      }
    ],
    is_demo: true
  },
  {
    id: 'TRU-2026-003',
    title: 'Brand Identity & Webflow Landing Page',
    description: 'Visual branding suite including logo mark, typography hierarchy, and a responsive Webflow landing page with custom CMS integration.',
    service_category: 'Brand & Web',
    buyer_address: '0.0.482910',
    buyer_name: 'Alice Chen (Fintech Founder)',
    seller_address: '0.0.519283',
    seller_name: 'Bob Martinez (Design Agency Lead)',
    arbiter_address: '0.0.381042',
    arbiter_name: 'Carol Vance (Certified Arbiter)',
    amount_usdc: 1800.0,
    deadline_timestamp: Math.floor(Date.now() / 1000) - 7200,
    acceptance_criteria: 'Responsive Webflow page passing PageSpeed >90, custom typography licensing transferred, and functional newsletter form integration.',
    state: 'DISPUTED',
    created_at: Math.floor(Date.now() / 1000) - 6 * 86400,
    funded_at: Math.floor(Date.now() / 1000) - 5 * 86400,
    delivered_at: Math.floor(Date.now() / 1000) - 7200,
    delivery_notes: 'Webflow site published to staging. Brand vector assets exported in Figma.',
    dispute_reason: 'Incomplete Mobile Breakpoints & Missing CMS Form Integration',
    dispute_claim_details: 'The staging site crashes on mobile viewport (<480px) and the newsletter signup form does not write to the agreed webhook endpoint. Seller stopped responding to revision requests.',
    deliverables: [
      { id: 'd3-1', title: 'Vector Logo Mark & Brand Guidelines', is_completed: true },
      { id: 'd3-2', title: 'Webflow Desktop Landing Layout', is_completed: true },
      { id: 'd3-3', title: 'Mobile Responsive Optimization & Form Hook', is_completed: false }
    ],
    evidence_items: [
      {
        id: 'ev-301',
        uploaded_by: 'buyer',
        title: 'Mobile_Breakpoint_Overflow_Bug.mp4',
        description: 'Screen recording showing text truncation and layout breakage on iPhone 15 Safari.',
        url_or_hash: 'ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
        created_at: Math.floor(Date.now() / 1000) - 5000
      },
      {
        id: 'ev-302',
        uploaded_by: 'seller',
        title: 'Figma_Brand_Assets_Master.fig',
        description: 'Completed logo variants, typography licenses, and vector source components.',
        url_or_hash: 'https://figma.com/@trusett/brand-master-export',
        created_at: Math.floor(Date.now() / 1000) - 7100
      }
    ],
    is_demo: true
  }
];

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-001',
    deal_id: 'TRU-2026-003',
    event_type: 'DISPUTE_RAISED',
    title: 'Dispute Opened by Buyer',
    description: 'Alice raised a dispute citing incomplete mobile breakpoints and missing form integration.',
    actor: '0.0.482910 (Alice)',
    is_on_chain: false,
    topic_id: '0.0.982104',
    hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
    created_at: Math.floor(Date.now() / 1000) - 5000
  },
  {
    id: 'evt-002',
    deal_id: 'TRU-2026-002',
    event_type: 'DELIVERY_SUBMITTED',
    title: 'Deliverables Submitted by Seller',
    description: 'Bob submitted audit report PDF and GitHub PR for review.',
    actor: '0.0.519283 (Bob)',
    is_on_chain: false,
    topic_id: '0.0.982104',
    hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
    created_at: Math.floor(Date.now() / 1000) - 3600
  },
  {
    id: 'evt-003',
    deal_id: 'TRU-2026-001',
    event_type: 'DEAL_CREATED',
    title: 'Deal Agreement Created',
    description: 'Alice created a 2,500 USDC protection contract for Fintech App Redesign.',
    actor: '0.0.482910 (Alice)',
    is_on_chain: false,
    topic_id: '0.0.982104',
    hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
    created_at: Math.floor(Date.now() / 1000) - 86400
  }
];

// Helper for standalone client-side storage
function getLocalDeals(): Deal[] {
  const stored = localStorage.getItem('trusett_deals');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('trusett_deals', JSON.stringify(DEFAULT_DEALS));
  return DEFAULT_DEALS;
}

function setLocalDeals(deals: Deal[]) {
  localStorage.setItem('trusett_deals', JSON.stringify(deals));
}

function getLocalEvents(): TimelineEvent[] {
  const stored = localStorage.getItem('trusett_events');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem('trusett_events', JSON.stringify(DEFAULT_EVENTS));
  return DEFAULT_EVENTS;
}

function addLocalEvent(evt: TimelineEvent) {
  const events = getLocalEvents();
  events.unshift(evt);
  localStorage.setItem('trusett_events', JSON.stringify(events));
}

export const api = {
  async getStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch('/api/status', { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // Standalone demo fallback
    }
    return {
      demo_mode: true,
      is_live_on_chain: false,
      network: 'testnet',
      operator_configured: false,
      operator_id: '0.0.482910 (Demo Operator)',
      active_topic_id: '0.0.982104 (Simulated HCS Topic)',
      usdc_token_id: '0.0.456858',
      escrow_contract_id: '0.0.994120 (Simulated Escrow)',
      sdk_available: true,
      hashscan_topic_url: 'https://hashscan.io/testnet/topic/0.0.982104'
    };
  },

  async toggleMode(demoMode: boolean): Promise<{ message: string; status: SystemStatus }> {
    try {
      const res = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo_mode: demoMode }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const status = await this.getStatus();
    status.demo_mode = demoMode;
    return { message: 'Demo mode updated', status };
  },

  async getDeals(role?: string, state?: string): Promise<Deal[]> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (state) params.append('state', state);
      const res = await fetch(`/api/deals?${params.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    let deals = getLocalDeals();
    if (role) {
      deals = deals.filter((d) => d.buyer_address === role || d.seller_address === role || d.arbiter_address === role);
    }
    if (state) {
      deals = deals.filter((d) => d.state === state);
    }
    return deals;
  },

  async getDeal(id: string): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${id}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deal = getLocalDeals().find((d) => d.id === id);
    if (!deal) throw new Error('Deal not found');
    return deal;
  },

  async createDeal(data: {
    title: string;
    description: string;
    buyer_address: string;
    buyer_name?: string;
    seller_address: string;
    seller_name?: string;
    arbiter_address?: string;
    arbiter_name?: string;
    amount_usdc: number;
    deadline_timestamp: number;
    deliverables: string[];
    acceptance_criteria: string;
    service_category?: string;
  }): Promise<Deal> {
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const now = Math.floor(Date.now() / 1000);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const deal: Deal = {
      id: `TRU-2026-${suffix}`,
      title: data.title,
      description: data.description,
      service_category: data.service_category || 'Service Contract',
      buyer_address: data.buyer_address,
      buyer_name: data.buyer_name || 'Alice Chen (Buyer)',
      seller_address: data.seller_address,
      seller_name: data.seller_name || 'Bob Martinez (Seller)',
      arbiter_address: data.arbiter_address || '0.0.381042',
      arbiter_name: data.arbiter_name || 'Carol Vance (Certified Arbiter)',
      amount_usdc: data.amount_usdc,
      deadline_timestamp: data.deadline_timestamp,
      acceptance_criteria: data.acceptance_criteria,
      state: 'CREATED',
      created_at: now,
      deliverables: data.deliverables.map((t, idx) => ({
        id: `del-${idx + 1}`,
        title: t,
        is_completed: false
      })),
      evidence_items: [],
      hcs_topic_id: '0.0.982104',
      is_demo: true
    };
    const deals = getLocalDeals();
    deals.unshift(deal);
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'DEAL_CREATED',
      title: 'Payment Protection Deal Established',
      description: `Agreement created for ${deal.amount_usdc} USDC. Awaiting buyer escrow deposit.`,
      actor: `${deal.buyer_address} (${deal.buyer_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async depositEscrow(dealId: string): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/deposit`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    const now = Math.floor(Date.now() / 1000);
    deal.state = 'FUNDED';
    deal.funded_at = now;
    deal.funding_tx_id = `0.0.482910@${now}.000000001`;
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'ESCROW_FUNDED',
      title: 'USDC Escrow Successfully Funded',
      description: `${deal.amount_usdc} USDC locked in non-custodial smart contract custody.`,
      actor: `${deal.buyer_address} (${deal.buyer_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      transaction_id: deal.funding_tx_id,
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async submitDelivery(
    dealId: string,
    notes: string,
    attachments: EvidenceAttachment[]
  ): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, attachments }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    const now = Math.floor(Date.now() / 1000);
    deal.state = 'DELIVERED';
    deal.delivered_at = now;
    deal.delivery_notes = notes;
    deal.deliverables.forEach((d) => (d.is_completed = true));
    if (attachments && attachments.length > 0) {
      deal.evidence_items.push(...attachments);
    }
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'DELIVERY_SUBMITTED',
      title: 'Deliverables & Evidence Submitted',
      description: 'Seller submitted work milestones and proof attachments. Inspection window open.',
      actor: `${deal.seller_address} (${deal.seller_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async acceptDelivery(dealId: string): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/accept`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    const now = Math.floor(Date.now() / 1000);
    deal.state = 'SETTLED';
    deal.settled_at = now;
    deal.seller_payout_usdc = deal.amount_usdc;
    deal.buyer_refund_usdc = 0.0;
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'DELIVERY_ACCEPTED',
      title: 'Delivery Accepted & Settlement Executed',
      description: `Buyer accepted work. 100% of escrow (${deal.amount_usdc} USDC) released to seller.`,
      actor: `${deal.buyer_address} (${deal.buyer_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async raiseDispute(
    dealId: string,
    reason: string,
    claimDetails: string,
    attachments: EvidenceAttachment[]
  ): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, claim_details: claimDetails, attachments }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    const now = Math.floor(Date.now() / 1000);
    deal.state = 'DISPUTED';
    deal.dispute_reason = reason;
    deal.dispute_claim_details = claimDetails;
    if (attachments && attachments.length > 0) {
      deal.evidence_items.push(...attachments);
    }
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'DISPUTE_RAISED',
      title: 'Formal Dispute Opened',
      description: `Reason: ${reason}. Case referred to designated arbiter with AI analysis assistance.`,
      actor: `${deal.buyer_address} (${deal.buyer_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async addEvidence(dealId: string, attachment: EvidenceAttachment): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attachment),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    deal.evidence_items.push(attachment);
    setLocalDeals(deals);
    return deal;
  },

  async analyzeDispute(dealId: string): Promise<AIAssistantAnalysis> {
    try {
      const res = await fetch(`/api/deals/${dealId}/ai-analyze`, {
        method: 'POST',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deal = await this.getDeal(dealId);
    const splitSeller = 60.0;
    const splitBuyer = 40.0;
    return {
      analysis_id: `AI-EVD-${Date.now()}`,
      engine: 'Deterministic Rule-Based Analyzer v1.0',
      disclaimer: 'AI-generated recommendation — Not a final decision. Arbiter holds sole settlement authority.',
      agreement_summary: {
        title: deal.title,
        total_escrow_amount: `${deal.amount_usdc} USDC`,
        category: deal.service_category,
        agreed_deadline: new Date(deal.deadline_timestamp * 1000).toISOString(),
        core_deliverables_count: deal.deliverables.length,
        deliverables_list: deal.deliverables.map((d) => d.title),
        acceptance_criteria: deal.acceptance_criteria
      },
      buyer_claims: {
        grievance_category: deal.dispute_reason || 'Unspecified breach',
        buyer_narrative: deal.dispute_claim_details || 'Buyer asserts deliverables fail to meet agreed criteria.',
        evidence_items_submitted: deal.evidence_items.filter((e) => e.uploaded_by === 'buyer').length,
        evidence_titles: deal.evidence_items.filter((e) => e.uploaded_by === 'buyer').map((e) => e.title)
      },
      seller_defense: {
        delivery_notes: deal.delivery_notes || 'Work submitted per specifications.',
        delivered_at: deal.delivered_at ? new Date(deal.delivered_at * 1000).toISOString() : 'Not recorded',
        evidence_items_submitted: deal.evidence_items.filter((e) => e.uploaded_by === 'seller').length,
        evidence_titles: deal.evidence_items.filter((e) => e.uploaded_by === 'seller').map((e) => e.title)
      },
      timeline_audit: [
        { milestone: 'Agreement Established', timestamp: deal.created_at },
        { milestone: 'Contract Deadline', timestamp: deal.deadline_timestamp }
      ],
      inconsistencies_detected: [
        'Delivery notes do not explicitly document responsive tablet breakpoints required by acceptance standard.'
      ],
      missing_information: [
        'Missing automated unit test logs for client validation.'
      ],
      confidence_score: 0.88,
      recommendation: {
        outcome: ResolutionOutcome.SPLIT_SETTLEMENT,
        seller_percentage: splitSeller,
        buyer_percentage: splitBuyer,
        seller_amount_usdc: Math.round(deal.amount_usdc * (splitSeller / 100.0)),
        buyer_refund_usdc: Math.round(deal.amount_usdc * (splitBuyer / 100.0)),
        reasoning: [
          'Core assets and codebase were substantively handed over per milestone schedule.',
          'Responsive formatting issues validate buyer grievance for outstanding fixes.',
          'Recommended outcome: 60% Seller payout / 40% Buyer refund reflecting proportional completion.'
        ]
      }
    };
  },

  async resolveDispute(
    dealId: string,
    outcome: ResolutionOutcome,
    sellerSplitPercentage: number,
    arbiterNotes: string
  ): Promise<Deal> {
    try {
      const res = await fetch(`/api/deals/${dealId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          seller_split_percentage: sellerSplitPercentage,
          arbiter_notes: arbiterNotes
        }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const deals = getLocalDeals();
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) throw new Error('Deal not found');
    const now = Math.floor(Date.now() / 1000);
    deal.settled_at = now;

    if (outcome === ResolutionOutcome.RELEASE_TO_SELLER) {
      deal.state = 'SETTLED';
      deal.seller_payout_usdc = deal.amount_usdc;
      deal.buyer_refund_usdc = 0.0;
    } else if (outcome === ResolutionOutcome.REFUND_TO_BUYER) {
      deal.state = 'REFUNDED';
      deal.seller_payout_usdc = 0.0;
      deal.buyer_refund_usdc = deal.amount_usdc;
    } else {
      deal.state = 'SETTLED';
      const pct = Math.max(0, Math.min(100, sellerSplitPercentage));
      deal.seller_payout_usdc = Math.round(deal.amount_usdc * (pct / 100.0));
      deal.buyer_refund_usdc = Math.round(deal.amount_usdc - deal.seller_payout_usdc);
    }
    setLocalDeals(deals);

    addLocalEvent({
      id: `evt-${Date.now()}`,
      deal_id: deal.id,
      event_type: 'ARBITER_RULING',
      title: 'Authorized Arbiter Ruling Executed',
      description: `Ruling: ${outcome}. Payout: ${deal.seller_payout_usdc} USDC to Seller, ${deal.buyer_refund_usdc} USDC refunded to Buyer. Notes: ${arbiterNotes}`,
      actor: `${deal.arbiter_address} (${deal.arbiter_name})`,
      is_on_chain: false,
      topic_id: '0.0.982104',
      hashscan_url: 'https://hashscan.io/testnet/topic/0.0.982104',
      created_at: now
    });
    return deal;
  },

  async getDealTimeline(dealId: string): Promise<TimelineEvent[]> {
    try {
      const res = await fetch(`/api/deals/${dealId}/timeline`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getLocalEvents().filter((e) => e.deal_id === dealId);
  },

  async getGlobalTimeline(): Promise<TimelineEvent[]> {
    try {
      const res = await fetch('/api/timeline', { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getLocalEvents();
  },

  async seedDeals(): Promise<{ message: string; count: number }> {
    try {
      const res = await fetch('/api/seed', { method: 'POST', signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    setLocalDeals(DEFAULT_DEALS);
    localStorage.setItem('trusett_events', JSON.stringify(DEFAULT_EVENTS));
    return { message: 'Reset to sample data', count: DEFAULT_DEALS.length };
  }
};
