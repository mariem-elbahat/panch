import React, { useState } from 'react';
import { TimelineEvent } from '../types';
import {
  FileClock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Scale,
  Upload,
  Coins,
  Filter
} from 'lucide-react';

interface AuditTimelineProps {
  events: TimelineEvent[];
  selectedDealId?: string;
  onClearFilter?: () => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  events,
  selectedDealId,
  onClearFilter,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (selectedDealId && e.deal_id !== selectedDealId) return false;
    if (filterType === 'ALL') return true;
    if (filterType === 'ON_CHAIN') return e.is_on_chain;
    if (filterType === 'DEMO') return !e.is_on_chain;
    return e.event_type === filterType;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'DEAL_CREATED':
        return <FileClock size={14} className="text-forest" />;
      case 'ESCROW_FUNDED':
        return <Coins size={14} className="text-lime-brand" />;
      case 'DELIVERY_SUBMITTED':
        return <Upload size={14} className="text-green-brand" />;
      case 'DELIVERY_ACCEPTED':
        return <CheckCircle2 size={14} className="text-green-brand" />;
      case 'DISPUTE_RAISED':
        return <Scale size={14} className="text-clay" />;
      case 'ARBITER_RULING':
        return <ShieldCheck size={14} className="text-clay" />;
      default:
        return <Clock size={14} className="text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-paper border border-line p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-forest">
            Hedera Consensus Service (HCS) Audit Trail
          </div>
          <h1 className="text-2xl font-black text-ink mt-1 tracking-tight">Audit Timeline</h1>
          <p className="text-xs text-muted max-w-xl mt-0.5">
            Immutable, public record of deal creation, deposits, delivery handovers, and arbitration rulings.
            Distinguishes live Hedera on-chain consensus records from demo transitions.
          </p>
        </div>

        {selectedDealId && onClearFilter && (
          <div className="flex items-center gap-2 bg-sage-brand p-2 border border-line text-xs">
            <span>Filtered for deal: <strong className="font-mono">{selectedDealId}</strong></span>
            <button
              onClick={onClearFilter}
              className="text-forest font-bold underline hover:text-green-brand text-[11px]"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-paper border border-line p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-ink">
          <Filter size={13} className="text-forest" />
          <span>Timeline Filter</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'ON_CHAIN', label: 'Hedera Live (On-Chain)' },
            { key: 'DEMO', label: 'Simulated Events' },
            { key: 'DEAL_CREATED', label: 'Created' },
            { key: 'ESCROW_FUNDED', label: 'Funded' },
            { key: 'DELIVERY_SUBMITTED', label: 'Delivery' },
            { key: 'DISPUTE_RAISED', label: 'Disputes' },
            { key: 'ARBITER_RULING', label: 'Rulings' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                filterType === f.key
                  ? 'bg-forest text-lime-brand border-forest'
                  : 'bg-paper text-muted border-line hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Stream */}
      <div className="bg-paper border border-line p-6 shadow-sm">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <Clock size={28} className="mx-auto text-dim mb-2" />
            <div className="text-sm font-semibold">No audit events match current criteria.</div>
          </div>
        ) : (
          <div className="relative border-l-2 border-line ml-4 pl-6 space-y-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Node icon on line */}
                <div className="absolute -left-[35px] top-0 w-6 h-6 bg-paper border border-forest flex items-center justify-center">
                  {getEventIcon(evt.event_type)}
                </div>

                <div className="bg-cream/40 border border-line p-4 space-y-2 group-hover:border-forest transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forest bg-sage-light px-1.5 py-0.5 border border-line">
                        {evt.deal_id}
                      </span>
                      <span className="font-bold text-ink uppercase text-xs tracking-wider">
                        {evt.event_type}
                      </span>
                      {evt.is_on_chain ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-forest text-lime-brand px-1.5 py-0.5 border border-forest">
                          Hedera Confirmed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-cream text-muted px-1.5 py-0.5 border border-line">
                          Local Demo Event
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-muted">
                      {new Date(evt.created_at * 1000).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink">{evt.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{evt.description}</p>

                  <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted">
                    <div>
                      Actor: <span className="text-ink font-semibold">{evt.actor}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {evt.topic_id && (
                        <span>
                          Topic: <strong className="text-forest">{evt.topic_id}</strong>
                        </span>
                      )}
                      {evt.sequence_number && (
                        <span>
                          Seq: <strong className="text-ink">#{evt.sequence_number}</strong>
                        </span>
                      )}
                      {evt.hashscan_url && (
                        <a
                          href={evt.hashscan_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest font-sans font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Inspect on HashScan</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
