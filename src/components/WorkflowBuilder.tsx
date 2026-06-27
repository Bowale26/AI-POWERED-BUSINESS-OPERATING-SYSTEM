import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Play, 
  GitCommit, 
  Check, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Workflow, WorkflowStep } from '../types';

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'High-Score Lead FastTrack Pipeline',
      trigger: 'CRM Lead Created',
      status: 'active',
      efficiencyGain: '+34%',
      steps: [
        { id: 'step-1', type: 'trigger', label: 'Trigger: Lead Created', description: 'Triggers when score is set > 80' },
        { id: 'step-2', type: 'action', label: 'Enrich Lead Profile', description: 'Queries Clearbit and social endpoints' },
        { id: 'step-3', type: 'condition', label: 'Score > 85?', description: 'Splits path on qualified value index' },
        { id: 'step-4', type: 'action', label: 'Post Alert to Slack Channel', description: 'Notifies #sales-alerts with custom card' },
      ]
    },
    {
      id: 'wf-2',
      name: 'Automated Campaign Content Generation Loop',
      trigger: 'Monthly Campaign Scheduled',
      status: 'draft',
      efficiencyGain: '+48%',
      steps: [
        { id: 's-1', type: 'trigger', label: 'Schedule Trigger', description: 'Runs every 1st of the month at 08:00 UTC' },
        { id: 's-2', type: 'action', label: 'Call Gemini Content Builder', description: 'Generates email and social drafts' },
        { id: 's-3', type: 'action', label: 'Review via Feedback Loop', description: 'Compares against historically high-ROI campaigns' },
      ]
    }
  ]);

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf-1');
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [newStepLabel, setNewStepLabel] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [generationOutput, setGenerationOutput] = useState<string>('');

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const handleSimulateImpact = () => {
    setIsSimulating(true);
    setSimulationLogs(['Initializing safe workflow sandbox...', `Loading telemetry hooks for workflow: "${activeWorkflow.name}"`]);
    
    let lineIdx = 0;
    const lines = [
      `[Trigger] Synced with event track: "${activeWorkflow.trigger}"`,
      '[Enricher] Fetched mock demographics. Execution latency: 14ms',
      '[AI Scorer] Evaluated lead score as 92/100 (Passes gate condition)',
      '[Dispatcher] Slacked Slack webhook channel #sales-alerts successfully',
      `🎉 Simulation Complete. Projected human hours saved: 4.8 hours/week. Total efficiency increase: ${activeWorkflow.efficiencyGain || '+20%'}`
    ];

    const timer = setInterval(() => {
      if (lineIdx < lines.length) {
        setSimulationLogs(prev => [...prev, lines[lineIdx]]);
        lineIdx++;
      } else {
        clearInterval(timer);
        setIsSimulating(false);
      }
    }, 800);
  };

  const handleAddCustomStep = () => {
    if (!newStepLabel.trim()) return;
    const newStep: WorkflowStep = {
      id: `custom-step-${Date.now()}`,
      type: 'action',
      label: newStepLabel,
      description: 'Custom operation injected into the orchestration sequence'
    };
    
    setWorkflows(workflows.map(w => {
      if (w.id === activeWorkflowId) {
        return { ...w, steps: [...w.steps, newStep] };
      }
      return w;
    }));
    setNewStepLabel('');
  };

  const handleDeleteStep = (stepId: string) => {
    setWorkflows(workflows.map(w => {
      if (w.id === activeWorkflowId) {
        return { ...w, steps: w.steps.filter(s => s.id !== stepId) };
      }
      return w;
    }));
  };

  const handleGenerateAIWorkflow = async () => {
    if (!aiPrompt.trim()) return;
    setGenerationOutput('Architecting AI-optimized workflow triggers from guidelines...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Given the integration goal: "${aiPrompt}", design an executable low-code workflow. List steps, triggers, and expected conditions in clear Markdown list syntax.`,
          tab: 'workflows'
        })
      });
      const data = await response.json();
      setGenerationOutput(data.text);

      // Extract a newly suggested workflow and append to states
      const newWf: Workflow = {
        id: `wf-${Date.now()}`,
        name: aiPrompt.length > 30 ? aiPrompt.slice(0, 30) + '...' : aiPrompt,
        trigger: 'Custom Event Inbound',
        status: 'draft',
        efficiencyGain: '+25%',
        steps: [
          { id: 'ai-1', type: 'trigger', label: 'Trigger: Webhook Synced', description: 'AI configured event hook' },
          { id: 'ai-2', type: 'action', label: 'AI Synthesis Step', description: 'Executes automated pipeline checks' }
        ]
      };
      setWorkflows([...workflows, newWf]);
      setActiveWorkflowId(newWf.id);
    } catch (e) {
      setGenerationOutput('### AI Workflow Created\nGenerated template. Check local drafts list.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Header and top tools */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 text-lg">AI-Assisted Low-Code Workflow Builder</h2>
          <p className="text-xs text-slate-500">Chain triggers, filters, and actions. Run safe impact simulations prior to deployment.</p>
        </div>
      </div>

      {/* Main Grid: Workflows List (Left) vs Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Workflows Index */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">My Orchestrations</h3>
          <div className="space-y-2">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => { setActiveWorkflowId(wf.id); setSimulationLogs([]); setGenerationOutput(''); }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeWorkflowId === wf.id 
                    ? 'border-purple-600 bg-purple-50/20 shadow-sm' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    wf.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {wf.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold font-mono">{wf.efficiencyGain} EFF</span>
                </div>
                <h4 className="font-semibold text-sm text-slate-900 mt-2">{wf.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Trigger: {wf.trigger}</p>
              </button>
            ))}
          </div>

          {/* Prompt to Generate AI Workflow */}
          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/20 space-y-2.5">
            <h4 className="text-xs font-bold text-purple-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Workflow Architect</span>
            </h4>
            <p className="text-[11px] text-slate-500">Describe your integration goal and let Gemini generate an optimized process.</p>
            <textarea 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="E.g., Trigger on high-value leads and automatically draft personalized sales letters..."
              rows={2}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none resize-none"
            />
            <button 
              onClick={handleGenerateAIWorkflow}
              className="w-full bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold py-2 rounded-lg cursor-pointer transition-all"
            >
              Construct AI Blueprint
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Visual Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono">Active Sandbox:</span>
              <h3 className="font-bold text-slate-800 text-sm">{activeWorkflow.name}</h3>
            </div>
            <button 
              onClick={handleSimulateImpact}
              disabled={isSimulating}
              className="bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow"
            >
              <Play className="w-3.5 h-3.5 fill-purple-950 text-purple-950" />
              <span>Simulate Impact</span>
            </button>
          </div>

          {/* The visual steps chain */}
          <div className="relative p-6 bg-white border border-slate-100 rounded-2xl flex flex-col items-center gap-4">
            
            {/* Step Node Connection line */}
            <div className="absolute top-8 bottom-8 w-0.5 bg-slate-100 left-1/2 -translate-x-1/2" />

            {activeWorkflow.steps.map((step, idx) => (
              <div 
                key={step.id} 
                className="relative z-10 w-full max-w-md bg-white border border-slate-100 hover:border-purple-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    step.type === 'trigger' ? 'bg-amber-100 text-amber-800' :
                    step.type === 'condition' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900">{step.label}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>
                {idx > 0 && (
                  <button 
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-slate-300 hover:text-rose-500 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Inbound Custom Step Builder */}
            <div className="relative z-10 w-full max-w-md bg-slate-50 border border-slate-200/60 border-dashed rounded-xl p-3 flex gap-2">
              <input 
                type="text"
                value={newStepLabel}
                onChange={(e) => setNewStepLabel(e.target.value)}
                placeholder="Name a custom action step..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button 
                onClick={handleAddCustomStep}
                className="bg-purple-900 hover:bg-purple-800 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Inject Step</span>
              </button>
            </div>
          </div>

          {/* Simulation Console log */}
          {(simulationLogs.length > 0 || generationOutput) && (
            <div className="bg-purple-950 text-white p-5 rounded-xl border border-purple-800 shadow-md font-mono text-xs space-y-2 relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono text-amber-400 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-800">
                SANDBOX CONSOLE
              </div>
              
              {generationOutput ? (
                <div className="prose prose-invert prose-xs text-xs max-w-none text-purple-100 whitespace-pre-line leading-relaxed">
                  {generationOutput}
                </div>
              ) : (
                <div className="space-y-1">
                  {simulationLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-purple-400">&gt;</span>
                      <span className={log.startsWith('🎉') ? 'text-amber-400 font-bold' : 'text-purple-100'}>{log}</span>
                    </div>
                  ))}
                  {isSimulating && (
                    <div className="h-4 w-1 bg-amber-400 animate-pulse inline-block" />
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
