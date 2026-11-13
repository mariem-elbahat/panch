import React from 'react';
import { Deal, UserRole } from '../types';
import {
  Briefcase,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  ExternalLink
} from 'lucide-react';

interface SellerWorkspaceProps {
  deals: Deal[];
  activeRole: UserRole;
  onSelectDeal: (deal: Deal) => void;
}

export const SellerWorkspace: React.FC<SellerWorkspaceProps> = ({
  deals,
  activeRole,
  onSelectDeal,
}) => {
  // Filter deals assigned to seller
  const sellerDeals = deals.filter(
    (d) => d.seller_address === activeRole.address || activeRole.roleType === 'seller'
  );

  return (
    <div className="space-y-6">
      <div className="bg-paper border border-line p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-forest">
            Work In Progress & Milestone Handover
          </div>
          <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">Seller Workspace</h1>
          <p className="text-xs text-muted max-w-xl mt-0.5">
            Logged in as <strong className="text-ink">{activeRole.name}</strong> ({activeRole.address}).
            View funded escrow milestones, attach delivery artifacts, and request buyer acceptance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sellerDeals.length === 0 ? (
          <div className="bg-paper border border-line p-8 text-center text-muted">
            <Briefcase size={28} className="mx-auto text-dim mb-2" />
            <div className="text-sm font-semibold">No deals assigned to this seller account.</div>
          </div>
        ) : (
          sellerDeals.map((deal) => {
            const isFunded = deal.state === 'FUNDED';
            const isDelivered = deal.state === 'DELIVERED';
            const isDisputed = deal.state === 'DISPUTED';
            const isSettled = deal.state === 'SETTLED' || deal.state === 'REFUNDED';

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
                      State: {deal.state}
                    </span>
                  </div>
                </div>

                {/* Milestones checklist */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                    Milestone Deliverables:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {deal.deliverables.map((del) => (
                      <div key={del.id} className="p-2 bg-cream/40 border border-line text-xs font-medium text-ink flex items-center gap-1.5">
                        <span className="text-forest font-bold">✓</span>
                        <span className="truncate">{del.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handover action & details */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-muted">
                    Buyer: <strong className="text-ink">{deal.buyer_name}</strong> ({deal.buyer_address})
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDeal(deal)}
                      className="bg-forest hover:bg-forest-hover text-lime-brand font-bold px-4 py-2 uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <span>
                        {isFunded
                          ? 'Submit Delivery & Evidence'
                          : isDisputed
                          ? 'Respond to Dispute'
                          : 'Open Deal Room'}
                      </span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
