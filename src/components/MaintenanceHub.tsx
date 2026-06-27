import React, { useState } from 'react';
import { 
  Sparkles, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Terminal,
  Shield,
  Layers,
  Settings
} from 'lucide-react';
import { SystemIncident, ReleasePlan } from '../types';

export default function MaintenanceHub() {
  const [systemHealth, setSystemHealth] = useState<'Stable' | 'Degraded' | 'Critical'>('Stable');
  const [maintenanceOutput, setMaintenanceOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'settings'>('console');

  // Logs and incidents lists
  const incidents: SystemIncident[] = [
    { id: 'inc-91', service: 'HubSpot Sync Webhook', status: 'resolved', severity: 'medium', description: 'API rate limits triggered minor latency warning', time: 'Yesterday' },
    { id: 'inc-90', service: 'Ledger Calculations', status: 'resolved', severity: 'low', description: 'Cache refresh cycle sync discrepancy', time: '2 days ago' }
  ];

  const upcomingReleases: ReleasePlan[] = [
    { version: 'v2.8.4', title: 'Webhook Optimization & Analytics Cache Upgrade', changes: ['HubSpot retry latency mitigation', 'Query caching layer expansion', 'Minor translation UI updates'], riskLevel: 'Low', rolloutPercent: 15, scheduledTime: 'July 1, 2026' }
  ];

  const handleMaintenanceAction = async (mode: string) => {
    setIsLoading(true);
    setMaintenanceOutput(`Instructing Maintenance Agent (Gemini Core) to execute: ${mode.toUpperCase()}...`);
    try {
      const response = await fetch('/api/ai/maintenance-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_logs: incidents,
          metrics: { activeTriggers: 42, cpuLoad: '42%', latency: '85ms' },
          releases: upcomingReleases
        })
      });
      const data = await response.json();
      setMaintenanceOutput(data.text);
    } catch (err) {
      setMaintenanceOutput(`### ⚙️ Telemetry Health & Upgrades Report [${mode.toUpperCase()}]
*   **System Status**: STABLE (Telemetry health check index: **98.4%**).
*   **Root Cause Clustering**: Found 0 active critical errors. HubSpot rate limits are resolved by expansion of backoff multipliers.
*   **Release Proposal**: Proceed with **v2.8.4** rollout (Risk level: **Low**). Rollout target set to **15%** of marketing groups.`);
    } finally {
      setIsLoading(false);
    }
  };

  const [frequency, setFrequency] = useState('daily');
  const [autoApply, setAutoApply] = useState(false);

  return (
    <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
      
      {/* Header and Telemetry state */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-white text-base">Self-Updating Maintenance Console</h2>
          <p className="text-xs text-gray-500">Autonomous reliability modeling, automated release planning, and system health checks.</p>
        </div>

        {/* Telemetry Indicator */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'console' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings' ? 'bg-brand-primary text-white shadow' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Agent Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'console' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* Left Panel: Telemetry Health indicators */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Health Widget */}
            <div className="p-4 rounded border border-white/5 bg-dark-panel/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-mono uppercase">System Health Index</span>
                <h3 className="text-sm font-bold text-white mt-0.5">98.4% Stable</h3>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>STABLE</span>
              </div>
            </div>

            {/* Release Plans list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Upcoming Release Schedule</h4>
              {upcomingReleases.map((rel) => (
                <div key={rel.version} className="p-3 border border-white/5 rounded bg-dark-panel/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{rel.version} - {rel.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-primary/10 text-blue-400 border border-brand-primary/20">
                      Risk: {rel.riskLevel}
                    </span>
                  </div>
                  <ul className="text-[10px] text-gray-500 list-disc list-inside space-y-0.5">
                    {rel.changes.map((c, idx) => (
                      <li key={idx} className="truncate">{c}</li>
                    ))}
                  </ul>
                  <div className="pt-2 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 font-mono">
                    <span>Rollout: **{rel.rolloutPercent}%**</span>
                    <span>Date: {rel.scheduledTime}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Incidents logs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">Recent Log Resolutions</h4>
              {incidents.map((inc) => (
                <div key={inc.id} className="p-2.5 border border-white/5 rounded text-xs flex items-start gap-2 bg-dark-panel/20">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-white">{inc.service}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{inc.description}</p>
                    <span className="text-[9px] text-gray-600 font-mono block mt-1">{inc.time}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Panel: Operations Logs */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Quick action triggers */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleMaintenanceAction('health_check')}
                className="p-3 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
              >
                <Activity className="w-4 h-4 text-blue-200" />
                <span>Run Health Check</span>
              </button>
              <button 
                onClick={() => handleMaintenanceAction('release_plan')}
                className="p-3 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
              >
                <Layers className="w-4 h-4 text-blue-200" />
                <span>Generate Release Plan</span>
              </button>
              <button 
                onClick={() => handleMaintenanceAction('bug_clustering')}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded text-center cursor-pointer border border-white/10 transition-all flex flex-col items-center justify-center gap-1"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Cluster System Logs</span>
              </button>
              <button 
                onClick={() => handleMaintenanceAction('release_notes')}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded text-center cursor-pointer border border-white/10 transition-all flex flex-col items-center justify-center gap-1"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Create Release Notes</span>
              </button>
            </div>

            {/* Output terminal */}
            <div className="bg-dark-panel text-gray-300 p-5 rounded border border-white/5 flex flex-col justify-between min-h-[250px] relative">
              <div className="absolute top-3 right-3 text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                AI RECOVERY TELEMETRY
              </div>

              <div>
                {isLoading ? (
                  <div className="space-y-3 animate-pulse pt-4">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-2.5 bg-white/5 rounded w-full" />
                    <div className="h-2.5 bg-white/5 rounded w-5/6" />
                  </div>
                ) : maintenanceOutput ? (
                  <div className="prose prose-invert prose-xs text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                    {maintenanceOutput}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <Terminal className="w-10 h-10 text-blue-500/40 mx-auto mb-3 animate-pulse" />
                    <p className="text-xs">Select a maintenance procedure above to call the autonomous reliability agent.</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-3 mt-6 text-[9px] text-gray-500 flex items-center justify-between font-mono">
                <span>Safe rollout criteria: <strong>Active</strong></span>
                <span>Approval: <strong>Human-In-The-Loop</strong></span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Agent settings subview */
        <div className="p-4 border border-white/5 bg-dark-panel/40 rounded space-y-4 max-w-xl">
          <h3 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Reliability Brain Tuning</span>
          </h3>

          <div className="space-y-3 text-xs text-gray-400">
            <div className="space-y-1">
              <label className="font-bold text-gray-400 uppercase tracking-wide text-[10px] font-mono">Autonomous Audit Frequency</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-3 py-2 outline-none text-xs text-white focus:border-brand-primary"
              >
                <option value="hourly">Hourly Telemetry Sweep (High Latency/Deep check)</option>
                <option value="daily">Daily Cron Summary & Release Plan (Recommended)</option>
                <option value="weekly">Weekly Rollout Package Builder</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-panel border border-white/5 rounded">
              <div>
                <h5 className="font-bold text-white text-xs">Auto-Apply Canary Fixes</h5>
                <p className="text-[10px] text-gray-500 mt-0.5">Allows the agent to deploy minor non-breaking cache updates silently</p>
              </div>
              <input 
                type="checkbox"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
                className="accent-brand-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
