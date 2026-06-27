import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Compass, 
  Terminal, 
  Briefcase, 
  BarChart3 
} from 'lucide-react';
import { AppTab } from '../types';

interface QuickStartTourProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: AppTab) => void;
}

interface TourStep {
  title: string;
  pillar: 'strategy' | 'ops' | 'analytics' | 'welcome';
  tab: AppTab;
  icon: React.ElementType;
  description: string;
  highlights: string[];
}

export default function QuickStartTour({ isOpen, onClose, setActiveTab }: QuickStartTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: "Welcome to AI-BOS Suite",
      pillar: 'welcome',
      tab: 'welcome',
      icon: Compass,
      description: "Welcome to the CRM Orchestrator command workspace. This platform brings together multi-agent AI alignment, robust data persistence with Cloud Firestore, and live operations tracking into a single unified workspace.",
      highlights: [
        "Interactive control loops and command rails",
        "Dual-engine dark-slate responsive layout",
        "Direct API integration with low-latency modeling"
      ]
    },
    {
      title: "Pillar I: Strategic Orchestration (Strategy)",
      pillar: 'strategy',
      tab: 'suite',
      icon: Terminal,
      description: "The Strategy pillar centers on designing and deploying intelligent multi-agent structures. Use the Enterprise AI Suite to orchestrate automations, define SOPs, and prompt sandboxed autonomous agent models.",
      highlights: [
        "Autonomous pipeline execution agents",
        "Direct visual strategy orchestrator loops",
        "Dynamic workflow generation and validation"
      ]
    },
    {
      title: "Pillar II: Operations Navigation (Ops)",
      pillar: 'ops',
      tab: 'operations',
      icon: Briefcase,
      description: "The Operations pillar is where real-time execution happens. Track stock levels, optimize reorders, and resolve customer support tickets. You can also view the CRM Leads Pipeline where you can now select multiple leads or tickets at once to execute bulk updates or deletions!",
      highlights: [
        "Live Supply Chain stockout prediction algorithms",
        "State-synchronized customer support tickets",
        "Batch selection & action features on Kanban leads"
      ]
    },
    {
      title: "Pillar III: Analytics & Metric Interpretation",
      pillar: 'analytics',
      tab: 'analytics',
      icon: BarChart3,
      description: "The Analytics pillar brings semantic understanding to raw metrics. Interact with predictive forecasting graphs, query records with natural language vector search, and extract clean diagnostic logs.",
      highlights: [
        "Interactive RAG metrics and data plotting",
        "Real-time chart adjustments",
        "Automated PDF & spreadsheet executive exports"
      ]
    }
  ];

  // Auto-switch tabs in the background to show the user the section they are learning about!
  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      setActiveTab(steps[currentStep].tab);
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('ai_bos_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        id="tour-modal"
        className="bg-dark-panel border border-white/10 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-fadeIn text-gray-200 flex flex-col"
      >
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-dark-bg/40">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-brand-primary/15 border border-brand-primary/20 rounded text-brand-primary">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-brand-primary uppercase block">Interactive Onboarding</span>
              <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">Quick Start Guided Tour</h3>
            </div>
          </div>
          <button 
            onClick={handleComplete} 
            className="text-gray-500 hover:text-white transition-all cursor-pointer"
            title="Skip onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Pillar Visual Header */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
            <div className="p-3 bg-brand-primary rounded-lg text-white shadow-lg shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                Step {currentStep + 1} of {steps.length} • {step.pillar.toUpperCase()} PILLAR
              </span>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{step.title}</h4>
            </div>
          </div>

          {/* Description Text */}
          <p className="text-xs text-gray-300 leading-relaxed font-normal">
            {step.description}
          </p>

          {/* Core Highlights list */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Key Workspace Capabilities:</h5>
            <ul className="space-y-1.5">
              {step.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation / Footer bar */}
        <div className="px-5 py-4 border-t border-white/5 bg-dark-bg/40 flex items-center justify-between">
          <button
            onClick={handleComplete}
            className="text-gray-500 hover:text-white text-[10px] font-mono uppercase tracking-wider cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-4">
            {/* Steps indicator dots */}
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'bg-brand-primary w-4' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase flex items-center gap-1 cursor-pointer transition-all border ${
                  currentStep === 0 
                    ? 'border-transparent text-gray-600 cursor-not-allowed' 
                    : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="bg-brand-primary hover:bg-brand-hover text-white px-3.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 cursor-pointer shadow-md transition-all"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
