import React, { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Send, 
  Settings, 
  CheckCircle2, 
  Check 
} from 'lucide-react';

export default function ChatWidgetAI() {
  const [widgetTitle, setWidgetTitle] = useState('AI-BOS Smart Assistant');
  const [welcomeMsg, setWelcomeMsg] = useState('Hi there! 👋 How can we help automate your B2B CRM pipelines today?');
  const [accentColor, setAccentColor] = useState('purple');
  const [copied, setCopied] = useState(false);

  // Widget preview chat state
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([
    { sender: 'bot', text: welcomeMsg }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputVal('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, tab: 'chat_widget' })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Simulated widget auto-response: Got it! We are routing your inquiry to a specialized agent loop.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const codeSnippet = `<script 
  src="https://cdn.ai-bos.io/widget/v1/loader.js" 
  data-widget-id="bos-widget-${accentColor}" 
  data-title="${widgetTitle}"
  data-welcome="${welcomeMsg}"
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-brand-primary/10 rounded border border-brand-primary/20 text-brand-primary">
              <MessageSquare className="w-4 h-4" />
            </span>
            Chat Widget / Conversation AI
          </h2>
          <p className="text-[10px] text-gray-500">Configure public-facing intelligent web chat widgets, copy code injections, and test bot conversational behavior.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Settings Panel (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Widget Customization</h3>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Widget Public Name</label>
              <input
                type="text"
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-brand-primary outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Greeting Welcome Message</label>
              <textarea
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded p-2 text-xs text-white focus:border-brand-primary outline-none h-16 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono">Accent Theme Color</label>
              <div className="flex gap-2">
                {[
                  { id: 'purple', class: 'bg-purple-500 border-purple-500' },
                  { id: 'amber', class: 'bg-amber-500 border-amber-500' },
                  { id: 'emerald', class: 'bg-emerald-500 border-emerald-500' },
                  { id: 'blue', class: 'bg-blue-500 border-blue-500' }
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setAccentColor(col.id)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 ${col.class} ${
                      accentColor === col.id ? 'scale-110 ring-2 ring-white/20' : 'opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Integration script container */}
          <div className="border-t border-white/5 pt-3.5 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-mono">HTML Script Embed</label>
              <button
                onClick={copyToClipboard}
                className="text-[9px] text-purple-400 hover:text-purple-300 font-mono uppercase flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/90 p-2.5 rounded border border-white/10 text-[9px] text-purple-400 font-mono overflow-x-auto leading-normal whitespace-pre">
              {codeSnippet}
            </pre>
          </div>
        </div>

        {/* Live Widget Preview Column (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-3.5 flex flex-col flex-1">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Interactive Web Preview</h3>
              <span className="text-[8px] font-mono text-gray-500 uppercase">PREVIEW STATE</span>
            </div>

            {/* Chatbox area */}
            <div className="flex-grow bg-dark-bg/60 rounded border border-white/5 flex flex-col h-64 justify-between">
              <div className="p-2.5 bg-dark-panel/80 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-white">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${accentColor}-500 inline-block animate-pulse`} />
                  <span>{widgetTitle}</span>
                </div>
                <Settings className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer" />
              </div>

              {/* Message scroll */}
              <div className="p-3 overflow-y-auto space-y-2 text-[11px] flex-1 scrollbar-thin">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded px-3 py-1.5 leading-snug ${
                      m.sender === 'user' 
                        ? 'bg-brand-primary text-white font-medium rounded-tr-none' 
                        : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 text-gray-500 rounded px-3 py-1.5 rounded-tl-none border border-white/5 animate-pulse">
                      typing response...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-white/5 bg-dark-panel flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask public widget assistant..."
                  className="flex-grow bg-dark-bg text-[10.5px] rounded px-2.5 py-1.5 text-white placeholder-gray-600 border border-white/10 outline-none focus:border-brand-primary"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded p-1.5 cursor-pointer flex items-center justify-center transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
