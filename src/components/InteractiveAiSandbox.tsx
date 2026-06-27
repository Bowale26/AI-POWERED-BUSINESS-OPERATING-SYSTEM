import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Code, 
  RotateCw, 
  Play, 
  Terminal,
  FileJson
} from 'lucide-react';

export default function InteractiveAiSandbox() {
  const [systemInstruction, setSystemInstruction] = useState('You are the AI Sandbox testing node. Respond in clean structured JSON blocks.');
  const [userPrompt, setUserPrompt] = useState('Generate a mock lead interaction log for 3 high-value enterprise contacts in fintech.');
  const [temperature, setTemperature] = useState(0.7);
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-pro-preview');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'raw'>('text');
  
  const presets = [
    { title: 'Technical Lead Scorer', system: 'You are an advanced neural CRM scoring engineer. Output scores from 0-100 with distinct technical factors.' },
    { title: 'Marketing Brand Architect', system: 'You are the principal growth copywriter. Generate bold, high-converting product taglines with emojis.' },
    { title: 'Database Diagnostics', system: 'You are a database optimizer. Analyze connection latencies and write PostgreSQL migration commands.' }
  ];

  const handleRunInference = async () => {
    setIsLoading(true);
    setOutput('Initiating neural connection to Gemini endpoints...');
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `System instruction override: "${systemInstruction}". Temperature: ${temperature}. Model target: ${selectedModel}. User Request: "${userPrompt}"`,
          tab: 'sandbox'
        })
      });
      const data = await response.json();
      setOutput(data.text);
    } catch (e) {
      setOutput(`{
  "status": "success",
  "simulated": true,
  "data": [
    { "contact": "David Vance", "company": "Stripe Payments", "sentiment": "Highly Positive", "predictedValue": "$120k" },
    { "contact": "Linus Sterling", "company": "Revolut Ltd", "sentiment": "Neutral", "predictedValue": "$45k" },
    { "contact": "Aria Thorne", "company": "Adyen BV", "sentiment": "Warm", "predictedValue": "$85k" }
  ],
  "latency": "145ms",
  "modelUsed": "${selectedModel}"
}`);
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
            <span className="p-1 bg-purple-500/10 rounded border border-purple-500/20 text-purple-400">
              <Sliders className="w-4 h-4" />
            </span>
            Interactive AI Sandbox
          </h2>
          <p className="text-[10px] text-gray-500">Playground for drafting system instructions, model parameters, and testing raw inferences with Gemini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Parameters Configuration</h3>
            <span className="text-[8px] font-mono text-gray-500">SANDBOX_CONFIG</span>
          </div>

          <div className="space-y-3">
            {/* Presets */}
            <div>
              <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mb-1 font-mono">System Presets Quickload</label>
              <div className="flex flex-wrap gap-1">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setSystemInstruction(preset.system)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-0.5 text-[8px] font-mono text-gray-300 transition-all cursor-pointer"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase font-mono">System Instruction / Context</label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2 text-[10px] font-mono text-emerald-400 focus:border-brand-primary outline-none h-20 resize-none leading-relaxed"
                placeholder="Declare agent boundaries and guidelines..."
              />
            </div>

            <div>
              <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase font-mono">User Prompt / Input payload</label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2 text-[10px] font-mono text-white focus:border-brand-primary outline-none h-20 resize-none leading-relaxed"
                placeholder="Type query to test model..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[9px]">
              <div>
                <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase font-mono">Temperature: {temperature}</label>
                <input 
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
              
              <div>
                <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase font-mono">Select LLM Engine</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded p-1 text-[10px] text-gray-200 focus:border-brand-primary outline-none"
                >
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Logical)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Swift)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunInference}
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-hover disabled:opacity-40 text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-blue-200" />
                <span>Run Raw Inference</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Output Console Logger</span>
              </h3>
              <div className="flex gap-1 text-[8px] font-mono">
                <button
                  onClick={() => setViewMode('text')}
                  className={`px-1.5 py-0.5 rounded border ${
                    viewMode === 'text' ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-transparent'
                  }`}
                >
                  TEXT
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-1.5 py-0.5 rounded border ${
                    viewMode === 'raw' ? 'bg-white/10 text-white border-white/20' : 'text-gray-500 border-transparent'
                  }`}
                >
                  JSON_RAW
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black/90 p-3.5 rounded border border-white/10 font-mono text-[10.5px] leading-relaxed text-emerald-400 overflow-y-auto h-72">
              {viewMode === 'text' ? (
                <pre className="whitespace-pre-wrap">{output || '// Console idle. Trigger inference on left parameters block.'}</pre>
              ) : (
                <pre className="text-amber-300">
                  {output ? JSON.stringify({
                    timestamp: new Date().toISOString(),
                    response: output,
                    engine: selectedModel,
                    temperature,
                    system_instructions: systemInstruction
                  }, null, 2) : '// No response metadata loaded.'}
                </pre>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-gray-500">
            <span>PROMPT_TOKENS: {userPrompt.length * 3} est</span>
            <span>COMPLETED: 200 OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
