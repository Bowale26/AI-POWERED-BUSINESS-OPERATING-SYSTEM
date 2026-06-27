import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI SDK
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint returning status and secret availability
app.get('/api/health', (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ONLINE',
    region: 'GLOBAL',
    efficiency: '98.4%',
    geminiKeyConfigured: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Helper for unified fallback responses in case GenAI call is not possible
function getFallbackResponse(agentName: string, query: string, context?: any): string {
  const lower = query.toLowerCase();
  
  if (agentName === 'welcome_overview_agent') {
    return `### 📊 AI-BOS Personalised Morning Briefing
Good morning, Commander. Here is your enterprise status update:
*   **Performance Spike**: Lead acquisition efficiency rose by **12.4%** following yesterday's automated LinkedIn ad optimization.
*   **Workflow Bottleneck**: Cross-department contract review latency is slightly elevated (average **4.2 hours**).
*   **AI Action Proposes**: Approve the suggested reorder trigger for European supply hubs to prevent a stockout risk on high-demand premium electronics.`;
  }

  if (agentName === 'crm_intelligence_agent') {
    return `### 🎯 Lead Pipeline & Conversion Scorecard
Analyzed incoming leads and interactions. Here are the CRM insights:
*   **Sarah Jenkins (Alpha Corp)** - **Score: 92/100** (High Conversion likelihood). Key segment: *Enterprise Tech*. Recommendation: Initiate high-tier pricing proposal immediately.
*   **Marcus Chen (Velo Group)** - **Score: 78/100** (Warm). Key segment: *Growth Startup*. Recommendation: Share customized Case Study regarding workflow efficiency.
*   **Fintech Logistics Ltd** - **Score: 45/100** (Cold). Key segment: *Enterprise Log*. Recommendation: Keep in weekly email drip sequence.`;
  }

  if (agentName === 'maintenance_agent') {
    return `### ⚙️ Self-Updating System Release Plan
*   **Health Status**: STABLE (No active regressions found).
*   **Proposed Actions**: Create minor release version **v2.8.4** incorporating:
    1.  *Fix*: Resolving latency in external HubSpot CRM synchronization.
    2.  *Optimize*: Caching layer expansion for Descriptive Analytics dashboard queries.
    3.  *Rollout Plan*: Canary release to **15%** of marketing team instances.`;
  }

  if (lower.includes('/strategy') || lower.includes('strategy')) {
    return `### 🌐 Strategic Competitor Alignment Plan
1.  **Product Differentiation**: Establish AI-first native endpoints.
2.  **Target Market Focus**: Mid-market SaaS and Digital Services.
3.  **Core Objective**: Build high-value automated workflows to yield a **20%** reduction in manual operations.`;
  }

  if (lower.includes('/ops') || lower.includes('ops')) {
    return `### 🎛️ Operations Optimization Model
*   **Process Map**: Direct trigger to sync QuickBooks logs with Salesforce CRM pipeline on conversion.
*   **SOP recommendation**: Setup continuous human-in-the-loop review for contracts valued above **$50,000**.`;
  }

  if (lower.includes('/growth') || lower.includes('growth')) {
    return `### 📈 Marketing Campaign and Growth Formula
*   **Optimal Ad Channels**: LinkedIn (Business) and YouTube (Branded tutorials).
*   **Budget Split**: 60% lead gen, 40% awareness.
*   **Calculated ROI Goal**: **4.5x** return within 90 days.`;
  }

  return `### 🤖 AI Core System Response
I have processed your operational request with **Gemini Intelligence**:
*   **Query**: "${query}"
*   **Analysis**: Enterprise systems operating optimally. Automation workflows remain in active synch with external endpoints.
*   **Recommendation**: Monitor real-time analytics rail for high thinking latency or anomaly notifications.`;
}

// Global flag to track if pro model quota is exceeded (avoids slow 429 retries)
let isProModelQuotaExceeded = false;

// 1. Unified Command Chatbot / Command routing proxy
app.post('/api/ai/chat', async (req, res) => {
  const { message, tab, thinkingLevel = 'HIGH' } = req.body;
  const client = getAIClient();

  if (!client) {
    // Graceful fallback
    setTimeout(() => {
      const text = getFallbackResponse('core_system_agent', message);
      res.json({ text, source: 'simulation-engine' });
    }, 400);
    return;
  }

  try {
    let systemInstruction = `You are the Core System Agent for the AI-POWERED BUSINESS OPERATING SYSTEM (AI-BOS).
You orchestrate operations across marketing, CRM lead scoring, pipeline analysis, self-updating maintenance, and financial workflows.
You provide precise, professional responses utilizing golden-yellow bullet points and clear Markdown text.
The active interface context is tab: ${tab}.`;

    if (thinkingLevel === 'HIGH') {
      systemInstruction += `\n\nCRITICAL DIRECTIVE: High Thinking Mode is enabled. Before formulating your final corporate recommendation, you MUST perform an explicit step-by-step business strategy analysis, risk profiling, and structural formulation.
Enclose this entire diagnostic chain-of-thought reasoning process within a <thinking>...</thinking> block at the very start of your response. 
Follow this immediately with your clean, executive action list outside the tag block. Always include the thinking block when High Thinking Mode is requested!`;
    }

    let modelToUse = thinkingLevel === 'HIGH' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';
    if (modelToUse === 'gemini-3.1-pro-preview' && isProModelQuotaExceeded) {
      modelToUse = 'gemini-3.5-flash';
    }

    let response;
    try {
      response = await client.models.generateContent({
        model: modelToUse,
        contents: message,
        config: {
          systemInstruction,
          temperature: thinkingLevel === 'HIGH' ? 0.3 : 0.7,
        }
      });
    } catch (modelErr: any) {
      // Fallback to standard fast flash model if premium pro model hits rate limits or other issues
      console.warn("Pro model failed, falling back to flash:", modelErr);
      if (modelErr && (modelErr.status === 'RESOURCE_EXHAUSTED' || String(modelErr).includes('Quota exceeded') || String(modelErr).includes('429'))) {
        isProModelQuotaExceeded = true;
      }
      response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.5,
        }
      });
    }

    res.json({ text: response.text || 'No response content returned.', source: response.model || 'gemini' });
  } catch (err: any) {
    console.error('Error in chat proxy:', err);
    res.status(500).json({ error: err.message, fallback: getFallbackResponse('core_system_agent', message) });
  }
});

// Orchestrator Specifics from Configuration Payload
const ORCHESTRATOR_MODEL = 'gemini-3.1-pro-preview';
const ORCHESTRATOR_FALLBACK_MODEL = 'gemini-3.5-flash';
const ORCHESTRATOR_TEMPERATURE = 0.3;
const ORCHESTRATOR_SYSTEM_INSTRUCTION = `You orchestrate digital marketing CRM tasks: campaign generation, lead scoring, pipeline analysis, and performance insights.
Understand user intent, select the right tool, and respond with concise, actionable recommendations.`;

async function generateOrchestratorContent(client: any, prompt: string, instructionSuffix: string) {
  const systemInstruction = `${ORCHESTRATOR_SYSTEM_INSTRUCTION}\n\nContext block: ${instructionSuffix}`;
  const modelToUse = isProModelQuotaExceeded ? ORCHESTRATOR_FALLBACK_MODEL : ORCHESTRATOR_MODEL;
  
  try {
    const response = await client.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: ORCHESTRATOR_TEMPERATURE,
      }
    });
    return { text: response.text, model: modelToUse };
  } catch (err: any) {
    if (!isProModelQuotaExceeded) {
      console.warn(`Calling ${ORCHESTRATOR_MODEL} failed, using fallback...`, err);
      if (err && (err.status === 'RESOURCE_EXHAUSTED' || String(err).includes('Quota exceeded') || String(err).includes('429'))) {
        isProModelQuotaExceeded = true;
      }
    }
    const response = await client.models.generateContent({
      model: ORCHESTRATOR_FALLBACK_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: ORCHESTRATOR_TEMPERATURE,
      }
    });
    return { text: response.text, model: ORCHESTRATOR_FALLBACK_MODEL };
  }
}

// 2. Lead Scoring & CRM intelligence
app.post('/api/ai/crm-score', async (req, res) => {
  const { leads, history } = req.body;
  const client = getAIClient();

  if (!client) {
    return res.json({ text: getFallbackResponse('crm_intelligence_agent', 'CRM Scoring'), source: 'simulation-engine' });
  }

  try {
    const prompt = `Score the following leads and provide conversion predictions and action recommendations:
      Leads: ${JSON.stringify(leads)}
      History: ${JSON.stringify(history)}`;
    const result = await generateOrchestratorContent(
      client,
      prompt,
      'Active Tool: crm_lead_scoring_agent. Score leads (0-100), predict conversion likelihood, and recommend exact CRM pipeline actions.'
    );
    res.json({ text: result.text, source: result.model });
  } catch (err: any) {
    res.json({ text: getFallbackResponse('crm_intelligence_agent', 'CRM Scoring'), source: 'simulation-engine-fallback' });
  }
});

// 3. Campaign Content Generation
app.post('/api/ai/content-generate', async (req, res) => {
  const { brand_profile, audience_segments, goal, channels, constraints } = req.body;
  const client = getAIClient();

  if (!client) {
    const mockContent = `### 🚀 Generated Multi-Channel Campaign: ${brand_profile?.name || 'My Brand'}
**Goal**: ${goal || 'Lead Generation'}
**Target Audience**: ${audience_segments?.join(', ') || 'General Business professionals'}

---
#### 📨 Email Campaign:
**Subject**: Supercharge Your Operations with AI-Powered Workflows
Dear ${audience_segments?.[0] || 'Partner'},
Are repetitive administrative tasks bottlenecking your growth? Discover how our new orchestration platform can automate up to 64% of your daily processes.
**Call to Action**: [Schedule Your AI Audit]

---
#### 📱 Social Post:
Stop fighting manual data silos! 🛑 AI-BOS connects Salesforce, QuickBooks, and Slack to keep your team aligned and operational efficiency at optimal. Ready to upgrade? Click link below! 👇 #Automation #SaaS`;
    return res.json({ text: mockContent, source: 'simulation-engine' });
  }

  try {
    const prompt = `Brand: ${JSON.stringify(brand_profile)}; Audience: ${JSON.stringify(audience_segments)}; Goal: ${goal}; Channels: ${JSON.stringify(channels)}; Constraints: ${JSON.stringify(constraints)}`;
    const result = await generateOrchestratorContent(
      client,
      prompt,
      'Active Tool: campaign_content_agent. Generates and optimizes digital marketing campaign content. Produce high-converting copy, distinct email subjects, and professional post structure.'
    );
    res.json({ text: result.text, source: result.model });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Analytics Interpretation
app.post('/api/ai/analytics-explain', async (req, res) => {
  const { metrics, timeframe, question } = req.body;
  const client = getAIClient();

  if (!client) {
    const explanation = `### 📈 Performance Interpretations
Based on your query: "${question || 'Explain performance changes'}"
*   **Conversion Optimization**: Churn is stable at **2.4%** which is highly optimal for Q3.
*   **Growth Outlook**: Forecasted revenue for the next billing cycle shows a positive **8.6%** upward slope.
*   **Key Insight**: Your Google Ads CPC decreased by **14.2%** after shifting targeting towards premium IT specialists.`;
    return res.json({ text: explanation, source: 'simulation-engine' });
  }

  try {
    const prompt = `Question: ${question}; Metrics: ${JSON.stringify(metrics)}; Timeframe: ${timeframe}`;
    const result = await generateOrchestratorContent(
      client,
      prompt,
      'Active Tool: marketing_analytics_agent. Explains performance changes, dissects campaign ROI anomalies, and recommends campaign budget adjustments or creative overrides.'
    );
    res.json({ text: result.text, source: result.model });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Safe System Release & Telemetry Agent
app.post('/api/ai/maintenance-plan', async (req, res) => {
  const { error_logs, metrics, releases } = req.body;
  const client = getAIClient();

  if (!client) {
    return res.json({ text: getFallbackResponse('maintenance_agent', 'Release Plan'), source: 'simulation-engine' });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Error logs: ${JSON.stringify(error_logs)}; Performance metrics: ${JSON.stringify(metrics)}; Release history: ${JSON.stringify(releases)}`,
      config: {
        systemInstruction: 'You are a release manager and technical writer for a business operating system. Propose a safe release plan and draft clear, user-friendly release notes.'
      }
    });
    res.json({ text: response.text, source: 'gemini-3.5-flash' });
  } catch (err: any) {
    res.json({ text: getFallbackResponse('maintenance_agent', 'Release Plan'), source: 'simulation-engine' });
  }
});

// 6. Audio Text-To-Speech (Simulated or Real using gemini-3.1-flash-tts-preview if key is available)
app.post('/api/ai/speech', async (req, res) => {
  const { text, voice = 'Zephyr' } = req.body;
  const client = getAIClient();

  if (!client) {
    // Mock successful speech synthesis returning a friendly simulated message
    return res.json({
      success: true,
      simulated: true,
      voice,
      text,
      message: `Audio generated successfully in simulated voice: ${voice}`,
    });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, base64Audio, voice });
    } else {
      res.json({ success: true, simulated: true, voice, text, message: 'Returned textual speech confirmation' });
    }
  } catch (err: any) {
    res.json({ success: true, simulated: true, voice, text, error: err.message });
  }
});

// 7. Image Generation (using gemini-2.5-flash-image)
app.post('/api/ai/image-generate', async (req, res) => {
  const { prompt, aspectRatio = '1:1' } = req.body;
  const client = getAIClient();

  if (!client) {
    return res.json({
      success: true,
      simulated: true,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      prompt,
    });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `${prompt}. Golden-yellow and deep purple premium technical abstract vector wallpaper representation.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64 = part.inlineData.data;
        return res.json({
          success: true,
          imageUrl: `data:image/png;base64,${base64}`,
          prompt,
        });
      }
    }

    res.json({
      success: true,
      simulated: true,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    });
  } catch (err: any) {
    res.json({
      success: true,
      simulated: true,
      imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
      error: err.message,
    });
  }
});

// Bootstrap development or production mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI-POWERED BUSINESS OPERATING SYSTEM server running at http://localhost:${PORT}`);
  });
}

startServer();
