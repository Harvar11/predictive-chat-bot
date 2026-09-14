import React, { useEffect, useRef } from 'react';
import { Cpu, User, Compass, Zap, Brain, CheckCircle2, XCircle, Unlock, Lock, Sparkles, ShieldCheck } from 'lucide-react';

export default function ChatFeed({ messages, isThinking, onOpenMindPeek }) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-5">
      {messages.map((msg) => {
        // Bot Question Bubble
        if (msg.role === 'bot') {
          return (
            <div key={msg.id} className="flex items-start gap-3 max-w-2xl animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1.5px] shrink-0 mt-0.5 shadow-md shadow-purple-900/20">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-300">CLAIRVOYANT</span>
                  {msg.category && (
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {msg.category}
                    </span>
                  )}
                  {msg.stepBadge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {msg.stepBadge}
                    </span>
                  )}
                  {msg.cognitiveBranch && (
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                      Branch: {msg.cognitiveBranch}
                    </span>
                  )}
                </div>

                <div className="glass-card text-slate-100 text-sm sm:text-base leading-relaxed p-4 rounded-2xl rounded-tl-sm border border-slate-800 shadow-lg">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        }

        // User Answer Bubble
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex items-start justify-end gap-3 max-w-2xl ml-auto animate-fade-in">
              <div className="flex flex-col items-end gap-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400">You</span>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm sm:text-base p-3.5 px-4 rounded-2xl rounded-tr-sm shadow-md shadow-purple-950/40">
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                <User className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          );
        }

        // Turn-by-Turn Forcing Reveal Card
        if (msg.role === 'forcing_result') {
          const isHit = msg.isHit;
          return (
            <div
              key={msg.id}
              className={`my-3 p-4 sm:p-5 rounded-2xl border animate-fade-in shadow-xl ${
                isHit
                  ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-purple-950/40 border-cyan-500/40 shadow-cyan-950/20'
                  : 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 border-slate-800 shadow-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isHit ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      MIND-READ CONFIRMED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      COGNITIVE DIVERGENCE
                    </span>
                  )}

                  {msg.streak > 0 && (
                    <span className="text-xs font-mono font-semibold text-amber-400">
                      🔥 Streak: {msg.streak}
                    </span>
                  )}
                </div>

                {msg.sealedHash && (
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    Seal #{msg.sealedHash} Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    AURA Pre-Sealed Prediction
                  </span>
                  <span className="text-base font-bold text-cyan-300 block">
                    "{msg.sealedPrediction}"
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Your Spontaneous Input
                  </span>
                  <span className="text-base font-bold text-white block">
                    "{msg.userTyped}"
                  </span>
                </div>
              </div>

              {msg.insight && (
                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-purple-300 block mb-0.5">
                    🧠 Cognitive Mechanics:
                  </span>
                  <p className="text-slate-400">{msg.insight}</p>
                </div>
              )}
            </div>
          );
        }

        // System Progress Pill
        if (msg.role === 'system') {
          return (
            <div key={msg.id} className="flex justify-center my-3 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
                <span>{msg.text}</span>
              </div>
            </div>
          );
        }

        // Grand Reveal Card (3-Streak Unlock)
        if (msg.role === 'reveal') {
          const r = msg.data || {};
          return (
            <div key={msg.id} className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-xl shadow-purple-950/30 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  COGNITIVE SYNCHRONIZATION UNLOCKED
                </span>
                <span className="text-xs text-slate-400">• {r.reason}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Mind-Peek Telemetry is Now Fully Unlocked!
              </h3>

              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Accuracy</span>
                  <span className="text-base sm:text-lg font-extrabold text-cyan-400">{r.accuracy_percent}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Hits</span>
                  <span className="text-base sm:text-lg font-extrabold text-purple-300">{r.total_hits} / {r.total_questions}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Peak Streak</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-400">{r.max_streak}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Archetype: <strong className="text-purple-300">{r.archetype}</strong></span>
                </div>
                {onOpenMindPeek && (
                  <button
                    onClick={onOpenMindPeek}
                    className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                  >
                    <Unlock className="w-3 h-3" />
                    Open Mind Peek
                  </button>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}

      {/* Thinking / Anticipation indicator */}
      {isThinking && (
        <div className="flex items-start gap-3 max-w-xl animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-slate-400 animate-pulse" />
          </div>
          <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="ml-2 text-xs text-slate-400 font-mono">Evaluating subconscious prime...</span>
          </div>
        </div>
      )}

      <div ref={feedEndRef} />
    </div>
  );
}
