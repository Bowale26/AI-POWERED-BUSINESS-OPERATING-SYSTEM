export type AppTab =
  | 'welcome'
  | 'command'
  | 'operations'
  | 'leads'
  | 'task_agent'
  | 'stopwatch'
  | 'digest'
  | 'suite'
  | 'sandbox'
  | 'prospecting'
  | 'forms'
  | 'funnels'
  | 'ads'
  | 'chat_widget'
  | 'call_tracking'
  | 'workflows'
  | 'analytics'
  | 'knowledge'
  | 'integrations'
  | 'maintenance'
  | 'admin';

export interface KPI {
  id: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  interactions: number;
  lastActivity: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score?: number;
  explanation?: string;
  estimatedValue: number;
}

export interface CampaignContent {
  id: string;
  brand: string;
  audience: string;
  goal: string;
  channels: string[];
  generatedAt: string;
  content: {
    email?: string;
    social?: string;
    adCopy?: string;
  };
  feedbackScore?: number;
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  description: string;
  config?: any;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  status: 'active' | 'draft' | 'inactive';
  efficiencyGain?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'ai';
  text: string;
  timestamp: string;
  audioUrl?: string;
  imageUrl?: string;
  aspectRatio?: string;
}

export interface SystemIncident {
  id: string;
  service: string;
  status: 'resolved' | 'active' | 'investigating';
  severity: 'low' | 'medium' | 'high';
  description: string;
  time: string;
}

export interface ReleasePlan {
  version: string;
  title: string;
  changes: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  rolloutPercent: number;
  scheduledTime: string;
}
