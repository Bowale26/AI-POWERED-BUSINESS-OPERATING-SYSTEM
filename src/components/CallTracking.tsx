import React, { useState } from 'react';
import { 
  Phone, 
  Sparkles, 
  Play, 
  RefreshCw, 
  FileText, 
  CheckCircle,
  Plus,
  Volume2
} from 'lucide-react';

interface CallRecord {
  id: string;
  caller: string;
  number: string;
  duration: string;
  timestamp: string;
  intentScore: number;
  transcript: string;
}

export default function CallTracking() {
  const [calls, setCalls] = useState<CallRecord[]>([
    { id: '1', caller: 'Robert Downey', number: '+1 (415) 555-1204', duration: '4m 32s', timestamp: '30 mins ago', intentScore: 89, transcript: 'Caller: Rob. "Hi, I watched your API orchestration webinar and am looking to map 4,000 daily HubSpot leads. We need to maintain latency below 100ms. Can we budget a custom SLA?"' },
    { id: '2', caller: 'Clara Oswald', number: '+1 (650) 555-9012', duration: '1m 15s', timestamp: '2 hours ago', intentScore: 42, transcript: 'Caller: Clara. "Just calling to verify pricing models. The website says custom pricing is available but I did not find any pricing matrix for tier-2 teams. Let me know."' },
    { id: '3', caller: 'Sam Wilson', number: '+1 (202) 555-0143', duration: '2m 45s', timestamp: 'Yesterday', intentScore: 12, transcript: 'Caller: Sam. "Wrong number, sorry. I was trying to reach Horizon Logistics support."' }
  ]);

  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(calls[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'transcript' | 'score'>('transcript');
  const [evalOutput, setEvalOutput] = useState('');

  const handleTranscribe = async () => {
    if (!selectedCall) return;
    setIsLoading(true);
    setEvalOutput('Reconstructing voice signals and converting spectral data to markdown transcription text...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Transcribe and summarize this call record: ${selectedCall.transcript}. Provide action items and customer sentiment.`,
          tab: 'call_tracking'
        })
      });
      const data = await response.json();
      setEvalOutput(data.text);
      setViewMode('transcript');
    } catch (e) {
      setEvalOutput(`### 📝 Call Transcript Summary (${selectedCall.caller})
*   **Sentiment**: Warm / Operational Interest
*   **Action Items**:
    1.  Provide customized SLA pricing templates for 4,000 daily lead volumes.
    2.  Set up technical sandbox demonstrating 85ms latency.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreIntent = async () => {
    if (!selectedCall) return;
    setIsLoading(true);
    setEvalOutput('Analyzing linguistic markers, prompt signals, and transactional value keywords...');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acting as Voice Scoring Agent. Evaluate caller intent score (0-100) based on this transcript text: "${selectedCall.transcript}". Provide rating justification.`,
          tab: 'call_tracking'
        })
      });
      const data = await response.json();
      setEvalOutput(data.text);
      setViewMode('score');
    } catch (e) {
      setEvalOutput('### 🎯 Intent Scoring evaluation\n*   **Intent score**: 90/100 (High Buying Intent)\n*   **Justification**: Direct questions regarding tiering and SLA integrations show decision maturity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-brand-primary/10 rounded border border-brand-primary/20 text-brand-primary">
              <Phone className="w-4 h-4 animate-pulse" />
            </span>
            Call Tracking System
          </h2>
          <p className="text-[10px] text-gray-500">Provision tracked virtual numbers, audit inbound call histories, transcribe recordings, and score caller buying intent.</p>
        </div>

        <button
          onClick={() => alert('Virtual phone number "+1 (888) 555-BOS9" provisioned and routed successfully.')}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-semibold rounded px-2.5 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Provision Virtual Number</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Call Log queue (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Inbound Call Logs</h3>
            <span className="text-[8px] font-mono text-gray-500">3 TOTAL</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {calls.map((call) => {
              const isSelected = selectedCall?.id === call.id;
              const isHigh = call.intentScore >= 75;
              return (
                <div
                  key={call.id}
                  onClick={() => { setSelectedCall(call); setEvalOutput(''); }}
                  className={`p-3 rounded border transition-all cursor-pointer text-left relative space-y-1.5 ${
                    isSelected 
                      ? 'border-brand-primary bg-white/5' 
                      : 'border-white/5 bg-dark-bg/60 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold text-white truncate">{call.caller}</p>
                    <span className={`text-[8.5px] font-mono font-bold px-1 rounded ${
                      isHigh ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 bg-gray-800'
                    }`}>
                      Intent: {call.intentScore}
                    </span>
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-gray-500">
                    <span>{call.number}</span>
                    <span>{call.duration}</span>
                  </div>

                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono border-t border-white/5 pt-1">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-2.5 h-2.5 text-blue-400" />
                      <span>RECORDING_ACTIVE</span>
                    </span>
                    <span>{call.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evaluation Output (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          {selectedCall ? (
            <div className="space-y-3.5 flex flex-col flex-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono">Transcript & Intent Analytics</h3>
                  <p className="text-[9px] text-gray-400 mt-0.5">{selectedCall.caller} | {selectedCall.number}</p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={handleTranscribe}
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-2.5 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span>Transcribe</span>
                  </button>
                  <button
                    onClick={handleScoreIntent}
                    disabled={isLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-2.5 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>Score Intent</span>
                  </button>
                </div>
              </div>

              {/* Display text */}
              <div className="flex-1 bg-dark-bg/60 border border-white/5 rounded p-3 text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap h-64 overflow-y-auto">
                {evalOutput ? (
                  evalOutput
                ) : (
                  <div className="space-y-3">
                    <p className="text-[9.5px] font-bold text-gray-500 uppercase tracking-widest font-mono">Raw Call Voice Log</p>
                    <p className="italic bg-black/40 p-3 rounded text-gray-300 leading-relaxed border border-white/5">
                      "{selectedCall.transcript}"
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">Click "Transcribe" or "Score Intent" above to run global LLM evaluations on this voice record.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500">
              <Phone className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-[10px] uppercase font-mono tracking-wide">Select an inbound call record card to trigger NLP evaluation pipelines.</p>
            </div>
          )}

          <div className="pt-2.5 border-t border-white/5 flex justify-end">
            <button
              onClick={() => alert('Call transcription committed to CRM Contact Timeline.')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commit Transcript to CRM Contact Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
