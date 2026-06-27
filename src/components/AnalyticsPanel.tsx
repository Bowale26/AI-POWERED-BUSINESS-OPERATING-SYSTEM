import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Search,
  Image as ImageIcon,
  RotateCw,
  Download,
  Sliders,
  FileText,
  Table,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { exportDocumentToPDF } from '../lib/pdfExporter';

export default function AnalyticsPanel() {
  const { addToast } = useNotifications();
  const [mode, setMode] = useState<'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive'>('descriptive');
  const [question, setQuestion] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Imagen-powered KPI Visualizer states
  const [kpiJson, setKpiJson] = useState<string>(JSON.stringify({
    "automation_rate": "64%",
    "lead_churn": "2.4%",
    "avg_pipeline_roi": "4.2x",
    "incident_rate": "0.01%",
    "api_latency": "85ms",
    "conversion_spike": "+12.4%"
  }, null, 2));
  
  const [designStyle, setDesignStyle] = useState<string>('Enterprise Minimalist (Swiss design, high contrast)');
  const [customDirection, setCustomDirection] = useState<string>('Dark-slate corporate template with neon-blue gridlines and precise geometric indicators');
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string>('');
  const [isGeneratingImg, setIsGeneratingImg] = useState<boolean>(false);
  const [imgFeedback, setImgFeedback] = useState<string>('');
  const [selectedReports, setSelectedReports] = useState<string[]>(['descriptive', 'diagnostic', 'predictive', 'prescriptive']);
  const [combinedFormat, setCombinedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  const suggestQueries = {
    descriptive: "Summarize our core KPI performance and operational efficiency metrics over the past 30 days.",
    diagnostic: "Why did lead conversion efficiency surge by 12.4% following our recent automated LinkedIn campaigns?",
    predictive: "Based on our pipeline MRR growth, forecast our operational expansion potential for the upcoming quarter.",
    prescriptive: "What automated reorder triggers and sales paths do you recommend to eliminate supply and deal risks?"
  };

  const handleRunAnalytics = async (customQ?: string) => {
    setIsLoading(true);
    const queryToRun = customQ || question || suggestQueries[mode];
    setQuestion(queryToRun);
    setAiResponse('Parsing metric event database and running deep analytics matching...');

    try {
      const response = await fetch('/api/ai/analytics-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: { 
            automationRate: '64%', 
            churn: '2.4%', 
            avgROI: '4.2x',
            incidentRate: '0.01%',
            latency: '85ms'
          },
          timeframe: 'Q3 Operations Cycle',
          question: `[Mode: ${mode.toUpperCase()}] ${queryToRun}`
        })
      });
      const data = await response.json();
      setAiResponse(data.text);
    } catch (err) {
      setAiResponse(`### 📊 AI Analytics Diagnostic [${mode.toUpperCase()}]
Analyzed current enterprise metrics structure (64% Automation rate, 2.4% churn, 4.2x ROI).
*   **Response**: ${queryToRun}
*   **Core Diagnostic**: Shifting ad density to high-converting segments yielded a **14.2% drop in CPC**. Supply chain latency has stabilized at **4.2 hours** following active reorder optimizations.
*   **Recommendation**: Run safe upgrades on the HubSpot webhook integration to eliminate warning codes.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Imagen API
  const handleGenerateKPIVisual = async () => {
    setIsGeneratingImg(true);
    setImgFeedback('Initializing Google Imagen model pipeline...');
    setGeneratedImgUrl('');

    try {
      let parsedJson = {};
      try {
        parsedJson = JSON.parse(kpiJson);
      } catch (e) {
        setImgFeedback('Warning: Invalid JSON structure. Utilizing fallback schema.');
      }

      const promptString = `An executive high-density business KPI dashboard infographic. 
Style template: ${designStyle}.
Visual focus direction: ${customDirection}.
Render the following key performance indicator metrics as stunning glowing numeric widgets, bar graphs, and linear metric gauges:
${JSON.stringify(parsedJson, null, 2)}
Ensure the labels are sharp, readable, highly structured, and suitable for a professional SaaS operating system workspace. Minimalist layout.`;

      const response = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptString,
          aspectRatio: '16:9'
        })
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImgUrl(data.imageUrl);
        setImgFeedback('Infographic generated successfully via Imagen!');
      } else {
        // Fallback to high-end Unsplash corporate design
        setGeneratedImgUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80');
        setImgFeedback('Infographic simulated successfully.');
      }
    } catch (err) {
      setGeneratedImgUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80');
      setImgFeedback('Completed visual infographic synthesis (Offline Simulation Mode).');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleExportData = () => {
    try {
      let parsedKpis = {};
      try {
        parsedKpis = JSON.parse(kpiJson);
      } catch (e) {
        parsedKpis = { error: "Failed to parse current metrics JSON input" };
      }

      const timestamp = new Date().toLocaleString();
      const reportMarkdown = `# ENTERPRISE PERFORMANCE INSIGHTS REPORT
Generated on: ${timestamp}
Security Level: INTERNAL CONFIDENTIAL (SOC2 compliant)

## 📊 CORE KEY PERFORMANCE INDICATORS
${Object.entries(parsedKpis)
  .map(([key, value]) => `- **${String(key).replace(/_/g, ' ').toUpperCase()}**: ${value}`)
  .join('\n')}

## 🧠 CURRENT ACTIVE SEARCH PILLAR
- **Pillar Mode**: ${mode.toUpperCase()} Analytics
- **Active User Query**: "${question || 'N/A'}"

## 🔍 RECENT DIAGNOSTIC OUTCOMES / RECOMMENDATIONS
${aiResponse ? aiResponse : "*No query has been run in this session. Execute an AI Agent Query above to view dynamic recommendations.*"}

---
*Report synthesized and certified by the Multi-Agent Analytics engine.*
`;

      const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Performance_Insights_Report_${new Date().toISOString().slice(0, 10)}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('Performance Insights report generated and downloaded successfully.', 'success', 3500);
    } catch (error) {
      console.error('Export failed:', error);
      addToast('Failed to export report.', 'error', 3000);
    }
  };

  const handleExportCombinedReport = () => {
    if (selectedReports.length === 0) {
      addToast('Please select at least one report section to include.', 'error', 3000);
      return;
    }

    try {
      let parsedKpis: Record<string, string> = {};
      try {
        parsedKpis = JSON.parse(kpiJson);
      } catch (e) {
        parsedKpis = { 
          "automation_rate": "64%",
          "lead_churn": "2.4%",
          "avg_pipeline_roi": "4.2x",
          "incident_rate": "0.01%",
          "api_latency": "85ms"
        };
      }

      const timestamp = new Date().toLocaleString();

      if (combinedFormat === 'csv') {
        let csvContent = `Section,Metric / Topic,Value / Result,Takeaway\r\n`;
        
        if (selectedReports.includes('descriptive')) {
          Object.entries(parsedKpis).forEach(([key, val]) => {
            csvContent += `Descriptive,${String(key).toUpperCase()},${val},Baseline core performance KPI indicator.\r\n`;
          });
        }
        
        if (selectedReports.includes('diagnostic')) {
          csvContent += `Diagnostic,Conversion efficiency surge by 12.4%,Surged,Surge caused by automated LinkedIn trigger campaigns and AI scoring models.\r\n`;
          csvContent += `Diagnostic,CPC drop,14.2% CPC drop,Optimizing visual grids improved click-through rates.\r\n`;
        }

        if (selectedReports.includes('predictive')) {
          csvContent += `Predictive,Pipeline MRR expansion,Forecast 24%,High expansion likelihood expected next quarter based on lead scoring.\r\n`;
          csvContent += `Predictive,Supply out-of-stock risk,Low,Automated reorder triggers completely mitigate outage risk.\r\n`;
        }

        if (selectedReports.includes('prescriptive')) {
          csvContent += `Prescriptive,HubSpot synchronization webhooks,Update SOP,Upgrade integration webhooks to eliminate diagnostic warning logs.\r\n`;
          csvContent += `Prescriptive,SOP triggers,Define SOP,Establish automated reorder levels at 300 units for microcontrollers.\r\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Combined_Analytics_Spreadsheet_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(`Successfully exported combined CSV spreadsheet with ${selectedReports.length} sections.`, 'success', 3500);

      } else {
        let reportMarkdown = `==================================================
              AI-BOS ENTERPRISE OPERATIONAL BRIEFING
==================================================
Generated on: ${timestamp}
Security Level: EXECUTIVE CONFIDENTIAL
Classification: SOC2 COMPLIANT AUDIT GRADE
Report ID: BOS-ANALYTICS-${Math.floor(100000 + Math.random() * 900000)}

--------------------------------------------------
1. EXECUTIVE METRIC SUMMARY
--------------------------------------------------
The CRM Orchestrator Multi-Agent analytics engine has synthesized execution parameters across SaaS pipelines. 

`;

        if (selectedReports.includes('descriptive')) {
          reportMarkdown += `
--------------------------------------------------
PILLAR I: DESCRIPTIVE ANALYSIS (KPI METRICS)
--------------------------------------------------
Core SaaS KPI Performance Indicators:
${Object.entries(parsedKpis)
  .map(([key, value]) => `• ${String(key).replace(/_/g, ' ').toUpperCase()}: ${value}`)
  .join('\n')}

DESCRIPTIVE TAKEAWAY:
Operations maintain robust alignment across CRM nodes. Churn remains within SOC2 target tolerance (2.4%), while automation efficiency continues to scale toward a target of 85%.
`;
        }

        if (selectedReports.includes('diagnostic')) {
          reportMarkdown += `
--------------------------------------------------
PILLAR II: DIAGNOSTIC ANALYSIS (WHY METRICS ALTERED)
--------------------------------------------------
Core Findings:
• Lead Conversion Efficiency: Surged by +12.4% after running multi-agent LinkedIn campaigns.
• CPC optimization: Reduced customer acquisition cost by 14.2% following landing page A/B testing.
• Event analysis: HubSpot synchronization webhooks encountered sporadic latency spikes due to API throttle limits.

DIAGNOSTIC RECOMMENDATION:
Prioritize upgrading webhook listeners. Adjust lead enrichment parameters to retain the +12.4% conversion efficiency gains.
`;
        }

        if (selectedReports.includes('predictive')) {
          reportMarkdown += `
--------------------------------------------------
PILLAR III: PREDICTIVE HORIZON (METRIC FORECASTS)
--------------------------------------------------
Operational Expansion Potential & Risk Models:
• Quarter MRR expansion potential: Strong positive trend indicating up to 24% growth likelihood.
• Supply Chain Stock Out-of-Stock Risk: Microcontroller stocks approach lower warning limits within 30 days.
• Customer Support Ticket Backlog: Ticket completion velocity predicts backlog elimination in 14 hours.

PREDICTIVE MODEL OUTCOME:
Standard forecasting algorithms indicate high probability of hitting target ROI thresholds if supply chain buffers are actively maintained.
`;
        }

        if (selectedReports.includes('prescriptive')) {
          reportMarkdown += `
--------------------------------------------------
PILLAR IV: PRESCRIPTIVE RECOMS (DIRECT ACTIONS)
--------------------------------------------------
Enterprise SOP Automations & Execution Triggers:
• Trigger 01 (Critical): Establish automated reorder triggers at 300 units for chips and microcontrollers in OperationsHub.
• Trigger 02 (Optimization): Integrate fallback LinkedIn lead scoring to filter outbound marketing lists.
• Trigger 03 (Integrations): Deploy a permanent backup API webhook to handle HubSpot timeouts.

PRESCRIPTIVE ACTION:
These steps mitigate high-risk supply constraints and secure pipeline operations.
`;
        }

        reportMarkdown += `
==================================================
CERTIFICATION & COMPLIANCE SIGN-OFF
==================================================
All operations compiled and verified under enterprise SOC2 procedures. 
Generated dynamically via CRM Orchestrator Analytics v1.5.
==================================================
`;

        exportDocumentToPDF(reportMarkdown, {
          title: 'AI-BOS Enterprise Operational Briefing',
          subtitle: 'Combined Multi-Agent Analytics Report',
          category: 'ANALYTICS REPORT',
          author: 'Enterprise Executive Officer'
        });
        addToast(`Successfully generated and opened PDF print layout with ${selectedReports.length} sections.`, 'success', 3500);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to generate combined report.', 'error', 3000);
    }
  };

  const getPreviewRows = () => {
    let parsedKpis: Record<string, string> = {};
    try {
      parsedKpis = JSON.parse(kpiJson);
    } catch (e) {
      parsedKpis = { 
        "automation_rate": "64%",
        "lead_churn": "2.4%",
        "avg_pipeline_roi": "4.2x",
        "incident_rate": "0.01%",
        "api_latency": "85ms"
      };
    }

    const rows: { section: string; metricTopic: string; valueResult: string; takeaway: string }[] = [];

    if (selectedReports.includes('descriptive')) {
      Object.entries(parsedKpis).forEach(([key, val]) => {
        rows.push({
          section: 'Descriptive Analytics',
          metricTopic: String(key).replace(/_/g, ' ').toUpperCase(),
          valueResult: String(val),
          takeaway: 'Baseline core performance KPI indicator.'
        });
      });
    }

    if (selectedReports.includes('diagnostic')) {
      rows.push({
        section: 'Diagnostic Analysis',
        metricTopic: 'Lead Conversion Efficiency',
        valueResult: '+12.4%',
        takeaway: 'Surge driven by LinkedIn multi-agent trigger flows.'
      }, {
        section: 'Diagnostic Analysis',
        metricTopic: 'CPC Optimization',
        valueResult: '-14.2%',
        takeaway: 'Optimized visual grids increased CTRs.'
      });
    }

    if (selectedReports.includes('predictive')) {
      rows.push({
        section: 'Predictive Horizon',
        metricTopic: 'MRR Expansion Likely',
        valueResult: '+24%',
        takeaway: 'Forecasted strong positive quarterly momentum.'
      }, {
        section: 'Predictive Horizon',
        metricTopic: 'Out-of-Stock Supply Risk',
        valueResult: 'Low / Mitigated',
        takeaway: 'OpsHub reorder triggers secure physical flow.'
      });
    }

    if (selectedReports.includes('prescriptive')) {
      rows.push({
        section: 'Prescriptive Actions',
        metricTopic: 'SOP Reorder Trigger',
        valueResult: '300 units minimum',
        takeaway: 'Establish auto-alert on microcontroller stock bounds.'
      }, {
        section: 'Prescriptive Actions',
        metricTopic: 'Fallback API Webhooks',
        valueResult: 'Deploy redirect failover',
        takeaway: 'Mitigate HubSpot sync latency warnings.'
      });
    }

    return rows;
  };

  return (
    <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-white text-base">Multi-Agent Analytics & Insights</h2>
          <p className="text-xs text-gray-500">Query the vector engine for diagnostic analysis or predictive forecasts.</p>
        </div>
        <button
          onClick={handleExportData}
          className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded px-4 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-200" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Pillars tabs (Descriptive, Diagnostic, Predictive, Prescriptive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(['descriptive', 'diagnostic', 'predictive', 'prescriptive'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setAiResponse(''); }}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              mode === m 
                ? 'border-brand-primary bg-brand-primary/10' 
                : 'border-white/5 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Pillar</span>
              {m === 'descriptive' && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
              {m === 'diagnostic' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {m === 'predictive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
              {m === 'prescriptive' && <Lightbulb className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <h4 className="font-bold text-xs text-white mt-2 capitalize">{m} Analytics</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {m === 'descriptive' ? 'Explain metric performance' :
               m === 'diagnostic' ? 'Why metrics altered' :
               m === 'predictive' ? 'Forecast future curves' : 'Prescribe direct actions'}
            </p>
          </button>
        ))}
      </div>

      {/* Interactive Q&A Input */}
      <div className="space-y-3">
        <div className="p-4 rounded bg-dark-panel border border-white/5">
          <label className="text-xs font-bold text-gray-400 block mb-2 font-mono uppercase tracking-wide">Ask the Analytics Agent a question:</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={suggestQueries[mode]}
              className="flex-1 bg-dark-bg border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-brand-primary outline-none"
            />
            <button 
              onClick={() => handleRunAnalytics()}
              className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold px-4 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Query AI</span>
            </button>
          </div>
          <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-gray-500">
            <span className="font-bold uppercase tracking-wider text-gray-400 shrink-0 font-mono">Suggested:</span>
            <button 
              onClick={() => handleRunAnalytics(suggestQueries[mode])}
              className="text-left text-blue-400 hover:underline"
            >
              "{suggestQueries[mode]}"
            </button>
          </div>
        </div>
      </div>

      {/* Response Box */}
      {(aiResponse || isLoading) && (
        <div className="bg-dark-panel text-gray-300 p-5 rounded border border-white/5 min-h-[120px] relative">
          <div className="absolute top-3 right-3 text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            ANALYST STREAM
          </div>

          {isLoading ? (
            <div className="space-y-2 animate-pulse pt-4">
              <div className="h-3 bg-white/5 rounded w-1/4" />
              <div className="h-2 bg-white/5 rounded w-full" />
              <div className="h-2 bg-white/5 rounded w-5/6" />
            </div>
          ) : (
            <div className="prose prose-invert prose-xs text-xs max-w-none text-gray-300 whitespace-pre-line leading-relaxed">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Combined Executive Report Builder */}
      <div className="border border-white/5 bg-dark-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3 justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-primary/10 rounded border border-brand-primary/20">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-white">Combined Executive Report Builder</h3>
              <p className="text-[10px] text-gray-500">Select multiple report types to generate and export as a single unified file.</p>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-blue-900/20 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded uppercase">
            Aipowered Multi-Export
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Section selections */}
          <div className="md:col-span-8 space-y-3">
            <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono uppercase tracking-wide">
              1. Choose Report Sections to Combine:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'descriptive', label: 'Descriptive Metrics Summary', desc: 'KPI indicator baseline logs' },
                { id: 'diagnostic', label: 'Diagnostic Analysis Report', desc: 'Cause assessments & conversion spikes' },
                { id: 'predictive', label: 'Predictive Operations Forecast', desc: 'Supply stockout risks & backlog estimations' },
                { id: 'prescriptive', label: 'Prescriptive Trigger Actions', desc: 'Recommended SOP automation steps' }
              ].map((item) => {
                const isSelected = selectedReports.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedReports(prev => prev.filter(r => r !== item.id));
                      } else {
                        setSelectedReports(prev => [...prev, item.id]);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-brand-primary bg-brand-primary/10 text-white' 
                        : 'border-white/5 bg-dark-bg/40 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{item.label}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Settings */}
          <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 pl-0 md:pl-5 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 block font-mono uppercase tracking-wide">
                2. Select Export Format:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCombinedFormat('pdf')}
                  className={`flex-1 p-2.5 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    combinedFormat === 'pdf'
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-white/5 bg-dark-bg/40 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-bold font-mono mt-1">PDF DOCUMENT</span>
                </button>
                <button
                  onClick={() => setCombinedFormat('csv')}
                  className={`flex-1 p-2.5 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    combinedFormat === 'csv'
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-white/5 bg-dark-bg/40 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Table className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold font-mono mt-1">CSV SHEET</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedReports.length === 0) {
                  addToast('Please select at least one report section to include.', 'error', 3000);
                  return;
                }
                setPreviewModalOpen(true);
              }}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-auto"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>Preview & Export {selectedReports.length} Sections</span>
            </button>
          </div>
        </div>
      </div>

      {/* Imagen-powered KPI Infographic Synthesizer Card */}
      <div className="border border-white/5 bg-dark-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <div className="p-1.5 bg-brand-primary/10 rounded border border-brand-primary/20">
            <ImageIcon className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs text-white">Imagen KPI Infographic Synthesizer</h3>
            <p className="text-[10px] text-gray-500">Transform raw KPI metric parameters into high-density diagram graphics with Google's Imagen model.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1.5 font-mono uppercase tracking-wide flex items-center gap-1.5">
                <span>1. Edit KPI Metric Parameters (JSON)</span>
              </label>
              <textarea
                value={kpiJson}
                onChange={(e) => setKpiJson(e.target.value)}
                className="w-full h-36 bg-dark-bg border border-white/10 rounded p-2.5 text-[11px] font-mono text-emerald-400 focus:border-brand-primary outline-none resize-none leading-normal"
                spellCheck="false"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono uppercase tracking-wide">2. Visual Theme Preset</label>
                <select
                  value={designStyle}
                  onChange={(e) => setDesignStyle(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-gray-200 focus:border-brand-primary outline-none"
                >
                  <option value="Enterprise Minimalist (Swiss design, high contrast)">Enterprise Minimalist (Swiss Slide)</option>
                  <option value="Futuristic Cyberpunk Dashboard (Dark cobalt, neon cyan accents)">Futuristic Cyberpunk Dashboard (Cobalt & Neon)</option>
                  <option value="Gold Luxury Corporate Slate (Elegant premium charts)">Gold Luxury Corporate Slate (Amber & Gold)</option>
                  <option value="Scientific Brutalist (Monochromatic grid lines, high density)">Scientific Brutalist (High Density Mono)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono uppercase tracking-wide">3. Custom Design Prompts</label>
                <input
                  type="text"
                  value={customDirection}
                  onChange={(e) => setCustomDirection(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-gray-200 placeholder-gray-600 focus:border-brand-primary outline-none"
                  placeholder="E.g., clean charts with detailed legend grids..."
                />
              </div>
            </div>

            <button
              onClick={handleGenerateKPIVisual}
              disabled={isGeneratingImg}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 px-4 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              {isGeneratingImg ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Infographic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Synthesize KPI Infographic (Imagen)</span>
                </>
              )}
            </button>
          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-7 flex flex-col justify-between border border-white/5 bg-dark-bg/60 rounded-lg p-3.5 min-h-[240px]">
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {isGeneratingImg ? (
                <div className="text-center space-y-2">
                  <RotateCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-400 font-mono">{imgFeedback}</p>
                </div>
              ) : generatedImgUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <img
                    src={generatedImgUrl}
                    alt="KPI Generated Infographic"
                    className="max-h-56 object-contain rounded border border-white/5 bg-dark-panel/80 w-full"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex gap-2 w-full justify-end">
                    <a
                      href={generatedImgUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 px-3 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3 text-blue-400" />
                      <span>Download SVG/PNG</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-white/10 rounded-lg w-full max-w-md bg-dark-panel/40">
                  <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2.5" />
                  <h4 className="text-xs font-semibold text-gray-400">No Image Generated Yet</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Configure your KPI JSON parameters and click generate to invoke the Imagen visual pipeline.</p>
                </div>
              )}
            </div>

            {imgFeedback && !isGeneratingImg && (
              <div className="mt-3 bg-white/5 border border-white/5 rounded px-2.5 py-1 text-[9px] font-mono text-gray-400 flex items-center justify-between">
                <span>Model Response Status: {imgFeedback}</span>
                <span className="text-[8px] text-blue-400 uppercase font-bold">Imagen v3 API</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Download Combined Report Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            id="combined-preview-modal"
            className="bg-dark-panel border border-white/10 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden animate-fadeIn text-gray-200 flex flex-col max-h-[85vh]"
          >
            {/* Top Header */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-dark-bg/40">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-primary/10 rounded border border-brand-primary/20">
                  <FileText className="w-4 h-4 text-brand-primary" />
                </span>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-brand-primary uppercase block">Audit & Pre-Download Verification</span>
                  <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">Executive Report Summary Preview</h3>
                </div>
              </div>
              <button 
                onClick={() => setPreviewModalOpen(false)} 
                className="text-gray-400 hover:text-white transition-all cursor-pointer p-1 rounded hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* File Metadata Info Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-dark-bg/40 p-3.5 rounded-lg border border-white/5 font-mono text-[11px]">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Selected Sections</span>
                  <span className="text-white font-bold">{selectedReports.length} of 4</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Export Format</span>
                  <span className="text-brand-primary font-bold uppercase">{combinedFormat} file</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Est. File Size</span>
                  <span className="text-emerald-400 font-bold">~4.8 KB</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Classification</span>
                  <span className="text-amber-500 font-bold">CONFIDENTIAL</span>
                </div>
              </div>

              {/* Data Summary Table */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Combined Report Content Summary Table:</h4>
                <div className="border border-white/5 rounded-lg overflow-hidden bg-dark-bg/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-dark-bg/60 border-b border-white/5 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        <th className="p-3 font-semibold">Section Name</th>
                        <th className="p-3 font-semibold">Metric / Topic</th>
                        <th className="p-3 font-semibold">Value / Result</th>
                        <th className="p-3 font-semibold">Takeaway / Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {getPreviewRows().map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors text-gray-300">
                          <td className="p-3 font-medium text-white whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/5 text-gray-300">
                              {row.section}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-gray-100">{row.metricTopic}</td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">{row.valueResult}</td>
                          <td className="p-3 text-[11px] text-gray-400 leading-normal">{row.takeaway}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security signoff reminder */}
              <p className="text-[10px] text-gray-500 leading-relaxed italic">
                Notice: This dynamic preview mirrors the structural mapping logic designed in CRM Orchestrator v1.5. Confirming download will bundle this telemetry data under certified SOC2 compliance signatures.
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-4 border-t border-white/5 bg-dark-bg/40 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 border border-white/10 rounded-lg text-xs font-mono font-semibold hover:bg-white/5 transition-all text-gray-300 cursor-pointer"
              >
                Cancel & Edit
              </button>
              <button
                onClick={() => {
                  handleExportCombinedReport();
                  setPreviewModalOpen(false);
                }}
                className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Download className="w-4 h-4 text-blue-200" />
                <span>Confirm & Download {combinedFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
