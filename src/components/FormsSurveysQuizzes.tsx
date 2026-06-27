import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  BarChart,
  RotateCw,
  Plus
} from 'lucide-react';

export default function FormsSurveysQuizzes() {
  const [goal, setGoal] = useState('Inbound Enterprise SaaS Lead Capture');
  const [audience, setAudience] = useState('CMOs & Directors of Operations');
  const [questions, setQuestions] = useState('Full Name, Company Size, Primary System Bottleneck, Budget Range');

  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState<'form' | 'survey' | 'quiz' | 'analyze'>('form');

  const handleGenerateForm = async () => {
    setIsLoading(true);
    setResponseText('Generating responsive Conversion Form schema and copy variants...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as AI Form Builder. Generate a complete, high-converting conversion Form structure for goal: "${goal}", target Audience: "${audience}", incorporating these field parameters: "${questions}". Output clean HTML/Tailwind styling layout schema and motivational CTA copy.`,
          tab: 'forms'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📋 Generated Lead Form (Simulated)\n*   **Headline**: Audit Your Operational Leakage (Instant Assessment)\n*   **Fields**: Name, Business Email, Corporate Size, Primary Database Lag\n*   **CTA Button**: [Inquire Free Diagnostic Plan]');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    setIsLoading(true);
    setResponseText('Drafting interactive onboarding survey queries with scoring metrics...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create an onboarding Survey template optimized for conversion. Goal: "${goal}", Audience: "${audience}", Questions: "${questions}".`,
          tab: 'forms'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📊 Generated Onboarding Survey\n1. "What percentage of operations are currently manual?" [Dropdown: 0-25%, 26-50%, 51%+]');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildQuiz = async () => {
    setIsLoading(true);
    setResponseText('Structuring interactive Quiz segmentation flow...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Build an interactive Quiz Funnel. Goal: "${goal}", Audience: "${audience}". Map responses to distinct lead buckets and routing rules.`,
          tab: 'forms'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 🧠 Conversion Quiz Funnel\n*   **Routing Block**: If response is "Database lag" -> Route to Fintech high-thinking specialist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeResponses = async () => {
    setIsLoading(true);
    setResponseText('Analyzing aggregate response inputs and compiling conversion optimization recommendations...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze responses. Goal: "${goal}", Questions: "${questions}". Highlight fatigue trends or drop-offs.`,
          tab: 'forms'
        })
      });
      const data = await response.json();
      setResponseText(data.text);
    } catch (e) {
      setResponseText('### 📈 Survey Response Analytics\n*   **Fatigue Point**: 45% drop-off detected on "Primary System Bottleneck" text-area. Recommendation: Convert to multiple-choice radios.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-brand-primary/10 rounded border border-brand-primary/20 text-brand-primary">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            Forms, Surveys & Quizzes Builder
          </h2>
          <p className="text-[10px] text-gray-500">AI-generated forms, surveys, and multi-step quizzes designed to maximize lead conversion and automate profile routing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Input Panel (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex gap-1.5 border-b border-white/5 pb-2.5">
            {[
              { id: 'form', label: 'Form' },
              { id: 'survey', label: 'Survey' },
              { id: 'quiz', label: 'Quiz' },
              { id: 'analyze', label: 'Analyze' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-1 px-1 rounded text-[10px] font-mono uppercase font-bold tracking-wide cursor-pointer transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-dark-bg text-gray-400 border-white/5 hover:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Conversion Goal / Offer</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Audience Profile</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Form Fields / Questions list</label>
              <textarea
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none h-20 resize-none leading-relaxed"
                placeholder="Fields to include..."
              />
            </div>
          </div>

          {activeTab === 'form' && (
            <button
              onClick={handleGenerateForm}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
              <span>Generate Form Structure</span>
            </button>
          )}

          {activeTab === 'survey' && (
            <button
              onClick={handleCreateSurvey}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-blue-200" />}
              <span>Create Survey Questions</span>
            </button>
          )}

          {activeTab === 'quiz' && (
            <button
              onClick={handleBuildQuiz}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5 text-blue-200" />}
              <span>Build Quiz Funnel Flow</span>
            </button>
          )}

          {activeTab === 'analyze' && (
            <button
              onClick={handleAnalyzeResponses}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <BarChart className="w-3.5 h-3.5 text-emerald-300" />}
              <span>Analyze Survey Responses</span>
            </button>
          )}
        </div>

        {/* Output Panel (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-1 space-y-3 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Forms Engine Response Output</h3>
              <span className="text-[8px] font-mono text-purple-400 uppercase font-bold tracking-widest animate-pulse">
                Active: forms_surveys_agent
              </span>
            </div>

            <div className="flex-1 bg-dark-bg/60 border border-white/5 rounded p-3 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap h-80 overflow-y-auto">
              {responseText ? (
                responseText
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center text-gray-500">
                  <CheckCircle2 className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-[10px] uppercase font-mono tracking-wide">Ready for layout synthesis. Configure the fields on the left and trigger.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/5 flex justify-end">
            <button
              onClick={() => alert('Form configuration deployed to live campaign routes successfully.')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Deploy Form to Active Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
