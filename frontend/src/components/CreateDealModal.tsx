import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  onCreateDeal: (dealData: any) => Promise<void>;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onCreateDeal,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Web & Mobile Engineering');
  const [description, setDescription] = useState('');
  const [amountUsdc, setAmountUsdc] = useState<number>(500);
  const [deadlineDays, setDeadlineDays] = useState<number>(7);
  const [deliverables, setDeliverables] = useState<string[]>([
    'Core UI Components & Layouts',
    'Responsive Testing on Mobile & Tablet',
    'GitHub Repository Code Handover'
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    'Deliverables must match agreed Figma mockups, have zero console errors, and pass static automated tests.'
  );

  // Counterparty addresses
  const [buyerAddress, setBuyerAddress] = useState(
    activeRole.roleType === 'buyer' ? activeRole.address : '0.0.482910'
  );
  const [buyerName, setBuyerName] = useState(
    activeRole.roleType === 'buyer' ? activeRole.name : 'Alice Chen (Fintech Founder)'
  );
  const [sellerAddress, setSellerAddress] = useState(
    activeRole.roleType === 'seller' ? activeRole.address : '0.0.519283'
  );
  const [sellerName, setSellerName] = useState(
    activeRole.roleType === 'seller' ? activeRole.name : 'Bob Martinez (Agency Lead)'
  );
  const [arbiterAddress, setArbiterAddress] = useState('0.0.381042');
  const [arbiterName, setArbiterName] = useState('Carol Vance (TRUSETT Certified Arbiter)');

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setDeliverables([...deliverables, newDeliverable.trim()]);
    setNewDeliverable('');
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineDays * 86400;
      await onCreateDeal({
        title,
        description,
        service_category: serviceCategory,
        buyer_address: buyerAddress,
        buyer_name: buyerName,
        seller_address: sellerAddress,
        seller_name: sellerName,
        arbiter_address: arbiterAddress,
        arbiter_name: arbiterName,
        amount_usdc: Number(amountUsdc),
        deadline_timestamp: deadlineTimestamp,
        deliverables,
        acceptance_criteria: acceptanceCriteria,
      });
      onClose();
    } catch (err) {
      alert('Error creating deal: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const protocolFee = (amountUsdc * 0.015).toFixed(2); // 1.5%

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-paper border border-line w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-cream border-b border-line p-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-forest">
              TRUSETT Protocol / Agreement Creator
            </div>
            <h2 className="text-lg font-black text-ink tracking-tight">
              {step === 'form' ? 'Create Payment Protection Deal' : 'Verify & Confirm Deal Summary'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-line text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {step === 'form' ? (
          <div className="p-6 space-y-4 text-xs">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next.js Landing Page & Payment Gateway"
                  className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                  Category
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none font-medium"
                >
                  <option>Web & Mobile Engineering</option>
                  <option>Product & UI/UX Design</option>
                  <option>Smart Contract & Audit</option>
                  <option>Brand & Motion Graphics</option>
                  <option>Marketing & Content</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                Work Scope & Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Clearly describe the objective, expected milestones, and technical requirements..."
                rows={3}
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            {/* Escrow Amount & Deadline */}
            <div className="grid grid-cols-2 gap-4 bg-sage-light p-3 border border-line">
              <div className="space-y-1">
                <label className="font-bold text-forest uppercase tracking-wider text-[11px]">
                  Escrow Amount (USDC) *
                </label>
                <div className="flex items-center">
                  <span className="bg-forest text-lime-brand px-2 py-2 font-bold font-mono">$</span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={amountUsdc}
                    onChange={(e) => setAmountUsdc(Number(e.target.value))}
                    className="w-full bg-paper border border-line border-l-0 p-2 text-ink font-bold tabular-nums outline-none focus:border-forest"
                  />
                  <span className="bg-paper border border-line border-l-0 px-2 py-2 font-bold text-muted">USDC</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest uppercase tracking-wider text-[11px]">
                  Delivery Deadline
                </label>
                <select
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  className="w-full bg-paper border border-line p-2 text-ink font-medium outline-none focus:border-forest h-[38px]"
                >
                  <option value={3}>3 Days (Fast turnaround)</option>
                  <option value={7}>7 Days (Standard sprint)</option>
                  <option value={14}>14 Days (Two weeks)</option>
                  <option value={30}>30 Days (Full month milestone)</option>
                </select>
              </div>
            </div>

            {/* Deliverables Checklist Builder */}
            <div className="space-y-2">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Agreed Deliverables Checklist ({deliverables.length})</span>
                <span className="text-[10px] text-muted lowercase">All must be submitted for release</span>
              </label>

              <div className="space-y-1.5">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-paper p-2 border border-line"
                  >
                    <span className="font-medium text-ink flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-forest bg-sage-brand px-1">
                        #{idx + 1}
                      </span>
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(idx)}
                      className="text-muted hover:text-clay p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDeliverable();
                    }
                  }}
                  placeholder="Add a milestone deliverable..."
                  className="flex-1 bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
                />
                <button
                  type="button"
                  onClick={addDeliverable}
                  className="bg-forest text-lime-brand px-3 py-2 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Acceptance Conditions */}
            <div className="space-y-1">
              <label className="font-bold text-ink uppercase tracking-wider text-[11px]">
                Acceptance & Dispute Conditions *
              </label>
              <textarea
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                rows={2}
                placeholder="Specific objective standards used by the human arbiter if a dispute arises..."
                className="w-full bg-cream/50 border border-line p-2 text-ink text-xs focus:border-forest outline-none"
              />
            </div>

            {/* Counterparty addresses */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Buyer Account</label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full bg-cream/30 border border-line p-1.5 text-xs font-mono text-ink"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Seller Account</label>
                <input
                  type="text"
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  className="w-full bg-cream/30 border border-line p-1.5 text-xs font-mono text-ink"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Live Summary Preview */
          <div className="p-6 space-y-4 text-xs">
            <div className="bg-forest text-cream p-4 border border-forest">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lime-brand">
                  Payment Protection Pass
                </span>
                <span className="text-[11px] font-mono text-cream/70">TRUSETT-PASS</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">{title || 'Untitled Deal'}</div>
              <div className="text-xs text-cream/80 mt-0.5">{serviceCategory}</div>
              <div className="text-3xl font-black text-lime-brand mt-4 tabular-nums">
                ${amountUsdc.toLocaleString()} <span className="text-sm font-normal text-white">USDC</span>
              </div>
            </div>

            <div className="bg-paper border border-line p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-forest border-b border-line pb-1">
                Deal Parameters
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted">Buyer:</span> <strong className="text-ink">{buyerName}</strong> ({buyerAddress})
                </div>
                <div>
                  <span className="text-muted">Seller:</span> <strong className="text-ink">{sellerName}</strong> ({sellerAddress})
                </div>
                <div>
                  <span className="text-muted">Designated Arbiter:</span> <strong className="text-ink">{arbiterName}</strong>
                </div>
                <div>
                  <span className="text-muted">Deadline:</span> In {deadlineDays} days
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <div className="text-[11px] font-bold uppercase tracking-wider text-forest mb-1">
                  Deliverables Checklist ({deliverables.length}):
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-ink">
                  {deliverables.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-line">
                <div className="text-[11px] font-bold uppercase tracking-wider text-forest mb-1">
                  Acceptance Conditions:
                </div>
                <p className="text-muted italic">{acceptanceCriteria}</p>
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Protocol Fee (1.5% upon settlement):</span>
                <span className="text-forest font-bold">${protocolFee} USDC</span>
              </div>
            </div>

            <div className="bg-sage-light p-3 border border-line flex items-center gap-2 text-[11px] text-forest">
              <ShieldCheck size={16} className="text-forest shrink-0" />
              <span>
                By confirming, an agreement entry will be recorded and published to the Hedera Consensus Service audit trail. Funds move only when the buyer deposits into escrow.
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-cream border-t border-line p-4 flex items-center justify-between">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-muted hover:text-ink uppercase tracking-wider px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!title.trim() || deliverables.length === 0}
                onClick={() => setStep('preview')}
                className="bg-forest hover:bg-forest-hover disabled:opacity-50 text-lime-brand font-bold px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Review Deal Summary</span>
                <ArrowRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-bold text-muted hover:text-ink uppercase tracking-wider px-3 py-2"
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="bg-lime-brand hover:bg-lime-light text-forest border border-forest font-bold px-5 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {loading ? (
                  <span>Recording on Hedera...</span>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Confirm & Create Deal</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
