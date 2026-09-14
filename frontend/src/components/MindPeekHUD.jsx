import React from 'react';
import { Eye, Zap, Brain, ShieldAlert, CheckCircle2, XCircle, X, Lock, Sparkles } from 'lucide-react';

export default function MindPeekHUD({
  debugState,
  isOpen,
  onClose,
  phase
}) {
  if (!isOpen) return null;

  const profile = debugState?.user_profile || {};
  const currentStreak = debugState?.current_streak || 0;
  const maxStreak = debugState?.max_streak || 0;
  const totalHits = debugState?.total_hits || 0;
  const totalQuestions = debugState?.total_questions || 0;
  const currentPred = debugState?.current_prediction;
  const history = debugState?.history || [];

  const targetText = currentPred?.target || currentPred?.predicted_text || '';

  return (
    <aside className="w-full lg:w-88 shrink-0 glass-panel lg:rounded-2xl border-l lg:border border-slate-800 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Eye className="w-4 h-4" />
          <span>Mind-Peek Telemetry HUD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            UNLOCKED
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Detected Cognitive Persona */}
      {debugState?.persona && (
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
              Cognitive Archetype
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200">
              Classified
            </span>
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            {debugState.persona}
          </h4>
          {debugState.persona_description && (
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {debugState.persona_description}
            </p>
          )}
          {debugState.primary_branches && (
            <div className="flex items-center gap-1 pt-1 flex-wrap">
              <span className="text-[10px] text-slate-400">Active Branches:</span>
              {debugState.primary_branches.map((b) => (
                <span key={b} className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-time Sealed Thought for Active Turn */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Active Pre-Sealed Target
          </span>
          <span className="text-[10px] font-mono text-cyan-400 uppercase">
            {phase === 'profiling' ? 'Calibrating...' : 'Pre-Locked'}
          </span>
        </div>

        {phase === 'profiling' ? (
          <p className="text-xs text-slate-400 italic">
            Tuning neural baseline. Cognitive forcing trials begin in Phase 2.
          </p>
        ) : currentPred ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> #{currentPred.sealed_hash}
              </span>
              <span className="text-slate-500">{currentPred.category}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-sm font-bold">
              "{targetText}"
            </div>

            {currentPred.psychological_insight && (
              <p className="text-[10px] text-slate-400 leading-relaxed italic pt-1">
                Prime Mechanism: {currentPred.psychological_insight.slice(0, 100)}...
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Waiting for next question turn...</p>
        )}
      </div>

      {/* Streak & Accuracy Progress */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Psychological Hit Streak</span>
            <span className="font-mono font-bold text-amber-400">{currentStreak} / 3</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (currentStreak / 3) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Completed Trials</span>
            <span className="font-mono font-bold text-purple-400">{totalQuestions} / 10</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (totalQuestions / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calibrated Neural Baseline */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Calibrated Neural Axis
        </span>

        {Object.keys(profile).length === 0 ? (
          <p className="text-xs text-slate-400 italic">No calibration traits locked yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(profile).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">{k}</span>
                <span className="font-semibold text-purple-300 capitalize">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Telemetry Log */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Cognitive Trial Telemetry ({totalHits}/{totalQuestions} Hits)
          </span>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-xs ${
                  h.hit
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Trial #{i + 1}: {h.category}
                  </span>
                  {h.hit ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> HIT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                      <Sparkles className="w-3 h-3" /> DIVERGED
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px]">
                  <p className="text-cyan-300">
                    <span className="text-slate-500 font-mono">Sealed:</span> "{h.predicted}"
                  </p>
                  <p className="text-slate-200">
                    <span className="text-slate-500 font-mono">Typed:</span> "{h.actual}"
                  </p>
                  {h.insight && (
                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                      {h.insight.slice(0, 90)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live State Notice */}
      <div className="mt-auto p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          Mind-Peek is displaying live cognitive prediction telemetry directly from the neural engine.
        </span>
      </div>
    </aside>
  );
}
