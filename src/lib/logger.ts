export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  source: string;
  message: string;
}

const LOGS_KEY = 'ai_bos_system_logs';

export function getSystemLogs(): SystemLog[] {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing system logs:', e);
  }
  
  // Return default seed logs
  return [
    { 
      id: 'log-seed-1', 
      timestamp: new Date(Date.now() - 600000).toISOString(), 
      level: 'success', 
      source: 'System', 
      message: 'AI-BOS Kernel version 2.8.4 initialized.' 
    },
    { 
      id: 'log-seed-2', 
      timestamp: new Date(Date.now() - 300000).toISOString(), 
      level: 'info', 
      source: 'Firebase', 
      message: 'Synchronized cloud database collections.' 
    },
    { 
      id: 'log-seed-3', 
      timestamp: new Date().toISOString(), 
      level: 'info', 
      source: 'System', 
      message: 'Active monitoring session established.' 
    }
  ];
}

export function addSystemLog(level: 'info' | 'success' | 'warn' | 'error', source: string, message: string): SystemLog {
  const newLog: SystemLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    level,
    source,
    message
  };

  try {
    const logs = getSystemLogs();
    logs.unshift(newLog); // Add to the top
    if (logs.length > 50) {
      logs.pop(); // Cap at 50 logs to prevent storage bloating
    }
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving system log:', e);
  }

  // Dispatch global event for instant UI reaction
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ai_bos_log_added', { detail: newLog }));
  }

  return newLog;
}
