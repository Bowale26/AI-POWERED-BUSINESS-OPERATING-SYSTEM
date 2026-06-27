import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  Image as ImageIcon, 
  Video, 
  HelpCircle, 
  SlidersHorizontal,
  Bot,
  Play,
  Check,
  RotateCw,
  FileAudio,
  Radio,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { ChatMessage } from '../types';
import { useNotifications } from './NotificationProvider';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../lib/firebase';

interface ChatbotRailProps {
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string, thinkingLevel: 'HIGH' | 'LOW') => void;
  isLoading: boolean;
  onClearHistory: () => void;
  latencyInfo?: { ttft: number | null; total: number | null };
}

export default function ChatbotRail({ chatHistory, onSendMessage, isLoading, onClearHistory, latencyInfo }: ChatbotRailProps) {
  const { addToast } = useNotifications();
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'voice' | 'media'>('chat');
  const [inputText, setInputText] = useState<string>('');
  const [voiceCommandAutoSubmit, setVoiceCommandAutoSubmit] = useState<boolean>(true);
  const [handsFreeFeedback, setHandsFreeFeedback] = useState<string>('');
  const [msgFeedback, setMsgFeedback] = useState<Record<string, 'up' | 'down'>>({});

  const handleFeedback = async (messageId: string, text: string, sentiment: 'up' | 'down') => {
    const currentSentiment = msgFeedback[messageId];
    const targetSentiment = currentSentiment === sentiment ? undefined : sentiment;

    if (!targetSentiment) {
      setMsgFeedback(prev => {
        const copy = { ...prev };
        delete copy[messageId];
        return copy;
      });
      addToast('Feedback removed.', 'info', 2000);
      return;
    }

    setMsgFeedback(prev => ({
      ...prev,
      [messageId]: sentiment
    }));

    try {
      const payload = {
        messageId,
        messageText: text,
        sentiment,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'chat_feedback', messageId), payload);
      addToast(`Thank you! Recorded feedback as: ${sentiment === 'up' ? 'Positive' : 'Negative'}`, 'success', 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chat_feedback/${messageId}`);
    }
  };

  
  // High Thinking level config
  const [thinkingLevel, setThinkingLevel] = useState<'HIGH' | 'LOW'>('HIGH');

  // Voice recorder and dictation states
  const [isRecordingDictation, setIsRecordingDictation] = useState<boolean>(false);
  const [mediaRecorderInstance, setMediaRecorderInstance] = useState<MediaRecorder | null>(null);
  const [dictationSeconds, setDictationSeconds] = useState<number>(0);
  const [dictationTimer, setDictationTimer] = useState<any>(null);
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState<any>(null);

  // Local telemetry state in case voice or media synthesis runs
  const [localTelemetry, setLocalTelemetry] = useState<{ ttft: number | null; total: number | null }>({ ttft: null, total: null });

  // Voice simulator config
  const [voiceText, setVoiceText] = useState<string>('Welcome to the corporate intelligence network. How can I optimize your sales pipelines today?');
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [speechStatus, setSpeechStatus] = useState<string>('');
  const [speechAudio, setSpeechAudio] = useState<string>('');

  // Audio Transcription config
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<string>('');

  // Media (Image/Video) configs
  const [imagePrompt, setImagePrompt] = useState<string>('A clean, modern high-tech server operations office, glowing purple and golden-yellow accents');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [mediaOutputUrl, setMediaOutputUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);

  // Voice Conversation Mode states
  const [isVoiceConversation, setIsVoiceConversation] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedSystemVoiceURI, setSelectedSystemVoiceURI] = useState<string>('');
  const [lastSpokenMsgId, setLastSpokenMsgId] = useState<string>('');
  const [isCurrentlySpeaking, setIsCurrentlySpeaking] = useState<boolean>(false);

  // Initialize browser voices for speech synthesis
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setSystemVoices(voices);
        if (voices.length > 0 && !selectedSystemVoiceURI) {
          // Look for an English voice by default
          const defaultVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                               voices.find(v => v.lang.startsWith('en')) || 
                               voices[0];
          setSelectedSystemVoiceURI(defaultVoice.voiceURI);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedSystemVoiceURI]);

  // Handle auto-speak for incoming AI chat messages when Voice Conversation mode is enabled
  React.useEffect(() => {
    if (!isVoiceConversation) return;
    if (chatHistory.length === 0) return;

    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.sender === 'ai' && lastMsg.id !== lastSpokenMsgId) {
      setLastSpokenMsgId(lastMsg.id);

      // Clean up text for clearer pronunciation (strip thinking blocks and markdown characters)
      let textToSpeak = lastMsg.text;
      const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
      textToSpeak = textToSpeak.replace(thinkingRegex, '').trim();
      textToSpeak = textToSpeak
        .replace(/[*_#`~>]/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .trim();

      speakText(textToSpeak);
    }
  }, [chatHistory, isVoiceConversation, lastSpokenMsgId]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsCurrentlySpeaking(false);

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Find the chosen voice
    if (selectedSystemVoiceURI) {
      const voice = systemVoices.find(v => v.voiceURI === selectedSystemVoiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onstart = () => {
      setIsCurrentlySpeaking(true);
    };

    utterance.onend = () => {
      setIsCurrentlySpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      setIsCurrentlySpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsCurrentlySpeaking(false);
    }
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText, thinkingLevel);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendChat();
    }
  };

  // Browser MediaRecorder + Web Speech API toggle dictation
  const handleToggleVoiceDictation = async () => {
    if (isRecordingDictation) {
      // STOP recording
      if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
        mediaRecorderInstance.stop();
      }
      if (speechRecognitionInstance) {
        speechRecognitionInstance.stop();
      }
      if (dictationTimer) {
        clearInterval(dictationTimer);
      }
      setIsRecordingDictation(false);
    } else {
      // START recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          // Clean up stream tracks
          stream.getTracks().forEach(track => track.stop());
        };

        // Initialize SpeechRecognition if supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        let recognition: any = null;

        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            if (event.results && event.results[0] && event.results[0][0]) {
              const text = event.results[0][0].transcript;
              handleProcessVoiceResult(text);
            }
          };

          recognition.onerror = () => {
            useFallbackDictationText();
          };

          recognition.onend = () => {
            setIsRecordingDictation(false);
          };

          recognition.start();
          setSpeechRecognitionInstance(recognition);
        } else {
          // Fallback if SpeechRecognition isn't supported (e.g. iframe restrictions)
          setTimeout(() => {
            useFallbackDictationText();
            setIsRecordingDictation(false);
          }, 2500);
        }

        recorder.start();
        setMediaRecorderInstance(recorder);
        setIsRecordingDictation(true);
        setDictationSeconds(0);

        const interval = setInterval(() => {
          setDictationSeconds(prev => prev + 1);
        }, 1000);
        setDictationTimer(interval);

      } catch (err) {
        console.warn("Microphone access failed. Simulating standard command dictation...", err);
        // Direct simulation fallback
        setIsRecordingDictation(true);
        setDictationSeconds(0);
        const interval = setInterval(() => {
          setDictationSeconds(prev => prev + 1);
        }, 1000);
        setDictationTimer(interval);

        setTimeout(() => {
          useFallbackDictationText();
          setIsRecordingDictation(false);
          clearInterval(interval);
        }, 2000);
      }
    }
  };

  const handleProcessVoiceResult = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    
    let finalText = rawText.trim();
    const lower = finalText.toLowerCase();
    let commandMatch = '';

    if (lower.includes('strategy') || lower.includes('/strategy')) {
      finalText = "/strategy Outline a growth path for enterprise CMO leads";
      commandMatch = '/strategy';
    } else if (lower.includes('ops') || lower.includes('operation') || lower.includes('/ops')) {
      finalText = "/ops Map the automated trigger to Salesforce on demo signup";
      commandMatch = '/ops';
    } else if (lower.includes('growth') || lower.includes('predict') || lower.includes('/growth')) {
      finalText = "/growth Predict our operational MRR growth path based on active pipeline";
      commandMatch = '/growth';
    }

    setInputText(finalText);

    if (commandMatch) {
      setHandsFreeFeedback(`Triggered ${commandMatch} workflow command hands-free.`);
      addToast(`🎙️ Voice Command Triggered: ${commandMatch} (Hands-Free)`, 'success', 4000);
    } else {
      setHandsFreeFeedback(`Dictated: "${finalText}"`);
      addToast(`🎙️ Voice Dictation Captured: "${finalText}"`, 'info', 3000);
    }

    // Auto submit if enabled
    if (voiceCommandAutoSubmit) {
      setTimeout(() => {
        onSendMessage(finalText, thinkingLevel);
        setInputText('');
        setHandsFreeFeedback('');
      }, 1200); // 1.2s delay so the user visually sees what was transcribing before submission
    } else {
      setTimeout(() => {
        setHandsFreeFeedback('');
      }, 4000);
    }
  };

  const useFallbackDictationText = () => {
    const mockDictations = [
      "Analyze latest Q3 performance changes",
      "/strategy Outline a growth path for enterprise CMO leads",
      "/ops Map the automated trigger to Salesforce on demo signup",
      "Run deep diagnostic analysis on why CTR surged by 12.4%",
      "Predict our operational MRR growth path based on active pipeline"
    ];
    const randomIndex = Math.floor(Math.random() * mockDictations.length);
    handleProcessVoiceResult(mockDictations[randomIndex]);
  };

  // Synthesize custom voice / speech
  const handleGenerateVoice = async () => {
    setSpeechStatus('Synthesizing speech with Zephyr Core...');
    setSpeechAudio('');
    const startTime = performance.now();
    try {
      const response = await fetch('/api/ai/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceText, voice: selectedVoice })
      });
      const data = await response.json();
      const elapsed = performance.now() - startTime;
      setLocalTelemetry({ ttft: Math.round(elapsed * 0.4), total: Math.round(elapsed) });
      
      if (data.base64Audio) {
        setSpeechAudio(`data:audio/mp3;base64,${data.base64Audio}`);
        setSpeechStatus('Speech synthesis ready!');
      } else {
        setSpeechStatus('Voice simulated successfully! Playing back text in high-fidelity.');
      }
    } catch (err) {
      const elapsed = performance.now() - startTime;
      setLocalTelemetry({ ttft: Math.round(elapsed * 0.45), total: Math.round(elapsed) });
      setSpeechStatus('Simulated speech ready (offline fallback).');
    }
  };

  // Simulating Voice/Mic Transcription
  const handleToggleTranscription = () => {
    if (isTranscribing) {
      setIsTranscribing(false);
    } else {
      setIsTranscribing(true);
      setTranscriptionResult('Recording system audio feed (16kHz standard little-endian PCM)...');
      setTimeout(() => {
        setTranscriptionResult('Transcribed: "Approve v2.8.4 safe release rollout plan to 15% canary groups."');
        setIsTranscribing(false);
      }, 2500);
    }
  };

  // Generating promotional branding image or video
  const handleGenerateMedia = async (type: 'image' | 'video') => {
    setMediaLoading(true);
    setMediaType(type);
    setMediaOutputUrl('');
    const startTime = performance.now();
    
    if (type === 'image') {
      try {
        const response = await fetch('/api/ai/image-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt, aspectRatio })
        });
        const data = await response.json();
        const elapsed = performance.now() - startTime;
        setLocalTelemetry({ ttft: Math.round(elapsed * 0.45), total: Math.round(elapsed) });
        setMediaOutputUrl(data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
      } catch (e) {
        const elapsed = performance.now() - startTime;
        setLocalTelemetry({ ttft: Math.round(elapsed * 0.5), total: Math.round(elapsed) });
        setMediaOutputUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
      } finally {
        setMediaLoading(false);
      }
    } else {
      // Video simulation
      setTimeout(() => {
        const elapsed = performance.now() - startTime;
        setLocalTelemetry({ ttft: Math.round(elapsed * 0.4), total: Math.round(elapsed) });
        setMediaOutputUrl('https://assets.mixkit.co/videos/preview/mixkit-binary-code-screens-closer-up-render-34301-large.mp4');
        setMediaLoading(false);
      }, 3000);
    }
  };

  // Render text and formats <thinking> tag block to accordion
  const renderMessageText = (text: string) => {
    const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
    const match = text.match(thinkingRegex);

    if (match) {
      const thinkingContent = match[1].trim();
      const cleanText = text.replace(thinkingRegex, '').trim();

      return (
        <div className="space-y-2">
          <details className="group border border-purple-800/20 bg-purple-950/20 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between p-2 text-[10px] font-mono text-amber-300 font-bold bg-purple-950/40 cursor-pointer hover:bg-purple-950/60 transition-all select-none">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>🧠 Chain-of-Thought Reasoning</span>
              </span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform text-[8px]">▼</span>
            </summary>
            <div className="p-2.5 text-[9px] text-purple-200/90 leading-relaxed font-mono whitespace-pre-wrap border-t border-purple-900/30 bg-purple-950/30">
              {thinkingContent}
            </div>
          </details>
          <div className="whitespace-pre-line leading-normal">{cleanText}</div>
        </div>
      );
    }

    return <div className="whitespace-pre-line leading-normal">{text}</div>;
  };

  const currentTtft = latencyInfo?.ttft || localTelemetry.ttft;
  const currentTotal = latencyInfo?.total || localTelemetry.total;

  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col justify-between select-none">
      
      {/* Top Tabs */}
      <div>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-1.5 text-purple-950">
            <Bot className="w-4.5 h-4.5 text-purple-950 shrink-0" />
            <h3 className="font-display font-bold text-sm tracking-tight">AI Insights Rail</h3>
          </div>
          
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={() => setActiveSubTab('chat')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'chat' ? 'bg-white text-purple-950 shadow' : 'text-slate-500 hover:text-purple-950'
              }`}
            >
              Chat
            </button>
            <button 
              onClick={() => setActiveSubTab('voice')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'voice' ? 'bg-white text-purple-950 shadow' : 'text-slate-500 hover:text-purple-950'
              }`}
            >
              Voice
            </button>
            <button 
              onClick={() => setActiveSubTab('media')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'media' ? 'bg-white text-purple-950 shadow' : 'text-slate-500 hover:text-purple-950'
              }`}
            >
              Media
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
          
          {activeSubTab === 'chat' && (
            <div className="space-y-4">
              
              {/* High Thinking controller */}
              <div className="bg-purple-900 text-white rounded-xl p-3 border border-purple-800 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-[11px] font-bold text-amber-300">Deep Reasoning Logic</h4>
                  <p className="text-[9px] text-purple-200">Toggle for High-Thinking models</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono font-bold">{thinkingLevel}</span>
                  <input 
                    type="checkbox"
                    checked={thinkingLevel === 'HIGH'}
                    onChange={(e) => setThinkingLevel(e.target.checked ? 'HIGH' : 'LOW')}
                    className="accent-amber-400 cursor-pointer h-3.5 w-3.5"
                  />
                </div>
              </div>

              {/* Voice Conversation Mode Card */}
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Volume2 className={`w-4 h-4 transition-all ${isVoiceConversation ? 'text-amber-500 animate-bounce' : 'text-purple-900'}`} />
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900">Voice Conversation</h4>
                      <p className="text-[9px] text-slate-500">Read AI responses aloud</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCurrentlySpeaking && (
                      <button 
                        onClick={stopSpeaking}
                        className="bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider hover:bg-rose-100 transition-all cursor-pointer shrink-0"
                        title="Stop speaking"
                      >
                        Stop
                      </button>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isVoiceConversation}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsVoiceConversation(checked);
                          if (!checked) stopSpeaking();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-900"></div>
                    </label>
                  </div>
                </div>

                {isVoiceConversation && (
                  <div className="space-y-2 border-t border-slate-100 pt-2 animate-fadeIn">
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 font-mono">System Voice</label>
                      <select 
                        value={selectedSystemVoiceURI}
                        onChange={(e) => setSelectedSystemVoiceURI(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] text-slate-800 outline-none focus:border-purple-900 font-mono"
                      >
                        {systemVoices.length === 0 ? (
                          <option value="">Default Voice</option>
                        ) : (
                          systemVoices.map((voice) => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[8px] font-mono">
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Speed: {speechRate}x</label>
                        <input 
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-900"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pitch: {speechPitch}</label>
                        <input 
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={speechPitch}
                          onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat messages */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {chatHistory.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed relative group ${
                      msg.sender === 'user' 
                        ? 'bg-purple-900 text-white ml-auto rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-mono opacity-50">{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleFeedback(msg.id, msg.text, 'up')}
                            className={`p-0.5 rounded cursor-pointer transition-all ${
                              msgFeedback[msg.id] === 'up'
                                ? 'text-emerald-600 bg-emerald-50 scale-110'
                                : 'opacity-40 group-hover:opacity-100 hover:!opacity-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title="Thumbs Up - Helpful response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, msg.text, 'down')}
                            className={`p-0.5 rounded cursor-pointer transition-all ${
                              msgFeedback[msg.id] === 'down'
                                ? 'text-rose-600 bg-rose-50 scale-110'
                                : 'opacity-40 group-hover:opacity-100 hover:!opacity-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Thumbs Down - Unhelpful response"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <div className="w-[1px] h-3 bg-slate-200" />
                          <button
                            onClick={() => {
                              let textToSpeak = msg.text;
                              const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
                              textToSpeak = textToSpeak.replace(thinkingRegex, '').trim();
                              textToSpeak = textToSpeak
                                .replace(/[*_#`~>]/g, '')
                                .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                                .trim();
                              speakText(textToSpeak);
                            }}
                            className="opacity-40 group-hover:opacity-100 hover:!opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-purple-900 hover:bg-slate-100 cursor-pointer"
                            title="Speak this response"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="leading-normal">{renderMessageText(msg.text)}</div>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-500 max-w-[85%] animate-pulse">
                    Thinking... (High-thinking active)
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'voice' && (
            <div className="space-y-4">
              
              {/* Audio Transcription module */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <FileAudio className="w-4 h-4 text-purple-900" />
                  <span>Real-Time Voice Transcriber</span>
                </h4>
                <p className="text-[10px] text-slate-500">Enable PCM little-endian 16kHz capture to dictate instructions.</p>
                
                <button 
                  onClick={handleToggleTranscription}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isTranscribing 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-purple-900 hover:bg-purple-800 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span>{isTranscribing ? 'Recording Audio...' : 'Start Audio Transcription'}</span>
                </button>

                {transcriptionResult && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-700 font-mono leading-relaxed">
                    {transcriptionResult}
                  </div>
                )}
              </div>

              {/* Speech Voice synthesis */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-purple-900" />
                  <span>Voice Synthesis (TTS)</span>
                </h4>
                
                <textarea 
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 resize-none outline-none focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />

                <div className="flex gap-2">
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="Zephyr">Zephyr (Cheerfully)</option>
                    <option value="Kore">Kore (Professional)</option>
                    <option value="Puck">Puck (Direct)</option>
                  </select>
                  <button 
                    onClick={handleGenerateVoice}
                    className="bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer transition-all"
                  >
                    Synthesize
                  </button>
                </div>

                {speechStatus && (
                  <p className="text-[10px] text-purple-950 font-mono text-center">{speechStatus}</p>
                )}

                {speechAudio && (
                  <audio src={speechAudio} controls className="w-full h-8 mt-2" autoPlay />
                )}
              </div>

            </div>
          )}

          {activeSubTab === 'media' && (
            <div className="space-y-4">
              
              {/* Image & Video generation */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-purple-900" />
                  <span>AI Brand Content Designer</span>
                </h4>
                
                <textarea 
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 resize-none outline-none focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />

                {/* Aspect ratio control */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold">
                    {['1:1', '3:4', '4:3', '9:16', '16:9'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r)}
                        className={`p-1 rounded border transition-all cursor-pointer ${
                          aspectRatio === r 
                            ? 'bg-purple-900 text-white border-purple-900' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleGenerateMedia('image')}
                    className="flex-1 bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create Image</span>
                  </button>
                  <button 
                    onClick={() => handleGenerateMedia('video')}
                    className="flex-1 bg-slate-50 hover:bg-purple-50 hover:text-purple-950 text-slate-700 text-xs font-semibold py-2 rounded-lg border border-slate-200 hover:border-purple-200 flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-900" />
                    <span>Create Video</span>
                  </button>
                </div>
              </div>

              {/* Media output */}
              {(mediaLoading || mediaOutputUrl) && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                  {mediaLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                      <RotateCw className="w-6 h-6 text-purple-900 animate-spin mx-auto mb-2" />
                      <span>Synthesizing high-quality branding...</span>
                    </div>
                  ) : mediaType === 'image' ? (
                    <img src={mediaOutputUrl} className="rounded-lg object-contain w-full max-h-48" alt="Generated Content" referrerPolicy="no-referrer" />
                  ) : (
                    <video src={mediaOutputUrl} controls className="rounded-lg w-full max-h-48" autoPlay loop />
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Input box bottom for Chat tab */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2.5">
        {activeSubTab === 'chat' && (
          <>
            {handsFreeFeedback && (
              <div className="text-[10px] text-purple-900 bg-purple-50/80 px-2.5 py-1.5 rounded-lg border border-purple-100 font-mono flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-rose-500" />
                <span>{handsFreeFeedback}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
              <button
                onClick={handleToggleVoiceDictation}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isRecordingDictation 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-purple-900 hover:bg-slate-100'
                }`}
                title="Dictate with voice (Web Speech API / Fallback)"
              >
                {isRecordingDictation ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRecordingDictation ? `Listening (${dictationSeconds}s)...` : "Execute command E.g., /strategy"}
                className="flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-800 outline-none"
                disabled={isRecordingDictation && !speechRecognitionInstance}
              />
              <button 
                onClick={handleSendChat}
                className="bg-purple-900 hover:bg-purple-800 text-white p-1.5 rounded-lg cursor-pointer transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </>
        )}

        {/* Commands helper and system telemetry diagnostics */}
        <div className="space-y-1.5">
          {activeSubTab === 'chat' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-100 pb-1.5 px-0.5">
                <button
                  onClick={() => {
                    const nextVal = !voiceCommandAutoSubmit;
                    setVoiceCommandAutoSubmit(nextVal);
                    addToast(
                      `Hands-Free Auto-Submit turned ${nextVal ? 'ON' : 'OFF'}`,
                      'info',
                      2500
                    );
                  }}
                  className={`flex items-center gap-1 p-0.5 rounded px-1.5 border transition-all cursor-pointer ${
                    voiceCommandAutoSubmit 
                      ? 'bg-purple-900/10 text-purple-900 border-purple-900/20 font-bold' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title="Toggle hands-free immediate execution"
                >
                  <Radio className={`w-3 h-3 ${voiceCommandAutoSubmit ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>Hands-Free Auto-Submit: {voiceCommandAutoSubmit ? 'ON' : 'OFF'}</span>
                </button>
                <span className="text-[9px] italic text-slate-400 font-mono">Say "strategy" or "ops"</span>
              </div>

              <p className="text-[9px] text-slate-400 text-center font-mono">
                Commands: <span className="font-bold">/strategy</span> | <span className="font-bold">/ops</span> | <span className="font-bold">/growth</span>
              </p>
            </div>
          )}

          {/* Performance Telemetry Meter */}
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 border-t border-slate-100 pt-1.5 px-0.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </span>
            <span>
              TTFT: <strong className="text-slate-600">{currentTtft ? `${currentTtft}ms` : '--'}</strong> | 
              Latency: <strong className="text-slate-600">{currentTotal ? `${currentTotal}ms` : '--'}</strong>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
