import React, { useEffect } from 'react';
import { Brain, CheckCircle2, XCircle, ShieldCheck, Sparkles, X, History, ArrowRight } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, userMemory, currentUser }) {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trials = userMemory?.recent_trials || [];
  const totalTrials = userMemory?.total_trials || 0;
  const totalHits = userMemory?.total_hits || 0;
  const accuracy = userMemory?.accuracy_percent || 0;
  const persona = userMemory?.master_persona || 'Adaptive Explorer';
  const handle = currentUser?.username ? `@${currentUser.username}` : (currentUser?.name || 'Explorer');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in safe-pb safe-pt">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-950/60 p-4 sm:p-6 max-h-[90vh] flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cognitive Dossier
                <span className="text-xs font-mono text-cyan-300 font-semibold">{handle}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Neural record of subconscious choices and verified predictions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lifetime Summary Stats Ribbon */}
        <div className="grid grid-cols-3 gap-2 py-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Trials</span>
            <span className="text-sm sm:text-base font-bold text-white font-mono">{totalTrials}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Hits</span>
            <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono">{totalHits}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Accuracy</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">{accuracy}%</span>
          </div>
        </div>

        {/* Scrollable Trials List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-1 touch-pan-y overscroll-y-auto">
          {trials.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Brain className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400">No forcing trials recorded yet.</p>
              <p className="text-[11px] text-slate-500">Play through the calibration and forcing trials to see your cognitive memory log.</p>
            </div>
          ) : (
            trials.map((t, idx) => {
              const isHit = !!t.is_hit;
              const dateStr = t.timestamp ? new Date(t.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition ${
                    isHit
                      ? 'bg-gradient-to-r from-emerald-950/20 to-slate-950/80 border-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {isHit ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          HIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <XCircle className="w-3 h-3" />
                          DIVERGED
                        </span>
                      )}
                      {t.question_domain && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                          {t.question_domain}
                        </span>
                      )}
                    </div>
                    {dateStr && (
                      <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
                    )}
                  </div>

                  {t.question_text && (
                    <p className="text-slate-300 text-[11px] line-clamp-2 mb-2 leading-relaxed italic">
                      "{t.question_text.split('\n')[0]}"
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Predicted</span>
                      <span className="font-bold text-cyan-300 truncate block">"{t.sealed_prediction}"</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Your Input</span>
                      <span className="font-bold text-white truncate block">"{t.user_input}"</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Master Archetype: <strong className="text-purple-300">{persona}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
