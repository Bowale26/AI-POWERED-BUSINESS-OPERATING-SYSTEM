import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Award, 
  AlertCircle,
  Plus,
  BookOpen
} from 'lucide-react';

interface FocusSession {
  id: string;
  topic: string;
  duration: number; // in minutes
  timestamp: string;
}

export default function FocusStopwatch() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [topic, setTopic] = useState('Campaign content layout design');
  const [sessions, setSessions] = useState<FocusSession[]>([
    { id: '1', topic: 'Configured automated lead scoring triggers', duration: 25, timestamp: '1 hour ago' },
    { id: '2', topic: 'Wrote SOP documentation regarding campaign guidelines', duration: 45, timestamp: '3 hours ago' }
  ]);

  const [totalMinutes, setTotalMinutes] = useState(70);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished!
            handleSessionComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleSessionComplete = () => {
    setIsActive(false);
    const duration = 25; // default pomodoro duration
    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      topic: topic || 'Unspecified Corporate Alignment Task',
      duration,
      timestamp: 'Just now'
    };
    setSessions(prev => [newSession, ...prev]);
    setTotalMinutes(prev => prev + duration);
    setMinutes(25);
    setSeconds(0);
    alert(`🎉 Focus Session Complete: "${topic}"! Take a well-deserved 5-minute break.`);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = (mins = 25) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 rounded border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4 animate-pulse" />
            </span>
            Focus Stopwatch
          </h2>
          <p className="text-[10px] text-gray-500">Pomodoro timing engine integrated directly into your CRM workspace for high-productivity sprints.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Timer Card (7 cols) */}
        <div className="lg:col-span-7 bg-dark-panel border border-white/5 rounded-lg p-5 flex flex-col items-center justify-center space-y-5 text-center min-h-[360px]">
          
          <div className="space-y-1 w-full max-w-sm">
            <label className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block font-mono">Current Focus Topic</label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-dark-bg border border-white/10 rounded px-3 py-2 text-xs text-white text-center font-semibold outline-none focus:border-brand-primary"
              placeholder="What are you working on?"
            />
          </div>

          {/* Time display */}
          <div className="py-4">
            <span className="font-mono text-6xl font-bold tracking-tight text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Presets & Controls */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex gap-2 justify-center">
              {[
                { label: '25m Sprint', mins: 25 },
                { label: '45m Deep Work', mins: 45 },
                { label: '5m Short Break', mins: 5 },
                { label: '15m Long Break', mins: 15 }
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => resetTimer(preset.mins)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2.5 py-1 text-[9px] font-mono font-bold text-gray-300 transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={toggleTimer}
                className={`px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                  isActive 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-brand-primary hover:bg-brand-hover text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Sprint</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Sprint</span>
                  </>
                )}
              </button>

              <button
                onClick={() => resetTimer(25)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

        </div>

        {/* Focus Stats & Logs (5 cols) */}
        <div className="lg:col-span-5 bg-dark-panel border border-white/5 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Sprint Statistics</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-1.5 py-0.5 rounded">
                Total: {totalMinutes} mins
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest font-mono">Focus Logs History</p>
              
              {sessions.map((session) => (
                <div key={session.id} className="bg-dark-bg/60 border border-white/5 rounded p-2.5 space-y-1 relative">
                  <div className="flex justify-between items-start gap-1">
                    <p className="text-[10px] font-bold text-gray-300 leading-snug">{session.topic}</p>
                    <span className="text-[9px] text-brand-primary font-mono shrink-0">{session.duration}m</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 pt-1 border-t border-white/5">
                    <span>STATUS: COMPLETED</span>
                    <span>{session.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Increase deep flow times by enabling Pomodoro limits.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
