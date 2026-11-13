import React from 'react';
import { Deal, UserRole } from '../types';
import {
  Coins,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface BuyerWorkspaceProps {
  deals: Deal[];
  activeRole: UserRole;
  onSelectDeal: (deal: Deal) => void;
  onOpenCreateDeal: () => void;
}

export const BuyerWorkspace: React.FC<BuyerWorkspaceProps> = ({
  deals,
  activeRole,
  onSelectDeal,
  onOpenCreateDeal,
}) => {
  // Filter deals where user is buyer
  const buyerDeals = deals.filter(
    (d) => d.buyer_address === activeRole.address || activeRole.roleType === 'buyer'
  );

  return (
    <div className="space-y-6">
      <div className="bg-paper border border-line p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-forest">
            Protected Payments & Deliverable Verification
          </div>
          <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">Buyer Workspace</h1>
          <p className="text-xs text-muted max-w-xl mt-0.5">
            Logged in as <strong className="text-ink">{activeRole.name}</strong> ({activeRole.address}).
            Review agreements, deposit USDC into escrow custody, verify deliveries, and release funds or dispute.
          </p>
        </div>

        <button
          onClick={onOpenCreateDeal}
          className="bg-forest hover:bg-forest-hover text-lime-brand font-bold px-4 py-2 text-xs uppercase tracking-wider border border-forest transition-colors shadow-sm"
        >
          + Propose New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {buyerDeals.length === 0 ? (
          <div className="bg-paper border border-line p-8 text-center text-muted">
            <Coins size={28} className="mx-auto text-dim mb-2" />
            <div className="text-sm font-semibold">No buyer deals found for this account.</div>
          </div>
        ) : (
          buyerDeals.map((deal) => {
            const isCreated = deal.state === 'CREATED';
            const isDelivered = deal.state === 'DELIVERED';
            const isDisputed = deal.state === 'DISPUTED';

            return (
              <div
                key={deal.id}
                className="bg-paper border border-line hover:border-forest p-5 shadow-sm space-y-3 transition-colors"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-line pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forest bg-sage-brand px-1.5 py-0.5 border border-line">
                        {deal.id}
                      </span>
                      <span className="text-xs text-muted font-bold uppercase">{deal.service_category}</span>
                    </div>
                    <h2 className="text-lg font-bold text-ink mt-1">{deal.title}</h2>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-ink tabular-nums">
                      ${deal.amount_usdc.toLocaleString()} <span className="text-xs font-bold text-muted">USDC</span>
                    </div>
                    <span className="inline-block mt-0.5 text-[11px] font-bold uppercase tracking-wider text-forest bg-lime-light px-2 py-0.5 border border-line">
                      Status: {deal.state}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted">
                  Seller: <strong className="text-ink">{deal.seller_name}</strong> ({deal.seller_address})
                </div>

                {/* Buyer Call to Action */}
                <div className="p-3 bg-cream/40 border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    {isCreated && (
                      <span className="text-forest font-bold">
                        ⚡ Agreement awaiting your escrow deposit of ${deal.amount_usdc} USDC.
                      </span>
                    )}
                    {isDelivered && (
                      <span className="text-forest font-bold">
                        🎁 Work submitted! Inspect deliverables to accept and release funds, or raise a dispute.
                      </span>
                    )}
                    {isDisputed && (
                      <span className="text-clay font-bold">
                        ⚖️ Dispute active. Case is being evaluated with AI assistance.
                      </span>
                    )}
                    {deal.state === 'FUNDED' && (
                      <span className="text-muted">
                        Escrow funded. Seller is currently completing agreed deliverables.
                      </span>
                    )}
                    {(deal.state === 'SETTLED' || deal.state === 'REFUNDED') && (
                      <span className="text-green-brand font-bold">
                        ✓ Transaction completed. Settlement successfully finalized.
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectDeal(deal)}
                    className="bg-forest hover:bg-forest-hover text-lime-brand font-bold px-4 py-2 uppercase tracking-wider text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>
                      {isCreated
                        ? 'Deposit Escrow Now'
                        : isDelivered
                        ? 'Review & Accept Work'
                        : 'Inspect Deal Room'}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
