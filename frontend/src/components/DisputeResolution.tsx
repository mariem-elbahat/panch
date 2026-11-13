import React, { useState, useEffect } from 'react';
import {
  Deal,
  AIAssistantAnalysis,
  ResolutionOutcome,
  UserRole,
  EvidenceAttachment
} from '../types';
import { api } from '../services/api';
import {
  Scale,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Sliders,
  FileText,
  User,
  ArrowRight,
  Info
} from 'lucide-react';

interface DisputeResolutionProps {
  deal: Deal;
  activeRole: UserRole;
  onRefreshDeal: (dealId: string) => Promise<void>;
  onNavigateToDealRoom: (deal: Deal) => void;
}

export const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  deal,
  activeRole,
  onRefreshDeal,
  onNavigateToDealRoom,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAssistantAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Arbiter resolution form state
  const [selectedOutcome, setSelectedOutcome] = useState<ResolutionOutcome>(
    ResolutionOutcome.SPLIT_SETTLEMENT
  );
  const [sellerSplitPct, setSellerSplitPct] = useState<number>(60.0);
  const [arbiterNotes, setArbiterNotes] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Evidence upload by either party during dispute
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  useEffect(() => {
    // Automatically trigger AI analysis when entering dispute workspace
    runAiAnalysis();
  }, [deal.id]);

  const runAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const data = await api.analyzeDispute(deal.id);
      setAiAnalysis(data);
      if (data.recommendation) {
        setSelectedOutcome(data.recommendation.outcome);
        setSellerSplitPct(data.recommendation.seller_percentage);
      }
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddEvidence = async () => {
    if (!newEvidenceTitle.trim() || !newEvidenceUrl.trim()) return;
    setSubmittingEvidence(true);
    try {
      const attachment: EvidenceAttachment = {
        id: `ev-${Date.now()}`,
        uploaded_by: activeRole.roleType === 'buyer' ? 'buyer' : 'seller',
        title: newEvidenceTitle,
        description: `Dispute supporting artifact submitted by ${activeRole.name}`,
        url_or_hash: newEvidenceUrl,
        created_at: Math.floor(Date.now() / 1000)
      };
      await api.addEvidence(deal.id, attachment);
      setNewEvidenceTitle('');
      setNewEvidenceUrl('');
      await onRefreshDeal(deal.id);
      await runAiAnalysis();
    } catch (e) {
      alert('Error adding evidence: ' + e);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const handleConfirmResolution = async () => {
    setSubmittingResolution(true);
    try {
      await api.resolveDispute(
        deal.id,
        selectedOutcome,
        sellerSplitPct,
        arbiterNotes || `Formal ruling executed by ${activeRole.name}.`
      );
      setConfirmModalOpen(false);
      await onRefreshDeal(deal.id);
    } catch (e) {
      alert('Error recording resolution: ' + e);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const buyerSplitPct = 100.0 - sellerSplitPct;
  const sellerAmountUsdc =
    selectedOutcome === ResolutionOutcome.RELEASE_TO_SELLER
      ? deal.amount_usdc
      : selectedOutcome === ResolutionOutcome.REFUND_TO_BUYER
      ? 0.0
      : (deal.amount_usdc * (sellerSplitPct / 100.0)).toFixed(2);

  const buyerAmountUsdc =
    selectedOutcome === ResolutionOutcome.RELEASE_TO_SELLER
      ? 0.0
      : selectedOutcome === ResolutionOutcome.REFUND_TO_BUYER
      ? deal.amount_usdc
      : (deal.amount_usdc * (buyerSplitPct / 100.0)).toFixed(2);

  const isArbiter = activeRole.roleType === 'arbiter';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-paper border border-clay p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-clay bg-clay-light px-2 py-0.5 border border-clay">
              Dispute Resolution Workspace
            </span>
            <span className="font-mono text-xs font-bold text-forest bg-cream px-1.5 py-0.5 border border-line">
              {deal.id}
            </span>
            <span className="text-xs text-muted">Amount: <strong className="text-ink">${deal.amount_usdc} USDC</strong></span>
          </div>
          <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">
            Arbitration & AI Evidence Synthesis
          </h1>
          <p className="text-xs text-muted max-w-2xl mt-0.5">
            Objective evaluation of original contract specifications versus buyer claims and seller defense.
            AI organizes evidence and proposes guidance; the authorized human arbiter retains sole settlement authority.
          </p>
        </div>

        <button
          onClick={() => onNavigateToDealRoom(deal)}
          className="text-xs font-bold text-forest hover:text-green-brand border border-line hover:border-forest px-3 py-2 uppercase tracking-wider bg-cream shrink-0"
        >
          ← Return to Deal Room
        </button>
      </div>

      {/* Settlement Status Banner (if deal already settled) */}
      {deal.state === 'SETTLED' || deal.state === 'REFUNDED' ? (
        <div className="bg-sage-light border border-forest p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 text-forest font-bold text-sm">
            <CheckCircle2 size={16} />
            <span>This dispute has been officially settled and recorded on Hedera.</span>
          </div>
          <div className="text-ink">
            Final Distribution: <strong>${deal.seller_payout_usdc} USDC</strong> released to Seller ({deal.seller_name}) • <strong>${deal.buyer_refund_usdc} USDC</strong> refunded to Buyer ({deal.buyer_name}).
          </div>
        </div>
      ) : null}

      {/* 3-Column Tripartite Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Original Agreement */}
        <div className="bg-paper border border-line p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
              <FileText size={13} />
              <span>1. Original Agreement</span>
            </div>
            <span className="text-[10px] text-muted font-mono">${deal.amount_usdc} USDC</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Deal Title:</span>
              <strong className="text-ink">{deal.title}</strong>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Agreed Deliverables:</span>
              <ul className="list-disc list-inside space-y-0.5 text-ink/90 mt-0.5">
                {deal.deliverables.map((d, i) => (
                  <li key={i}>{d.title}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Acceptance Criteria:</span>
              <p className="text-muted italic bg-cream/40 p-2 border border-line text-[11px]">
                {deal.acceptance_criteria}
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Buyer Grievance & Claims */}
        <div className="bg-paper border border-clay/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-clay flex items-center gap-1.5">
              <AlertTriangle size={13} />
              <span>2. Buyer's Claim</span>
            </div>
            <span className="text-[10px] text-muted font-mono">{deal.buyer_name.split(' ')[0]}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Grievance Reason:</span>
              <strong className="text-clay font-bold">{deal.dispute_reason || 'Breach of Agreement'}</strong>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Narrative:</span>
              <p className="text-ink/90 bg-clay-light/40 p-2 border border-clay/30 text-[11px] leading-relaxed">
                {deal.dispute_claim_details || 'Buyer claims submitted work fails to meet required specifications.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Buyer Evidence:</span>
              {deal.evidence_items.filter((e) => e.uploaded_by === 'buyer').length === 0 ? (
                <span className="text-[11px] text-muted italic">No separate buyer attachments</span>
              ) : (
                <div className="space-y-1 mt-1">
                  {deal.evidence_items
                    .filter((e) => e.uploaded_by === 'buyer')
                    .map((e) => (
                      <div key={e.id} className="p-1.5 bg-cream/50 border border-line text-[11px]">
                        <div className="font-bold text-ink">{e.title}</div>
                        <a
                          href={e.url_or_hash}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest text-[10px] underline flex items-center gap-0.5"
                        >
                          <span>{e.url_or_hash}</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Seller Handover & Defense */}
        <div className="bg-paper border border-forest/60 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>3. Seller Defense</span>
            </div>
            <span className="text-[10px] text-muted font-mono">{deal.seller_name.split(' ')[0]}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Delivery Notes:</span>
              <p className="text-ink/90 bg-sage-light/40 p-2 border border-line text-[11px] leading-relaxed">
                {deal.delivery_notes || 'No handover notes provided by seller.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Seller Proof Artifacts:</span>
              {deal.evidence_items.filter((e) => e.uploaded_by === 'seller').length === 0 ? (
                <span className="text-[11px] text-muted italic">No seller artifacts attached</span>
              ) : (
                <div className="space-y-1 mt-1">
                  {deal.evidence_items
                    .filter((e) => e.uploaded_by === 'seller')
                    .map((e) => (
                      <div key={e.id} className="p-1.5 bg-cream/50 border border-line text-[11px]">
                        <div className="font-bold text-ink">{e.title}</div>
                        <a
                          href={e.url_or_hash}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest text-[10px] underline flex items-center gap-0.5"
                        >
                          <span>{e.url_or_hash}</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Evidence Assistant Panel */}
      <div className="bg-paper border-2 border-forest p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest text-lime-brand flex items-center justify-center font-bold">
              <Sparkles size={15} />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                <span>AI Evidence Assistant Analysis</span>
                <span className="text-[10px] font-mono text-forest bg-lime-brand px-1.5 py-0.2 border border-forest">
                  {aiAnalysis?.engine || 'Deterministic Analyzer v1.0'}
                </span>
              </h2>
              <div className="text-[10px] text-muted">
                Objective cross-referencing of terms, timeline deadlines, and evidence attachments
              </div>
            </div>
          </div>

          <button
            onClick={runAiAnalysis}
            disabled={loadingAi}
            className="text-xs font-bold text-forest hover:text-green-brand border border-line hover:border-forest px-3 py-1.5 bg-cream uppercase tracking-wider"
          >
            {loadingAi ? 'Analyzing...' : 'Re-Run AI Analysis'}
          </button>
        </div>

        {/* Mandatory Guardrail Disclaimer */}
        <div className="bg-lime-brand/30 border border-forest/40 p-2.5 flex items-center gap-2 text-xs text-forest">
          <Info size={15} className="shrink-0" />
          <span className="font-bold">
            AI-generated recommendation — Not a final decision. The human arbiter must independently review the evidence and confirm the outcome.
          </span>
        </div>

        {aiAnalysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            {/* Left: Inconsistencies & Gaps */}
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-clay flex items-center gap-1 mb-1">
                  <AlertTriangle size={12} />
                  <span>Discrepancies Detected</span>
                </div>
                {aiAnalysis.inconsistencies_detected.length === 0 ? (
                  <div className="text-[11px] text-muted italic">No direct factual contradictions found.</div>
                ) : (
                  <ul className="space-y-1">
                    {aiAnalysis.inconsistencies_detected.map((inc, i) => (
                      <li key={i} className="p-2 bg-clay-light/50 border border-clay/30 text-ink text-[11px]">
                        • {inc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-forest flex items-center gap-1 mb-1">
                  <Info size={12} />
                  <span>Missing Proof Elements</span>
                </div>
                {aiAnalysis.missing_information.length === 0 ? (
                  <div className="text-[11px] text-muted italic">Both parties submitted full documentation.</div>
                ) : (
                  <ul className="space-y-1">
                    {aiAnalysis.missing_information.map((msg, i) => (
                      <li key={i} className="p-2 bg-sage-light border border-line text-ink text-[11px]">
                        • {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Center: Recommended Outcome */}
            <div className="bg-sage-light p-4 border border-line space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-forest">
                Suggested Outcome Guidance
              </div>
              <div className="text-xl font-black text-forest">
                {aiAnalysis.recommendation.outcome.replace(/_/g, ' ')}
              </div>

              {aiAnalysis.recommendation.outcome === 'SPLIT_SETTLEMENT' && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between font-mono font-bold text-ink">
                    <span>Seller: {aiAnalysis.recommendation.seller_percentage}% (${aiAnalysis.recommendation.seller_amount_usdc} USDC)</span>
                    <span>Buyer: {aiAnalysis.recommendation.buyer_percentage}% (${aiAnalysis.recommendation.buyer_refund_usdc} USDC)</span>
                  </div>
                  <div className="w-full bg-cream h-3 border border-line overflow-hidden flex">
                    <div
                      className="bg-forest h-full"
                      style={{ width: `${aiAnalysis.recommendation.seller_percentage}%` }}
                    />
                    <div
                      className="bg-clay h-full"
                      style={{ width: `${aiAnalysis.recommendation.buyer_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 text-[11px] text-muted">
                Confidence Metric: <strong className="text-forest">{(aiAnalysis.confidence_score * 100).toFixed(0)}%</strong> (based on milestone deliverable matching)
              </div>
            </div>

            {/* Right: AI Synthesis Reasoning */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-forest">
                AI Synthesis Rationale
              </div>
              <div className="space-y-1.5">
                {aiAnalysis.recommendation.reasoning.map((step, idx) => (
                  <div key={idx} className="p-2 bg-paper border border-line text-ink text-[11px]">
                    <span className="font-bold text-forest">#{idx + 1}:</span> {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted">Loading AI Evidence Synthesis...</div>
        )}
      </div>

      {/* Append Additional Evidence during dispute */}
      <div className="bg-paper border border-line p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block">
            Add Supplementary Evidence Artifact
          </span>
          <span className="text-muted text-[10px]">
            Logged as current role: <strong>{activeRole.name}</strong> ({activeRole.roleType})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={newEvidenceTitle}
            onChange={(e) => setNewEvidenceTitle(e.target.value)}
            placeholder="Evidence Title (e.g. Test Run Logs)"
            className="bg-cream/50 border border-line p-1.5 text-xs text-ink outline-none"
          />
          <input
            type="text"
            value={newEvidenceUrl}
            onChange={(e) => setNewEvidenceUrl(e.target.value)}
            placeholder="URL or IPFS Link"
            className="bg-cream/50 border border-line p-1.5 text-xs text-ink font-mono outline-none"
          />
          <button
            onClick={handleAddEvidence}
            disabled={submittingEvidence || !newEvidenceTitle || !newEvidenceUrl}
            className="bg-forest text-lime-brand px-3 py-1.5 font-bold uppercase tracking-wider text-xs border border-forest disabled:opacity-50"
          >
            {submittingEvidence ? 'Uploading...' : 'Submit Evidence'}
          </button>
        </div>
      </div>

      {/* Authorized Arbiter Settlement Console */}
      <div className="bg-paper border-2 border-clay p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-clay">
              Authorized Authority Console
            </div>
            <h2 className="text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <Scale size={18} className="text-clay" />
              <span>Arbiter Ruling & Fund Settlement</span>
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted">Designated Arbiter:</span>
            <div className="text-xs font-bold text-ink">{deal.arbiter_name}</div>
          </div>
        </div>

        {deal.state === 'DISPUTED' ? (
          <div className="space-y-4 text-xs">
            {/* Outcome Selection: 3 Outcomes */}
            <div>
              <label className="font-bold text-ink uppercase tracking-wider text-[11px] block mb-2">
                1. Select Legally Binding Settlement Outcome:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Release to Seller */}
                <button
                  type="button"
                  onClick={() => setSelectedOutcome(ResolutionOutcome.RELEASE_TO_SELLER)}
                  className={`p-3 border text-left transition-all ${
                    selectedOutcome === ResolutionOutcome.RELEASE_TO_SELLER
                      ? 'border-forest bg-forest text-lime-brand shadow'
                      : 'border-line bg-paper text-ink hover:border-forest/50'
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider text-xs">Release to Seller</div>
                  <div className="text-[11px] opacity-80 mt-0.5">100% (${deal.amount_usdc} USDC) to seller</div>
                  <div className="text-[10px] opacity-70 mt-1">Work verified as compliant</div>
                </button>

                {/* Option 2: Refund to Buyer */}
                <button
                  type="button"
                  onClick={() => setSelectedOutcome(ResolutionOutcome.REFUND_TO_BUYER)}
                  className={`p-3 border text-left transition-all ${
                    selectedOutcome === ResolutionOutcome.REFUND_TO_BUYER
                      ? 'border-clay bg-clay text-white shadow'
                      : 'border-line bg-paper text-ink hover:border-clay/50'
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider text-xs">Refund Buyer</div>
                  <div className="text-[11px] opacity-80 mt-0.5">100% (${deal.amount_usdc} USDC) refunded</div>
                  <div className="text-[10px] opacity-70 mt-1">Critical non-performance</div>
                </button>

                {/* Option 3: Split Settlement */}
                <button
                  type="button"
                  onClick={() => setSelectedOutcome(ResolutionOutcome.SPLIT_SETTLEMENT)}
                  className={`p-3 border text-left transition-all ${
                    selectedOutcome === ResolutionOutcome.SPLIT_SETTLEMENT
                      ? 'border-forest bg-sage-light text-forest font-bold shadow'
                      : 'border-line bg-paper text-ink hover:border-forest/50'
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider text-xs">Split Settlement</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Custom % distribution</div>
                  <div className="text-[10px] opacity-70 mt-1">Proportional delivery share</div>
                </button>
              </div>
            </div>

            {/* Percentage Slider (for Split Settlement) */}
            {selectedOutcome === ResolutionOutcome.SPLIT_SETTLEMENT && (
              <div className="bg-sage-light p-4 border border-line space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Seller Share: {sellerSplitPct.toFixed(0)}% (${sellerAmountUsdc} USDC)</span>
                  <span>Buyer Refund: {buyerSplitPct.toFixed(0)}% (${buyerAmountUsdc} USDC)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="5"
                  value={sellerSplitPct}
                  onChange={(e) => setSellerSplitPct(Number(e.target.value))}
                  className="w-full accent-forest cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted font-mono">
                  <span>5% (Seller minimal)</span>
                  <span>50% / 50% (Equal split)</span>
                  <span>95% (Seller dominant)</span>
                </div>
              </div>
            )}

            {/* Arbiter Ruling Justification Notes */}
            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                Arbiter Decision Rationale & Official Finding *
              </label>
              <textarea
                value={arbiterNotes}
                onChange={(e) => setArbiterNotes(e.target.value)}
                placeholder="Detail the factual findings, evidence considerations, and legal/contractual basis for this ruling..."
                rows={3}
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            {/* Execute Button */}
            <div className="pt-2 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-muted">
                Requires explicit confirmation. Smart contract will execute fund distribution immediately.
              </span>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="bg-forest hover:bg-forest-hover text-lime-brand font-bold px-5 py-2.5 text-xs uppercase tracking-wider border border-forest flex items-center gap-1.5 shadow"
              >
                <Scale size={14} />
                <span>Confirm Arbiter Settlement Ruling</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-cream/50 text-center text-muted text-xs">
            This deal is not currently in active dispute state (Current state: {deal.state}).
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
          <div className="bg-paper border-2 border-forest w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="text-base font-black text-ink uppercase tracking-tight flex items-center gap-2">
              <Scale size={18} className="text-forest" />
              <span>Confirm Final Settlement Execution</span>
            </div>

            <p className="text-muted leading-relaxed">
              You are about to execute an immutable settlement on the Hedera network for <strong>{deal.id}</strong>.
            </p>

            <div className="bg-sage-light p-3 border border-line space-y-1 font-mono text-xs">
              <div>Ruling: <strong className="text-forest">{selectedOutcome}</strong></div>
              <div>Seller Payout: <strong>${sellerAmountUsdc} USDC</strong></div>
              <div>Buyer Refund: <strong>${buyerAmountUsdc} USDC</strong></div>
            </div>

            <div className="text-[11px] text-clay font-bold">
              ⚠️ Once confirmed, the smart contract executes payouts and publishes the decision to Hedera Consensus Service. This action cannot be reversed.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-muted hover:text-ink uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingResolution}
                onClick={handleConfirmResolution}
                className="bg-forest text-lime-brand px-4 py-2 text-xs font-bold uppercase tracking-wider border border-forest"
              >
                {submittingResolution ? 'Executing Settlement...' : 'Yes, Confirm Settlement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
