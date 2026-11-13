import React, { useState } from 'react';
import { Play, RotateCcw, ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Deal, UserRole, SAMPLE_USERS } from '../types';
import { api } from '../services/api';

interface PitchTourBarProps {
  onStepComplete: () => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  setCurrentTab: (tab: string) => void;
  onSelectDeal: (deal: Deal) => void;
  deals: Deal[];
}

export const PitchTourBar: React.FC<PitchTourBarProps> = ({
  onStepComplete,
  setActiveRole,
  setCurrentTab,
  onSelectDeal,
  deals,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const demoSteps = [
    {
      num: 1,
      title: '1. Create Deal',
      role: SAMPLE_USERS[0], // Alice
      tab: 'deal-room',
      desc: 'Alice creates 200 USDC deal for Website Design'
    },
    {
      num: 2,
      title: '2. Deposit Escrow',
      role: SAMPLE_USERS[0], // Alice
      tab: 'deal-room',
      desc: 'Alice locks 200 USDC in smart contract'
    },
    {
      num: 3,
      title: '3. Bob Delivers',
      role: SAMPLE_USERS[1], // Bob
      tab: 'deal-room',
      desc: 'Bob submits work & Figma link'
    },
    {
      num: 4,
      title: '4. Dispute & AI',
      role: SAMPLE_USERS[0], // Alice
      tab: 'dispute-resolution',
      desc: 'Alice disputes layout; AI analyzes evidence'
    },
    {
      num: 5,
      title: '5. Arbiter Ruling',
      role: SAMPLE_USERS[2], // Carol
      tab: 'dispute-resolution',
      desc: 'Carol confirms 60/40 split settlement'
    }
  ];

  const executeStep = async (stepIndex: number) => {
    setIsRunning(true);
    try {
      if (stepIndex === 0) {
        // Step 1: Create 200 USDC deal
        setActiveRole(SAMPLE_USERS[0]);
        const deal = await api.createDeal({
          title: 'Website Design — Milestone 01',
          description: 'Landing page + responsive mobile layout tokens in Figma.',
          service_category: 'Product Design',
          buyer_address: SAMPLE_USERS[0].address,
          buyer_name: SAMPLE_USERS[0].name,
          seller_address: SAMPLE_USERS[1].address,
          seller_name: SAMPLE_USERS[1].name,
          arbiter_address: SAMPLE_USERS[2].address,
          arbiter_name: SAMPLE_USERS[2].name,
          amount_usdc: 200.0,
          deadline_timestamp: Math.floor(Date.now() / 1000) + 7 * 86400,
          deliverables: [
            'Figma Desktop Landing Frame',
            'Mobile Auto-Layout Tokens',
            'Exported SVG Icon Kit'
          ],
          acceptance_criteria: 'Zero layout breakage on iPhone 15 viewport, auto-layout tokens organized.'
        });
        await onStepComplete();
        onSelectDeal(deal);
        setCurrentTab('deal-room');
        setCurrentStep(1);
      } else if (stepIndex === 1) {
        // Step 2: Deposit Escrow
        setActiveRole(SAMPLE_USERS[0]);
        const allDeals = await api.getDeals();
        const target = allDeals.find((d) => d.amount_usdc === 200.0 && d.state === 'CREATED') || allDeals[0];
        if (target) {
          const updated = await api.depositEscrow(target.id);
          await onStepComplete();
          onSelectDeal(updated);
          setCurrentTab('deal-room');
        }
        setCurrentStep(2);
      } else if (stepIndex === 2) {
        // Step 3: Bob Delivers
        setActiveRole(SAMPLE_USERS[1]); // Bob
        const allDeals = await api.getDeals();
        const target = allDeals.find((d) => d.state === 'FUNDED') || allDeals[0];
        if (target) {
          const updated = await api.submitDelivery(
            target.id,
            'Completed desktop frames and vector assets. Uploaded to Figma workspace.',
            [
              {
                id: `ev-${Date.now()}`,
                uploaded_by: 'seller',
                title: 'Figma_Milestone_v1.fig',
                description: 'Figma master project link',
                url_or_hash: 'https://figma.com/@trusett/milestone-v1',
                created_at: Math.floor(Date.now() / 1000)
              }
            ]
          );
          await onStepComplete();
          onSelectDeal(updated);
          setCurrentTab('deal-room');
        }
        setCurrentStep(3);
      } else if (stepIndex === 3) {
        // Step 4: Alice Disputes & AI Analyzes
        setActiveRole(SAMPLE_USERS[0]); // Alice
        const allDeals = await api.getDeals();
        const target = allDeals.find((d) => d.state === 'DELIVERED') || allDeals[0];
        if (target) {
          const updated = await api.raiseDispute(
            target.id,
            'Mobile Viewport Truncation',
            'Desktop frame is great, but mobile auto-layout frame is missing responsive constraints.',
            []
          );
          await onStepComplete();
          onSelectDeal(updated);
          setCurrentTab('dispute-resolution');
        }
        setCurrentStep(4);
      } else if (stepIndex === 4) {
        // Step 5: Carol Arbiter Settles
        setActiveRole(SAMPLE_USERS[2]); // Carol
        const allDeals = await api.getDeals();
        const target = allDeals.find((d) => d.state === 'DISPUTED') || allDeals[0];
        if (target) {
          const updated = await api.resolveDispute(
            target.id,
            'SPLIT_SETTLEMENT' as any,
            60.0,
            'Proportional split: 60% ($120 USDC) to Bob for completed desktop scope; 40% ($80 USDC) refunded to Alice.'
          );
          await onStepComplete();
          onSelectDeal(updated);
          setCurrentTab('dispute-resolution');
        }
        setCurrentStep(5);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextStep = () => {
    const nextIdx = currentStep >= 5 ? 0 : currentStep;
    executeStep(nextIdx);
  };

  const handleReset = async () => {
    setIsRunning(true);
    try {
      await api.seedDeals();
      await onStepComplete();
      setCurrentStep(0);
      setActiveRole(SAMPLE_USERS[0]);
      setCurrentTab('dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-forest text-cream border-b border-forest-dark px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Left: Badge & Controller */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono font-bold bg-lime-brand text-forest text-[10px] px-2 py-0.5 uppercase tracking-wider">
            3-Min Pitch Tour
          </span>
          <span className="text-cream/70 hidden sm:inline">•</span>
          <span className="text-cream/90 font-medium hidden sm:inline">
            Click through the complete 5-step flow for hackathon judges:
          </span>
        </div>

        {/* Center: 5 Step Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1 md:py-0">
          {demoSteps.map((st, i) => {
            const isDone = currentStep > i;
            const isCurrent = currentStep === i;
            return (
              <button
                key={st.num}
                disabled={isRunning}
                onClick={() => executeStep(i)}
                className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 border shrink-0 ${
                  isCurrent
                    ? 'bg-lime-brand text-forest border-lime-brand shadow'
                    : isDone
                    ? 'bg-forest-hover text-cream/90 border-cream/30'
                    : 'bg-forest/60 text-cream/60 border-forest-dark hover:text-white hover:border-cream/50'
                }`}
                title={st.desc}
              >
                {isDone ? <Check size={11} className="text-lime-brand" /> : null}
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Next Step & Reset Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={isRunning}
            onClick={handleNextStep}
            className="bg-lime-brand hover:bg-lime-light text-forest font-bold px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-1 shadow transition-colors"
          >
            <span>{currentStep >= 5 ? 'Restart Tour' : 'Next Step ➔'}</span>
          </button>
          <button
            disabled={isRunning}
            onClick={handleReset}
            className="bg-forest-dark hover:bg-forest-hover text-cream/80 hover:text-white px-2.5 py-1 text-xs uppercase font-medium flex items-center gap-1 transition-colors border border-forest-hover"
            title="Reset to clean sample data"
          >
            <RotateCcw size={11} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
