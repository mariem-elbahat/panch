import React, { useState, useEffect } from 'react';
import {
  Deal,
  TimelineEvent,
  UserRole,
  EvidenceAttachment
} from '../types';
import { api } from '../services/api';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  Upload,
  Coins,
  Send,
  User,
  Paperclip,
  RotateCcw
} from 'lucide-react';

interface DealRoomProps {
  deal: Deal;
  activeRole: UserRole;
  onRefreshDeal: (dealId: string) => Promise<void>;
  onNavigateToDispute: (deal: Deal) => void;
  onNavigateToAudit: (dealId: string) => void;
}

export const DealRoom: React.FC<DealRoomProps> = ({
  deal,
  activeRole,
  onRefreshDeal,
  onNavigateToDispute,
  onNavigateToAudit,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Delivery submission modal state
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryTitle, setDeliveryTitle] = useState('');

  // Dispute submission modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Incomplete Deliverables');
  const [disputeClaimDetails, setDisputeClaimDetails] = useState('');

  useEffect(() => {
    loadTimeline();
  }, [deal.id]);

  const loadTimeline = async () => {
    try {
      const data = await api.getDealTimeline(deal.id);
      setTimeline(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Actions
  const handleDeposit = async () => {
    if (!confirm(`Confirm depositing ${deal.amount_usdc} USDC into Hedera Escrow smart contract?`)) return;
    setLoadingAction('deposit');
    try {
      await api.depositEscrow(deal.id);
      await onRefreshDeal(deal.id);
      await loadTimeline();
    } catch (e) {
      alert('Deposit error: ' + e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeliverySubmit = async () => {
    if (!deliveryNotes.trim()) {
      alert('Please enter delivery notes');
      return;
    }
    setLoadingAction('delivery');
    try {
      const attachments: EvidenceAttachment[] = [];
      if (deliveryTitle && deliveryUrl) {
        attachments.push({
          id: `ev-${Date.now()}`,
          uploaded_by: 'seller',
          title: deliveryTitle,
          description: 'Delivery artifact submitted for client acceptance',
          url_or_hash: deliveryUrl,
          created_at: Math.floor(Date.now() / 1000)
        });
      }
      await api.submitDelivery(deal.id, deliveryNotes, attachments);
      setDeliveryModalOpen(false);
      setDeliveryNotes('');
      setDeliveryTitle('');
      setDeliveryUrl('');
      await onRefreshDeal(deal.id);
      await loadTimeline();
    } catch (e) {
      alert('Delivery error: ' + e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptDelivery = async () => {
    if (!confirm(`Are you sure you want to accept the delivery? This will release ${deal.amount_usdc} USDC to the seller.`)) return;
    setLoadingAction('accept');
    try {
      await api.acceptDelivery(deal.id);
      await onRefreshDeal(deal.id);
      await loadTimeline();
    } catch (e) {
      alert('Acceptance error: ' + e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeClaimDetails.trim()) {
      alert('Please enter your dispute claims and grievance details.');
      return;
    }
    setLoadingAction('dispute');
    try {
      await api.raiseDispute(deal.id, disputeReason, disputeClaimDetails, []);
      setDisputeModalOpen(false);
      await onRefreshDeal(deal.id);
      await loadTimeline();
    } catch (e) {
      alert('Dispute error: ' + e);
    } finally {
      setLoadingAction(null);
    }
  };

  // 5-stage progress indicator
  const stages = [
    { key: 'CREATED', label: '1. Agreement', sub: 'Terms set' },
    { key: 'FUNDED', label: '2. Escrow Deposit', sub: 'USDC locked' },
    { key: 'DELIVERED', label: '3. Delivery Handover', sub: 'Evidence attached' },
    { key: 'DISPUTED', label: '4. Review / Dispute', sub: 'AI + Arbiter' },
    { key: 'SETTLED', label: '5. Settlement', sub: 'Released or Split' }
  ];

  const getStageIndex = (state: string) => {
    if (state === 'CREATED') return 0;
    if (state === 'FUNDED') return 1;
    if (state === 'DELIVERED') return 2;
    if (state === 'DISPUTED') return 3;
    if (state === 'SETTLED' || state === 'REFUNDED') return 4;
    return 0;
  };

  const currentStageIdx = getStageIndex(deal.state);

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header */}
      <div className="bg-paper border border-line p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-forest bg-lime-brand px-2 py-0.5 border border-forest">
                {deal.id}
              </span>
              <span className="text-xs text-muted font-bold uppercase tracking-wider">
                {deal.service_category}
              </span>
              {deal.is_demo && (
                <span className="text-[10px] bg-cream text-muted px-1.5 py-0.5 border border-line">
                  DEMO SIMULATION
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">{deal.title}</h1>
            <p className="text-xs text-muted max-w-2xl mt-0.5">{deal.description}</p>
          </div>

          <div className="text-right shrink-0 bg-sage-light p-3 border border-line">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Escrow Amount</div>
            <div className="text-2xl font-black text-forest tabular-nums">
              ${deal.amount_usdc.toLocaleString()} <span className="text-xs font-bold">USDC</span>
            </div>
            <div className="text-[10px] font-mono text-muted mt-0.5">
              Status: <strong className="text-ink">{deal.state}</strong>
            </div>
          </div>
        </div>

        {/* 5-Stage Step Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-line">
          {stages.map((st, i) => {
            const isPassed = i < currentStageIdx;
            const isCurrent = i === currentStageIdx;
            return (
              <div
                key={st.key}
                className={`p-2.5 border transition-all text-left ${
                  isCurrent
                    ? 'border-forest bg-forest text-lime-brand'
                    : isPassed
                    ? 'border-line bg-sage-brand text-forest'
                    : 'border-line/60 bg-paper text-muted/60'
                }`}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider">{st.label}</div>
                <div className={`text-[10px] ${isCurrent ? 'text-cream/80' : 'text-muted'}`}>{st.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Aware Action Bar (Highlights what the current active user should do) */}
      <div className="bg-paper border border-forest p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest text-lime-brand flex items-center justify-center font-bold text-sm">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-forest">
                Action Console • Active Role: {activeRole.name} ({activeRole.roleType.toUpperCase()})
              </div>
              <div className="text-xs text-ink">
                {deal.state === 'CREATED' && (
                  <span>Agreement is live. Buyer must deposit {deal.amount_usdc} USDC into escrow to activate the contract.</span>
                )}
                {deal.state === 'FUNDED' && (
                  <span>Escrow is funded. Seller is currently executing deliverables and should submit delivery proof when ready.</span>
                )}
                {deal.state === 'DELIVERED' && (
                  <span>Seller submitted work deliverables. Buyer can inspect artifacts and either accept delivery or raise a dispute.</span>
                )}
                {deal.state === 'DISPUTED' && (
                  <span className="text-clay font-semibold">
                    Formal dispute opened. Referred to designated arbiter with AI evidence assistance.
                  </span>
                )}
                {deal.state === 'SETTLED' && (
                  <span className="text-green-brand font-semibold">
                    Deal settled! Funds distributed (Seller: ${deal.seller_payout_usdc || deal.amount_usdc} USDC, Buyer: ${deal.buyer_refund_usdc || 0} USDC).
                  </span>
                )}
                {deal.state === 'REFUNDED' && (
                  <span className="text-gold font-semibold">
                    Deal refunded! 100% of escrow (${deal.amount_usdc} USDC) returned to buyer.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons matching role & state */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Buyer Deposit Action */}
            {deal.state === 'CREATED' && (
              <button
                disabled={loadingAction === 'deposit'}
                onClick={handleDeposit}
                className="bg-lime-brand hover:bg-lime-light text-forest font-bold px-4 py-2 text-xs uppercase tracking-wider border border-forest flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Coins size={14} />
                <span>Deposit ${deal.amount_usdc} USDC</span>
              </button>
            )}

            {/* Seller Submit Delivery Action */}
            {deal.state === 'FUNDED' && (
              <button
                onClick={() => setDeliveryModalOpen(true)}
                className="bg-forest hover:bg-forest-hover text-lime-brand font-bold px-4 py-2 text-xs uppercase tracking-wider border border-forest flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Upload size={14} />
                <span>Submit Deliverables & Proof</span>
              </button>
            )}

            {/* Buyer Inspection Actions (Accept or Dispute) */}
            {deal.state === 'DELIVERED' && (
              <>
                <button
                  disabled={loadingAction === 'accept'}
                  onClick={handleAcceptDelivery}
                  className="bg-green-brand hover:bg-green-light text-white font-bold px-3 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  <span>Accept & Release Funds</span>
                </button>
                <button
                  onClick={() => setDisputeModalOpen(true)}
                  className="bg-clay-light hover:bg-clay hover:text-white text-clay font-bold px-3 py-2 text-xs uppercase tracking-wider border border-clay flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle size={14} />
                  <span>Raise Dispute</span>
                </button>
              </>
            )}

            {/* In Dispute: Direct link to Dispute Resolution Workspace */}
            {deal.state === 'DISPUTED' && (
              <button
                onClick={() => onNavigateToDispute(deal)}
                className="bg-clay hover:bg-clay/90 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Scale size={14} />
                <span>Open Dispute Console & AI Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Deliverables + Evidence + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Deliverables Checklist & Evidence Vault */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverables Checklist */}
          <div className="bg-paper border border-line p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                <FileCheck size={14} />
                <span>Milestone Deliverables Checklist ({deal.deliverables.length})</span>
              </div>
              <span className="text-[11px] font-mono text-muted">Required for payment release</span>
            </div>

            <div className="space-y-2">
              {deal.deliverables.map((del, idx) => (
                <div
                  key={del.id}
                  className="flex items-center justify-between p-3 border border-line bg-cream/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 flex items-center justify-center border text-xs font-bold ${
                        del.is_completed || deal.state === 'DELIVERED' || deal.state === 'SETTLED'
                          ? 'bg-forest text-lime-brand border-forest'
                          : 'border-line text-muted'
                      }`}
                    >
                      {del.is_completed || deal.state === 'DELIVERED' || deal.state === 'SETTLED' ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs font-bold text-ink">{del.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                      del.is_completed || deal.state === 'DELIVERED' || deal.state === 'SETTLED'
                        ? 'bg-sage-brand text-forest border-line'
                        : 'bg-paper text-muted border-line'
                    }`}
                  >
                    {del.is_completed || deal.state === 'DELIVERED' || deal.state === 'SETTLED'
                      ? 'Completed'
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {/* Acceptance Criteria Box */}
            <div className="mt-3 p-3 bg-sage-light border border-line text-xs">
              <span className="font-bold text-forest uppercase tracking-wider text-[10px] block mb-0.5">
                Pre-Agreed Acceptance Standard:
              </span>
              <p className="text-ink/90 italic">{deal.acceptance_criteria}</p>
            </div>
          </div>

          {/* Delivery Notes & Evidence Attachments */}
          <div className="bg-paper border border-line p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                <Paperclip size={14} />
                <span>Evidence Vault & Handover Artifacts ({deal.evidence_items.length})</span>
              </div>
              <span className="text-[10px] text-muted">Stored Off-Chain • Hash Logged on HCS</span>
            </div>

            {deal.delivery_notes && (
              <div className="p-3 bg-paper border border-line">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                  Seller Delivery Notes:
                </div>
                <p className="text-xs text-ink leading-relaxed">{deal.delivery_notes}</p>
              </div>
            )}

            {deal.evidence_items.length === 0 ? (
              <div className="p-6 text-center text-muted border border-dashed border-line">
                <Paperclip size={24} className="mx-auto text-dim mb-1" />
                <div className="text-xs font-medium">No external proof attachments uploaded yet.</div>
                <div className="text-[10px] text-muted mt-0.5">
                  Sellers attach GitHub PRs, Figma links, and PDFs; buyers attach defect evidence if disputing.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deal.evidence_items.map((ev) => (
                  <div key={ev.id} className="p-3 border border-line bg-cream/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-sage-brand px-1 border border-line">
                        {ev.uploaded_by.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-muted">
                        {new Date(ev.created_at * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-ink truncate">{ev.title}</div>
                    <p className="text-[11px] text-muted line-clamp-2">{ev.description}</p>
                    <div className="pt-1">
                      <a
                        href={ev.url_or_hash}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-forest font-mono hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{ev.url_or_hash}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Counterparties + Consensus Proof */}
        <div className="space-y-6">
          {/* Counterparties Card */}
          <div className="bg-paper border border-line p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-forest border-b border-line pb-2 flex items-center gap-1.5">
              <User size={13} />
              <span>Contract Participants</span>
            </div>

            {/* Buyer */}
            <div className="p-2.5 bg-cream/30 border border-line space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Buyer (Depositor)</div>
              <div className="text-xs font-bold text-ink">{deal.buyer_name}</div>
              <div className="text-[10px] font-mono text-forest">{deal.buyer_address}</div>
            </div>

            {/* Seller */}
            <div className="p-2.5 bg-cream/30 border border-line space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Seller (Beneficiary)</div>
              <div className="text-xs font-bold text-ink">{deal.seller_name}</div>
              <div className="text-[10px] font-mono text-forest">{deal.seller_address}</div>
            </div>

            {/* Arbiter */}
            <div className="p-2.5 bg-cream/30 border border-line space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Designated Arbiter</div>
              <div className="text-xs font-bold text-ink">{deal.arbiter_name}</div>
              <div className="text-[10px] font-mono text-forest">{deal.arbiter_address}</div>
            </div>
          </div>

          {/* Hedera Consensus Service Topic Proof */}
          <div className="bg-paper border border-line p-5 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-forest border-b border-line pb-2 flex items-center justify-between">
              <span>HCS Audit Topic</span>
              <span className="text-[10px] text-lime-brand bg-forest px-1.5 py-0.2">Public Record</span>
            </div>

            <div className="text-xs text-muted">
              Every milestone state change is broadcast as an immutable JSON message to Hedera Consensus Service.
            </div>

            <div className="p-3 bg-sage-light border border-line space-y-1 font-mono text-xs">
              <div className="text-[10px] text-muted">Topic ID:</div>
              <div className="font-bold text-forest">{deal.hcs_topic_id || '0.0.982104'}</div>
              <a
                href={`https://hashscan.io/testnet/topic/${deal.hcs_topic_id || '0.0.982104'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-forest underline flex items-center gap-1 pt-1 font-sans"
              >
                <span>Inspect Topic on HashScan</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <button
              onClick={() => onNavigateToAudit(deal.id)}
              className="w-full text-center text-xs font-bold text-forest hover:text-green-brand border border-line hover:border-forest py-2 transition-colors uppercase tracking-wider"
            >
              View Full Chronological Timeline →
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Seller Submit Delivery */}
      {deliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-paper border border-line w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-forest">Seller Handover</div>
                <h3 className="text-base font-bold text-ink">Submit Deliverables & Proof</h3>
              </div>
              <button onClick={() => setDeliveryModalOpen(false)} className="text-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Delivery Notes *</label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Explain what has been completed, test verification results, and handover notes..."
                rows={3}
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Artifact Title</label>
              <input
                type="text"
                value={deliveryTitle}
                onChange={(e) => setDeliveryTitle(e.target.value)}
                placeholder="e.g. GitHub PR #14 / Production Preview Link"
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">URL or IPFS Hash</label>
              <input
                type="text"
                value={deliveryUrl}
                onChange={(e) => setDeliveryUrl(e.target.value)}
                placeholder="https://... or ipfs://..."
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setDeliveryModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-muted hover:text-ink uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction === 'delivery'}
                onClick={handleDeliverySubmit}
                className="bg-forest text-lime-brand px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Upload size={13} />
                <span>Confirm Handover</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buyer Open Dispute */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-paper border border-clay w-full max-w-lg p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-clay">Dispute Settlement</div>
                <h3 className="text-base font-bold text-ink">Raise a Formal Dispute</h3>
              </div>
              <button onClick={() => setDisputeModalOpen(false)} className="text-muted hover:text-ink">
                ✕
              </button>
            </div>

            <div className="p-3 bg-clay-light border border-clay text-clay text-[11px]">
              ⚠️ Escrow funds will remain locked in smart contract custody. The designated human arbiter ({deal.arbiter_name}) will review evidence assisted by AI summarization.
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Reason Category *</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              >
                <option>Incomplete Deliverables</option>
                <option>Breach of Agreed Acceptance Criteria</option>
                <option>Missed Milestone Deadline</option>
                <option>Functional or Security Defects</option>
                <option>Unresponsive Counterparty</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">Grievance Details *</label>
              <textarea
                value={disputeClaimDetails}
                onChange={(e) => setDisputeClaimDetails(e.target.value)}
                placeholder="Explain precisely which deliverables are defective or missing, referencing specific requirements..."
                rows={4}
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-muted hover:text-ink uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loadingAction === 'dispute'}
                onClick={handleRaiseDispute}
                className="bg-clay text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <AlertTriangle size={13} />
                <span>Confirm Dispute</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
