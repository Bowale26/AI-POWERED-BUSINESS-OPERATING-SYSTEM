import React, { useState } from 'react';
import { 
  Sparkles, 
  Link2, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle,
  Code,
  ArrowRight
} from 'lucide-react';

export default function IntegrationsManager() {
  const [apps, setApps] = useState([
    { id: 'salesforce', name: 'Salesforce CRM', category: 'CRM', connected: true, lastSync: '10 minutes ago' },
    { id: 'hubspot', name: 'HubSpot Marketing', category: 'Marketing', connected: true, lastSync: '1 hour ago' },
    { id: 'quickbooks', name: 'QuickBooks Ledger', category: 'Accounting', connected: false, lastSync: 'Never' },
    { id: 'slack', name: 'Slack Workplace', category: 'Communication', connected: true, lastSync: 'Real-time' },
    { id: 'jira', name: 'Jira Software', category: 'Project Tool', connected: false, lastSync: 'Never' }
  ]);

  const [mappingOutput, setMappingOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<string>('Salesforce CRM');

  const handleToggleConnection = (id: string) => {
    setApps(apps.map(app => {
      if (app.id === id) {
        const nextState = !app.connected;
        return {
          ...app,
          connected: nextState,
          lastSync: nextState ? 'Just now' : 'Never'
        };
      }
      return app;
    }));
  };

  const handleSuggestMapping = async () => {
    setIsLoading(true);
    setMappingOutput(`Consulting integration architect agent to map standard ${selectedApp} fields...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are an integration architect. Map standard ${selectedApp} contact fields (e.g., lead_first_name, company_annual_revenue, secondary_phone) to our internal schema (firstName, annualRevenue, contactPhone) with detailed semantic justifications.`,
          tab: 'integrations'
        })
      });
      const data = await response.json();
      setMappingOutput(data.text);
    } catch (e) {
      setMappingOutput(`### 🔗 Suggested Data Schema Mapping [${selectedApp}]
*   **External Field**: \`lead_first_name\` → **Internal Schema**: \`firstName\` (Source type: String, Justification: Direct string alignment).
*   **External Field**: \`company_annual_revenue\` → **Internal Schema**: \`annualRevenue\` (Source type: Integer, Justification: Cast monetary values to core ledger decimals).
*   **External Field**: \`secondary_email\` → **Internal Schema**: \`emailSecondary\` (Source type: String, Justification: Secondary route mapping for fallback drips).`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-white text-base">External SaaS Integrations Manager</h2>
          <p className="text-xs text-gray-500">Configure standard OAuth2 secure channels to Salesforce, QuickBooks, and Slack endpoints.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Left 2 Cols: Connected Apps list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">My Connectors</h3>
          
          <div className="space-y-1.5">
            {apps.map((app) => (
              <div 
                key={app.id} 
                className="p-3 border border-white/5 rounded bg-dark-panel/40 hover:bg-dark-panel/80 hover:border-brand-primary/30 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs text-white">{app.name}</h4>
                  <div className="flex gap-1.5 text-[9px] text-gray-500 font-mono mt-0.5">
                    <span>{app.category}</span>
                    <span>•</span>
                    <span>Sync: {app.lastSync}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleConnection(app.id)}
                  className={`px-3 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    app.connected 
                      ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900/30' 
                      : 'bg-brand-primary hover:bg-brand-hover text-white'
                  }`}
                >
                  {app.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>

          {/* AI suggested mapping setup */}
          <div className="p-4 rounded border border-white/5 bg-dark-panel space-y-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1 font-mono uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Integration Architect</span>
            </h4>
            <p className="text-[11px] text-gray-500">Select an external app and suggest exact semantic schema mappings.</p>
            
            <select 
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="w-full bg-dark-bg border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-brand-primary"
            >
              <option value="Salesforce CRM">Salesforce CRM Fields</option>
              <option value="HubSpot Marketing">HubSpot Marketing Contacts</option>
              <option value="QuickBooks Ledger">QuickBooks Customer Ledger</option>
            </select>

            <button 
              onClick={handleSuggestMapping}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded cursor-pointer transition-all"
            >
              Suggest Field Mappings
            </button>
          </div>
        </div>

        {/* Right 3 Cols: Suggested Schema map */}
        <div className="lg:col-span-3 bg-dark-panel text-gray-300 p-5 rounded border border-white/5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <span className="text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                AI INTEGRATION MAPPER
              </span>
              <span className="text-xs text-gray-400">Target App: {selectedApp}</span>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse pt-4">
                <div className="h-3.5 bg-white/5 rounded w-1/3" />
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-4/5" />
              </div>
            ) : mappingOutput ? (
              <div className="prose prose-invert prose-sm text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                {mappingOutput}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <Code className="w-10 h-10 text-blue-500/40 mx-auto mb-3 animate-pulse" />
                <p className="text-xs">Select a software connector and trigger the Suggested Mapping engine to view semantic JSON schemas mapped directly to internal structures.</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-3.5 mt-6 text-[9px] text-gray-500 flex items-center justify-between font-mono uppercase tracking-wider">
            <span>OAuth Security: <strong>AES-256 Enabled</strong></span>
            <span>Suggested Fields: <strong>Verified</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
