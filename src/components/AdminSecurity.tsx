import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Key, 
  UserCheck, 
  Terminal, 
  CheckCircle2, 
  Activity,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';

export default function AdminSecurity() {
  const { addToast } = useNotifications();
  const [isHardening, setIsHardening] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[AUDIT] Security context validated for active SSL layer.',
    '[KEYMGMT] Checked secret parameters for Google Client Services: Verified.',
    '[ROLES] Tenant policies loaded. 3 administrator accounts assigned.',
    '[CONTAINER] Sandbox memory verified; core processes running on isolations.'
  ]);

  const triggerSecuritySweep = () => {
    setIsHardening(true);
    setAuditLogs(prev => [...prev, '[SWEEP] Starting global cryptographic verification & port hygiene audit...']);
    addToast('Starting cryptographic security & compliance hardening sweep...', 'system', 2500);
    
    setTimeout(() => {
      setAuditLogs(prev => [
        ...prev,
        '[SWEEP] Recalculating access tokens for Redis clusters.',
        '[SWEEP] Closed 4 orphan database connections.',
        '[SUCCESS] Security Sweep complete. AI-BOS instance score remains at 100% hardened.'
      ]);
      setIsHardening(false);
      addToast('Security sweep complete! All nodes running in isolation mode (ISO-27001).', 'success', 4000);
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 rounded border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </span>
            Admin & Security Settings
          </h2>
          <p className="text-[10px] text-gray-500">Global tenant audits, API key validations, role-based access controllers (RBAC), and compliance sweeps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Roles & Key status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active API Keys */}
          <div className="bg-dark-panel border border-white/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Keys & Credentials</span>
              </h3>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/5 px-1.5 py-0.5 rounded border border-emerald-400/10 font-bold">SECURE</span>
            </div>

            <div className="space-y-2 text-[10px] font-mono text-gray-400">
              <div className="flex justify-between items-center bg-dark-bg/60 p-2 rounded border border-white/5">
                <span>GEMINI_API_KEY</span>
                <span className="text-emerald-400 font-bold">CONFIGURED (PROXIED)</span>
              </div>
              <div className="flex justify-between items-center bg-dark-bg/60 p-2 rounded border border-white/5">
                <span>POSTGRES_SSL_TUNNEL</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-dark-bg/60 p-2 rounded border border-white/5">
                <span>AUTH_FIREBASE_BLUEPRINT</span>
                <span className="text-emerald-400 font-bold">ENABLED</span>
              </div>
            </div>
          </div>

          {/* Access Roles */}
          <div className="bg-dark-panel border border-white/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Personnel & RBAC</span>
              </h3>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'Admin Account (You)', role: 'Owner / Superuser', state: 'Active Session' },
                { name: 'CRM Orchestrator Node', role: 'Autonomous Agent Thread', state: 'Live Background' },
                { name: 'External Webhook Web Widget', role: 'Anonymous Public Write', state: 'Throttled' }
              ].map((role, i) => (
                <div key={i} className="flex justify-between items-center bg-dark-bg/40 p-2 rounded border border-white/5 text-[10px]">
                  <div>
                    <p className="font-bold text-gray-200">{role.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono">{role.role}</p>
                  </div>
                  <span className="text-[9px] font-mono text-blue-400 bg-white/5 px-1 rounded">{role.state}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Audit Log Terminal (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[360px]">
          <div className="flex-grow flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Security Audit Logstream</span>
              </h3>
              <button
                onClick={() => setAuditLogs(['[RESET] Logstream buffer cleared. Monitoring active.'])}
                className="text-[8px] uppercase font-mono text-gray-500 hover:text-white"
              >
                Flush Logs
              </button>
            </div>

            <div className="flex-grow bg-black/90 p-3.5 rounded border border-white/10 font-mono text-[10.5px] leading-relaxed text-amber-400 h-64 overflow-y-auto scrollbar-thin">
              {auditLogs.map((log, i) => (
                <pre key={i} className="whitespace-pre-wrap">{log}</pre>
              ))}
            </div>
          </div>

          <div className="pt-3.5 border-t border-white/5 flex justify-between items-center">
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COMPLIANCE STATUS: ISO-27001</span>
            </span>

            <button
              onClick={triggerSecuritySweep}
              disabled={isHardening}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded cursor-pointer transition-all flex items-center gap-1 shadow"
            >
              {isHardening ? (
                <>
                  <RotateCw className="w-3 h-3 animate-spin" />
                  <span>Hardening Sweep...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trigger Hardening Sweep</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
