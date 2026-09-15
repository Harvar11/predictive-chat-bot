import React, { useEffect, useRef } from 'react';
import { Cpu, User, Compass, Zap, Brain, CheckCircle2, XCircle, Unlock, Lock, Sparkles, ShieldCheck, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';

export default function ChatFeed({ messages, isThinking, onOpenMindPeek, onOpenRevealModal, onRetryLast }) {
  const feedEndRef = useRef(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3.5 sm:px-6 sm:py-5 space-y-3.5 sm:space-y-5 touch-pan-y overscroll-y-auto">
      {/* Cold Start Awakening Loader */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center my-auto py-12 px-4 text-center animate-fade-in max-w-md mx-auto">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-cyan-500/25 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2 tracking-wide">
            Awakening Neural Core...
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
            Establishing connection to CLAIRVOYANT predictive engines and calibrating cryptographic seals.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-cyan-300 font-mono shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Synchronizing Neural Matrix...
          </div>
        </div>
      )}
      {messages.map((msg) => {
        // Bot Question Bubble
        if (msg.role === 'bot') {
          return (
            <div key={msg.id} className="flex items-start gap-2.5 sm:gap-3 max-w-2xl animate-fade-in">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1.5px] shrink-0 mt-0.5 shadow-md shadow-purple-900/20">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-300 hidden sm:inline">CLAIRVOYANT</span>
                  {msg.stepBadge ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {msg.stepBadge}
                    </span>
                  ) : msg.category ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60">
                      {msg.category}
                    </span>
                  ) : null}
                  {msg.category && msg.stepBadge && (
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {msg.category}
                    </span>
                  )}
                  {msg.cognitiveBranch && (
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                      Branch: {msg.cognitiveBranch}
                    </span>
                  )}
                </div>

                <div className="glass-card text-slate-100 text-[13px] sm:text-base leading-relaxed p-3.5 sm:p-4 rounded-2xl rounded-tl-sm border border-slate-800/80 shadow-lg">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        }

        // User Answer Bubble
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex items-start justify-end gap-2.5 sm:gap-3 max-w-2xl ml-auto animate-fade-in">
              <div className="flex flex-col items-end gap-1 min-w-0">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">You</span>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[13px] sm:text-base p-3 px-3.5 sm:p-3.5 sm:px-4 rounded-2xl rounded-tr-sm shadow-md shadow-purple-950/40">
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>

              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300" />
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
              className={`my-2.5 sm:my-3 p-3.5 sm:p-5 rounded-2xl border animate-fade-in shadow-xl ${
                isHit
                  ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-purple-950/40 border-cyan-500/40 shadow-cyan-950/20'
                  : 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 border-slate-800 shadow-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  {isHit ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                      MIND-READ CONFIRMED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      COGNITIVE DIVERGENCE
                    </span>
                  )}

                  {msg.streak > 0 && (
                    <span className="text-[11px] sm:text-xs font-mono font-semibold text-amber-400">
                      🔥 Streak: {msg.streak}
                    </span>
                  )}
                </div>

                {msg.sealedHash && (
                  <span className="hidden sm:inline-flex text-[11px] font-mono text-slate-500 items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    Seal #{msg.sealedHash} Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 sm:gap-2.5 sm:my-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono text-cyan-400/80 block mb-0.5">
                    Predicted
                  </span>
                  <span className="text-sm sm:text-base font-bold text-cyan-300 block truncate">
                    "{msg.sealedPrediction}"
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                    Your Input
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white block truncate">
                    "{msg.userTyped}"
                  </span>
                </div>
              </div>

              {msg.insight && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-purple-300 block mb-0.5">
                    🧠 Cognitive Mechanics:
                  </span>
                  <p className="text-slate-400">{msg.insight}</p>
                </div>
              )}
            </div>
          );
        }

        // System Progress or Error Message
        if (msg.role === 'system') {
          const isError = msg.isError || msg.text?.toLowerCase().includes('error') || msg.text?.toLowerCase().includes('failed') || msg.text?.toLowerCase().includes('retry');
          if (isError) {
            return (
              <div key={msg.id} className="flex flex-col items-center my-3 max-w-md mx-auto animate-fade-in">
                <div className="w-full p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 shadow-md flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-rose-200">{msg.text}</p>
                    {(msg.onRetry || onRetryLast) && (
                      <button
                        onClick={msg.onRetry || onRetryLast}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-[11px] transition shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3 text-rose-300" />
                        Tap to Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex justify-center my-3 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
                <span>{msg.text}</span>
              </div>
            </div>
          );
        }

        // Grand Reveal Card (3-Streak or 10-Trial Milestone)
        if (msg.role === 'reveal') {
          const r = msg.data || {};
          const accuracy = r.accuracy_percent ?? r.accuracy ?? 0;
          const archetype = r.archetype ?? r.persona ?? 'Adaptive Explorer';
          const reason = r.reason ?? r.reveal_reason ?? 'Cognitive Milestone Achieved';
          const totalHits = r.total_hits ?? 0;
          const totalQ = r.total_questions ?? 0;
          const maxStreak = r.max_streak ?? 0;

          return (
            <div key={msg.id} className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-xl shadow-purple-950/30 animate-fade-in">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  COGNITIVE SYNCHRONIZATION UNLOCKED
                </span>
                <span className="text-xs text-slate-400">• {reason}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Mind-Peek Telemetry is Now Fully Unlocked!
              </h3>

              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Accuracy</span>
                  <span className="text-base sm:text-lg font-extrabold text-cyan-400">{accuracy}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Hits</span>
                  <span className="text-base sm:text-lg font-extrabold text-purple-300">{totalHits} / {totalQ}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Peak Streak</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-400">{maxStreak}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  <span>Archetype: <strong className="text-purple-300">{archetype}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  {onOpenRevealModal && (
                    <button
                      onClick={() => onOpenRevealModal(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/40 to-cyan-600/40 hover:from-purple-600/60 hover:to-cyan-600/60 text-cyan-200 border border-cyan-500/40 font-semibold transition"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      View Full Report Card
                    </button>
                  )}
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
