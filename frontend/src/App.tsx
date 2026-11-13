import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PitchTourBar } from './components/PitchTourBar';
import { Dashboard } from './components/Dashboard';
import { DealRoom } from './components/DealRoom';
import { SellerWorkspace } from './components/SellerWorkspace';
import { BuyerWorkspace } from './components/BuyerWorkspace';
import { DisputeResolution } from './components/DisputeResolution';
import { AuditTimeline } from './components/AuditTimeline';
import { CreateDealModal } from './components/CreateDealModal';
import { Deal, TimelineEvent, SystemStatus, UserRole, SAMPLE_USERS } from './types';
import { api } from './services/api';
import { RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>(SAMPLE_USERS[0]); // Alice by default
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTimelineDealId, setFilterTimelineDealId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsData, statusData, eventsData] = await Promise.all([
        api.getDeals(),
        api.getStatus(),
        api.getGlobalTimeline()
      ]);
      setDeals(dealsData);
      setStatus(statusData);
      setEvents(eventsData);
      if (dealsData.length > 0 && !selectedDeal) {
        setSelectedDeal(dealsData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshDeal = async (dealId?: string) => {
    try {
      const allDeals = await api.getDeals();
      setDeals(allDeals);
      if (dealId) {
        const updated = allDeals.find((d) => d.id === dealId);
        if (updated) setSelectedDeal(updated);
      } else if (selectedDeal) {
        const updated = allDeals.find((d) => d.id === selectedDeal.id);
        if (updated) setSelectedDeal(updated);
      }
      const updatedEvents = await api.getGlobalTimeline();
      setEvents(updatedEvents);
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const handleToggleDemoMode = async (enabled: boolean) => {
    try {
      const res = await api.toggleMode(enabled);
      setStatus(res.status);
    } catch (err) {
      alert('Error toggling mode: ' + err);
    }
  };

  const handleCreateDeal = async (dealData: any) => {
    const newDeal = await api.createDeal(dealData);
    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDeal(newDeal);
    setCurrentTab('deal-room');
    const updatedEvents = await api.getGlobalTimeline();
    setEvents(updatedEvents);
  };

  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setCurrentTab('deal-room');
  };

  const handleNavigateToDispute = (deal: Deal) => {
    setSelectedDeal(deal);
    setCurrentTab('dispute-resolution');
  };

  const handleNavigateToAudit = (dealId: string) => {
    setFilterTimelineDealId(dealId);
    setCurrentTab('audit-timeline');
  };

  const handleResetData = async () => {
    if (!confirm('Reset all deals back to initial sample prototype state?')) return;
    try {
      await api.seedDeals();
      await loadData();
      alert('Prototype reset to clean state.');
    } catch (e) {
      alert('Error resetting data: ' + e);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex flex-col font-sans selection:bg-lime-brand selection:text-forest">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        status={status}
        onToggleDemoMode={handleToggleDemoMode}
        onOpenCreateDeal={() => setCreateDealOpen(true)}
      />

      {/* Guided 3-Minute Hackathon Pitch Tour Bar */}
      <PitchTourBar
        onStepComplete={handleRefreshDeal}
        setActiveRole={setActiveRole}
        setCurrentTab={setCurrentTab}
        onSelectDeal={setSelectedDeal}
        deals={deals}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-20 text-center text-muted">
            <div className="text-sm font-bold uppercase tracking-wider text-forest mb-2">TRUSETT Engine</div>
            <div className="text-xs">Connecting to Hedera HCS & escrow services...</div>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                deals={deals}
                events={events}
                activeRole={activeRole}
                onSelectDeal={handleSelectDeal}
                onOpenCreateDeal={() => setCreateDealOpen(true)}
                onRefresh={loadData}
              />
            )}

            {currentTab === 'deal-room' && (
              selectedDeal ? (
                <DealRoom
                  deal={selectedDeal}
                  activeRole={activeRole}
                  onRefreshDeal={handleRefreshDeal}
                  onNavigateToDispute={handleNavigateToDispute}
                  onNavigateToAudit={handleNavigateToAudit}
                />
              ) : (
                <div className="bg-paper border border-line p-8 text-center text-muted">
                  <div className="text-sm font-semibold">Please select a deal from the dashboard</div>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="mt-3 text-xs font-bold text-forest underline"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )
            )}

            {currentTab === 'seller-workspace' && (
              <SellerWorkspace
                deals={deals}
                activeRole={activeRole}
                onSelectDeal={handleSelectDeal}
              />
            )}

            {currentTab === 'buyer-workspace' && (
              <BuyerWorkspace
                deals={deals}
                activeRole={activeRole}
                onSelectDeal={handleSelectDeal}
                onOpenCreateDeal={() => setCreateDealOpen(true)}
              />
            )}

            {currentTab === 'dispute-resolution' && (
              selectedDeal ? (
                <DisputeResolution
                  deal={selectedDeal}
                  activeRole={activeRole}
                  onRefreshDeal={handleRefreshDeal}
                  onNavigateToDealRoom={handleSelectDeal}
                />
              ) : (
                <div className="bg-paper border border-line p-8 text-center text-muted">
                  <div className="text-sm font-semibold">Please select a deal to review dispute</div>
                </div>
              )
            )}

            {currentTab === 'audit-timeline' && (
              <AuditTimeline
                events={events}
                selectedDealId={filterTimelineDealId}
                onClearFilter={() => setFilterTimelineDealId(undefined)}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-paper border-t border-line py-4 px-4 sm:px-6 lg:px-8 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-forest">TRUSETT</span>
            <span>• Hedera Cross-Campus Challenge 2026</span>
            <span>• Irreversible payment protection</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1 text-muted hover:text-clay transition-colors"
              title="Resets seeded deals for testing demonstration"
            >
              <RotateCcw size={11} />
              <span>Reset Prototype Data</span>
            </button>
            <a
              href="https://hashscan.io/testnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest hover:underline"
            >
              Hedera HashScan Explorer
            </a>
          </div>
        </div>
      </footer>

      {/* Create Deal Modal */}
      <CreateDealModal
        isOpen={createDealOpen}
        onClose={() => setCreateDealOpen(false)}
        activeRole={activeRole}
        onCreateDeal={handleCreateDeal}
      />
    </div>
  );
};
