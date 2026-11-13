import React, { useState } from 'react';
import { Deal, DealState, TimelineEvent, UserRole } from '../types';
import {
  Coins,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Plus,
  Scale,
  FileCheck,
  ExternalLink,
  Lock,
  RotateCcw
} from 'lucide-react';

interface DashboardProps {
  deals: Deal[];
  events: TimelineEvent[];
  activeRole: UserRole;
  onSelectDeal: (deal: Deal) => void;
  onOpenCreateDeal: () => void;
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  deals,
  events,
  activeRole,
  onSelectDeal,
  onOpenCreateDeal,
  onRefresh,
}) => {
  const [filterState, setFilterState] = useState<string>('ALL');

  // Compute metrics
  const totalEscrowed = deals
    .filter((d) => d.state === 'FUNDED' || d.state === 'DELIVERED' || d.state === 'DISPUTED')
    .reduce((acc, d) => acc + d.amount_usdc, 0);

  const activeDealsCount = deals.filter(
    (d) => d.state === 'CREATED' || d.state === 'FUNDED' || d.state === 'DELIVERED'
  ).length;

  const disputedDealsCount = deals.filter((d) => d.state === 'DISPUTED').length;
  const settledDealsCount = deals.filter((d) => d.state === 'SETTLED' || d.state === 'REFUNDED').length;

  // Pending actions relevant to current user
  const pendingActions = deals.filter((d) => {
    if (activeRole.roleType === 'buyer') {
      return d.state === 'CREATED' || d.state === 'DELIVERED';
    } else if (activeRole.roleType === 'seller') {
      return d.state === 'FUNDED';
    } else if (activeRole.roleType === 'arbiter') {
      return d.state === 'DISPUTED';
    }
    return false;
  });

  // Filtered deals
  const filteredDeals = deals.filter((d) => {
    if (filterState === 'ALL') return true;
    if (filterState === 'ACTIVE') return d.state === 'FUNDED' || d.state === 'DELIVERED';
    if (filterState === 'PENDING') return d.state === 'CREATED';
    return d.state === filterState;
  });

  const getStatusBadge = (state: DealState) => {
    switch (state) {
      case 'CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-sage-brand text-forest border border-line">
            <Clock size={11} />
            <span>Awaiting Deposit</span>
          </span>
        );
      case 'FUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-lime-light text-forest border border-lime-brand">
            <Lock size={11} />
            <span>Escrow Locked</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-forest text-lime-brand border border-forest">
            <FileCheck size={11} />
            <span>Delivered (In Review)</span>
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-clay-light text-clay border border-clay">
            <Scale size={11} />
            <span>Under Dispute</span>
          </span>
        );
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-green-brand text-white border border-green-brand">
            <CheckCircle2 size={11} />
            <span>Settled</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-gold-light text-gold border border-gold">
            <RotateCcw size={11} />
            <span>Refunded</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Thesis Bar */}
      <div className="bg-paper border border-line p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-forest bg-lime-light px-2 py-0.5 border border-lime-brand">
              Payment Protection Engine
            </span>
            <span className="text-xs text-muted">Active Role: <strong className="text-ink">{activeRole.name}</strong> ({activeRole.description})</span>
          </div>
          <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">
            Payments settle. Trust doesn’t.
          </h1>
          <p className="text-xs text-muted max-w-2xl mt-0.5">
            TRUSETT protects digital service milestones with programmable USDC escrow, delivery proof verification, and human-authorized dispute settlement on Hedera.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateDeal}
            className="flex items-center gap-2 bg-forest hover:bg-forest-hover text-lime-brand font-bold px-4 py-2.5 text-xs uppercase tracking-wider border border-forest transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Create New Deal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-paper border border-line p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Escrow Locked</span>
            <Coins size={14} className="text-forest" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">
            ${totalEscrowed.toLocaleString()} <span className="text-xs font-semibold text-muted">USDC</span>
          </div>
          <div className="text-[10px] text-muted mt-1">In smart contract custody</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-paper border border-line p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Active Deals</span>
            <Clock size={14} className="text-green-brand" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">{activeDealsCount}</div>
          <div className="text-[10px] text-muted mt-1">Created, funded, or delivering</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-paper border border-line p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Disputed Deals</span>
            <Scale size={14} className="text-clay" />
          </div>
          <div className="text-2xl font-black text-clay mt-1 tabular-nums">{disputedDealsCount}</div>
          <div className="text-[10px] text-muted mt-1">Awaiting AI & arbiter review</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-paper border border-line p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
            <span>Settled / Completed</span>
            <CheckCircle2 size={14} className="text-forest" />
          </div>
          <div className="text-2xl font-black text-ink mt-1 tabular-nums">{settledDealsCount}</div>
          <div className="text-[10px] text-muted mt-1">Released or split settlements</div>
        </div>
      </div>

      {/* Role Action Alert (if pending action exists) */}
      {pendingActions.length > 0 && (
        <div className="bg-sage-light border border-line p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest text-lime-brand flex items-center justify-center font-bold text-sm">
              !
            </div>
            <div>
              <div className="text-xs font-bold text-forest uppercase tracking-wider">
                Action Required For Your Active Role ({activeRole.name})
              </div>
              <div className="text-xs text-ink">
                You have {pendingActions.length} deal(s) requiring your attention (e.g. deposit, delivery submission, or dispute ruling).
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectDeal(pendingActions[0])}
            className="text-xs font-bold bg-forest text-lime-brand hover:bg-forest-hover px-3 py-1.5 uppercase tracking-wider flex items-center gap-1"
          >
            <span>Review First ({pendingActions[0].id})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Main Content Grid: Deals list + Recent activity ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filterable Deals List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Filter pills */}
          <div className="bg-paper border border-line p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Filter size={13} className="text-forest" />
              <span>Deals ({filteredDeals.length})</span>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'ACTIVE', label: 'Active' },
                { key: 'PENDING', label: 'Awaiting Deposit' },
                { key: 'DISPUTED', label: 'Disputed' },
                { key: 'SETTLED', label: 'Settled' }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterState(f.key)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                    filterState === f.key
                      ? 'bg-forest text-lime-brand border-forest'
                      : 'bg-paper text-muted border-line hover:text-ink'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deals Cards */}
          <div className="space-y-3">
            {filteredDeals.length === 0 ? (
              <div className="bg-paper border border-line p-8 text-center text-muted">
                <Clock size={28} className="mx-auto text-dim mb-2" />
                <div className="text-sm font-semibold">No deals match this filter</div>
                <button
                  onClick={onOpenCreateDeal}
                  className="mt-3 text-xs font-bold text-forest underline hover:text-green-brand"
                >
                  Create a new payment protection deal
                </button>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="bg-paper border border-line hover:border-forest transition-all p-4 cursor-pointer group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-forest bg-sage-brand px-1.5 py-0.5 border border-line">
                          {deal.id}
                        </span>
                        <span className="text-[11px] text-muted font-medium uppercase tracking-wider">
                          {deal.service_category}
                        </span>
                        {deal.is_demo && (
                          <span className="text-[10px] bg-cream text-muted px-1 border border-line">
                            SIMULATED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-ink group-hover:text-forest transition-colors">
                        {deal.title}
                      </h3>
                      <p className="text-xs text-muted line-clamp-1">{deal.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-ink tabular-nums">
                        ${deal.amount_usdc.toLocaleString()}{' '}
                        <span className="text-xs font-semibold text-muted">USDC</span>
                      </div>
                      <div className="mt-1">{getStatusBadge(deal.state)}</div>
                    </div>
                  </div>

                  {/* Bottom Counterparties Strip */}
                  <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-muted font-mono">
                    <div className="flex items-center gap-4">
                      <div>
                        Buyer: <span className="text-ink font-semibold">{deal.buyer_name}</span>
                      </div>
                      <div>
                        Seller: <span className="text-ink font-semibold">{deal.seller_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-forest font-sans text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Deal Room</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-4">
          <div className="bg-paper border border-line p-3 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <Clock size={13} className="text-forest" />
              <span>Consensus Audit Stream</span>
            </div>
            <span className="text-[10px] font-mono text-muted">Hedera HCS Topic</span>
          </div>

          <div className="bg-paper border border-line p-4 space-y-3">
            {events.slice(0, 6).map((evt) => (
              <div key={evt.id} className="pb-3 border-b border-line/50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-forest bg-sage-light px-1 border border-line">
                    {evt.event_type}
                  </span>
                  <span className="text-muted">
                    {new Date(evt.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs font-bold text-ink mt-1">{evt.title}</div>
                <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{evt.description}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-muted font-mono">
                  <span>Actor: {evt.actor.split(' ')[0]}</span>
                  {evt.hashscan_url && (
                    <a
                      href={evt.hashscan_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest hover:underline flex items-center gap-0.5"
                    >
                      <span>HashScan</span>
                      <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
