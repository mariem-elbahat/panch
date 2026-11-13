import React, { useState } from 'react';
import { BrandMark } from './BrandMark';
import { UserRole, SAMPLE_USERS, SystemStatus } from '../types';
import {
  Users,
  Shield,
  Layers,
  ArrowRightLeft,
  Briefcase,
  Scale,
  FileClock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  status: SystemStatus | null;
  onToggleDemoMode: (enabled: boolean) => void;
  onOpenCreateDeal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  status,
  onToggleDemoMode,
  onOpenCreateDeal,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-line">
      {/* Top micro ticker */}
      <div className="bg-forest text-cream/80 text-[11px] px-4 py-1 flex items-center justify-between tracking-wide font-mono">
        <div className="flex items-center gap-3">
          <span className="text-lime-brand font-bold">HEDERA DUAL-ENGINE</span>
          <span className="text-cream/50">•</span>
          <span>HSCS Escrow + HTS USDC + HCS Audit</span>
          {status && (
            <>
              <span className="text-cream/50">•</span>
              <span>USDC: <span className="text-lime-brand">{status.usdc_token_id}</span></span>
              <span className="text-cream/50">•</span>
              <span>HCS Topic: <span className="text-lime-brand">{status.active_topic_id}</span></span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://hashscan.io/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>HashScan Testnet</span>
            <ExternalLink size={10} />
          </a>
          <span className="text-cream/50">•</span>
          <span className="text-lime-brand font-semibold">Hackathon MVP</span>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <BrandMark size={34} />
          <div>
            <div className="flex items-baseline leading-none">
              <span className="text-2xl font-black text-ink tracking-tight">TRU</span>
              <span className="text-2xl font-black text-forest tracking-tight">SETT</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-widest text-forest/70 bg-sage-brand px-1.5 py-0.5 border border-line">
                Hedera
              </span>
            </div>
            <div className="text-[10px] text-muted tracking-tight">
              Trust meets settlement • Payment protection
            </div>
          </div>
        </div>

        {/* Center navigation tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'dashboard'
                ? 'bg-forest text-white border-forest'
                : 'bg-paper text-ink border-line hover:border-forest/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('deal-room')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'deal-room'
                ? 'bg-forest text-white border-forest'
                : 'bg-paper text-ink border-line hover:border-forest/50'
            }`}
          >
            Deal Room
          </button>
          <button
            onClick={() => setCurrentTab('seller-workspace')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'seller-workspace'
                ? 'bg-forest text-white border-forest'
                : 'bg-paper text-ink border-line hover:border-forest/50'
            }`}
          >
            Seller
          </button>
          <button
            onClick={() => setCurrentTab('buyer-workspace')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'buyer-workspace'
                ? 'bg-forest text-white border-forest'
                : 'bg-paper text-ink border-line hover:border-forest/50'
            }`}
          >
            Buyer
          </button>
          <button
            onClick={() => setCurrentTab('dispute-resolution')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'dispute-resolution'
                ? 'bg-clay text-white border-clay'
                : 'bg-paper text-ink border-line hover:border-clay/50'
            }`}
          >
            <span className="flex items-center gap-1">
              <Scale size={13} />
              <span>Dispute & AI</span>
            </span>
          </button>
          <button
            onClick={() => setCurrentTab('audit-timeline')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all border ${
              currentTab === 'audit-timeline'
                ? 'bg-forest text-white border-forest'
                : 'bg-paper text-ink border-line hover:border-forest/50'
            }`}
          >
            <span className="flex items-center gap-1">
              <FileClock size={13} />
              <span>Audit Trail</span>
            </span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick Create Deal Button */}
          <button
            onClick={onOpenCreateDeal}
            className="hidden sm:inline-flex items-center gap-1.5 bg-lime-brand hover:bg-lime-light text-forest font-bold px-3 py-1.5 text-xs uppercase tracking-wider border border-forest transition-colors shadow-sm"
          >
            <span>+ Create Deal</span>
          </button>

          {/* Mode Switcher Pill */}
          <div className="flex items-center border border-line bg-paper p-0.5">
            <button
              onClick={() => onToggleDemoMode(true)}
              className={`px-2 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                status?.demo_mode
                  ? 'bg-forest text-lime-brand'
                  : 'text-muted hover:text-ink'
              }`}
              title="Demo Mode: Simulated Hedera state transitions for zero-gas hackathon testing"
            >
              Demo Mode
            </button>
            <button
              onClick={() => onToggleDemoMode(false)}
              className={`px-2 py-1 text-[11px] font-bold tracking-wider uppercase transition-colors ${
                !status?.demo_mode
                  ? 'bg-green-brand text-white'
                  : 'text-muted hover:text-ink'
              }`}
              title="Testnet Mode: Live HCS and smart contract execution on Hedera Testnet"
            >
              Testnet Live
            </button>
          </div>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 bg-paper border border-line px-2.5 py-1.5 hover:border-forest transition-colors text-left"
            >
              <div className="w-6 h-6 bg-forest text-lime-brand flex items-center justify-center font-bold text-xs">
                {activeRole.avatarInitials}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-ink leading-tight">{activeRole.name}</div>
                <div className="text-[10px] text-muted font-mono leading-tight">{activeRole.address}</div>
              </div>
              <ChevronDown size={14} className="text-muted" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-paper border border-line shadow-xl z-50 p-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted px-2 py-1">
                  Switch Active Role
                </div>
                {SAMPLE_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setActiveRole(user);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 text-left hover:bg-cream transition-colors border ${
                      activeRole.id === user.id ? 'border-forest bg-sage-light' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-forest text-lime-brand flex items-center justify-center font-bold text-xs">
                        {user.avatarInitials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">{user.name}</div>
                        <div className="text-[10px] text-muted">{user.description}</div>
                        <div className="text-[10px] font-mono text-forest">{user.address}</div>
                      </div>
                    </div>
                    {activeRole.id === user.id && <Check size={14} className="text-forest" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
