import React, { useState } from 'react';
import { Eye, Zap, Brain, ShieldAlert, CheckCircle2, X, Lock, Sparkles, History, UserCheck, TrendingUp, Cpu, BookOpen } from 'lucide-react';

export default function MindPeekHUD({
  debugState,
  isOpen,
  onClose,
  phase
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('forecast'); // 'forecast' | 'trials' | 'evolution' | 'profile' | 'all'

  const profile = debugState?.user_profile || {};
  const currentStreak = debugState?.current_streak || 0;
  const totalHits = debugState?.total_hits || 0;
  const totalQuestions = debugState?.total_questions || 0;
  const currentPred = debugState?.current_prediction;
  const upcomingList = debugState?.upcoming_predictions || [];
  const history = debugState?.history || [];
  const modelEvo = debugState?.model_evolution || {};
  const userMemory = debugState?.user_memory || {};

  const targetText = currentPred?.target || currentPred?.predicted_text || '';
  const learnedSynonyms = modelEvo.learned_synonyms || {};

  return (
    <aside className="w-full lg:w-96 shrink-0 glass-panel lg:rounded-2xl border-l lg:border border-slate-800 p-4 sm:p-5 flex flex-col gap-3.5 overflow-y-auto max-h-screen animate-fade-in shadow-2xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Mind-Peek Telemetry HUD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
            {modelEvo.version ? modelEvo.version.replace('CLAIRVOYANT-Cognition ', '').replace('AURA-Cognition ', '') : 'v2.0'}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              title="Close Mind-Peek HUD"
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Classified Persona Archetype Banner */}
      {debugState?.persona && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-1 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
              Cognitive Archetype
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
              Calibrated
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
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            activeTab === 'forecast'
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('trials')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            activeTab === 'trials'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3 h-3 text-purple-400" />
          <span>Trials</span>
        </button>

        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            activeTab === 'evolution'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>Evolution</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
            activeTab === 'profile'
              ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-3 h-3 text-indigo-400" />
          <span>Axis</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-1.5 px-2 rounded-lg transition text-center text-[11px] ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white font-bold border border-slate-700'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          All
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: FORECAST (Active Question & Pre-Sealed Pipeline)   */}
      {/* ========================================================= */}
      {(activeTab === 'forecast' || activeTab === 'all') && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Active Pre-Sealed Target
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                #{currentPred?.sealed_hash || 'LOCKED'}
              </span>
            </div>

            {phase === 'profiling' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-400 uppercase">
                      Calibration Axis ({currentPred?.category || 'Profiling'})
                    </span>
                    <span className="text-slate-500">Step {currentPred?.step_number || 1}/3</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {currentPred?.question || "Calibrating personality baseline..."}
                  </p>
                </div>
                <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
                  Target: Calibrating Cognitive Archetype
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Once Calibration Probe 3 is answered, the entire dynamic question pipeline and all pre-sealed answers will be unlocked and shown below.
                </p>
              </div>
            ) : currentPred ? (
              <div className="space-y-2.5">
                {/* Active Question Box */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 uppercase">
                      Active Question (Trial #{currentPred.step_number || '•'}):
                    </span>
                    <span className="text-slate-500 uppercase">{currentPred.category}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                    {currentPred.question}
                  </p>
                </div>

                {/* Pre-Sealed Answer Box */}
                <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                      Pre-Sealed Predicted Answer:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-cyan-100 font-mono">
                      "{targetText}"
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-600">
                    PRE-SEALED
                  </span>
                </div>

                {/* Psychological Prime Insight */}
                {currentPred.psychological_insight && (
                  <div className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-mono not-italic block">Cognitive Prime:</span>
                    {currentPred.psychological_insight}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Waiting for next question turn...</p>
            )}
          </div>

          {/* Upcoming Neural Roadmap */}
          {upcomingList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Upcoming Neural Roadmap ({upcomingList.length})
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Pre-Computed Pipeline
                </span>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {upcomingList.map((item, idx) => (
                  <div
                    key={item.question_id || idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-purple-300 font-bold">
                        Trial #{item.step_number}: {item.category}
                      </span>
                      <span className="text-slate-500">#{item.sealed_hash}</span>
                    </div>

                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800/60 text-[11px] text-slate-300">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                        Predicted Question:
                      </span>
                      <p className="leading-snug line-clamp-3 text-slate-300">
                        {item.question}
                      </p>
                    </div>

                    <div className="p-1.5 px-2.5 rounded bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-300">
                        PREDICTED ANSWER:
                      </span>
                      <span className="font-mono font-bold text-cyan-200">
                        "{item.predicted || item.target}"
                      </span>
                    </div>

                    {item.psychological_insight && (
                      <p className="text-[9px] text-slate-400 italic line-clamp-2">
                        Prime: {item.psychological_insight}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TRIALS (Completed History)                        */}
      {/* ========================================================= */}
      {(activeTab === 'trials' || activeTab === 'all') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Trials ({totalHits}/{totalQuestions} Hits)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {totalQuestions > 0 ? Math.round((totalHits / totalQuestions) * 100) : 0}% Accuracy
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-1">
              <p className="text-xs text-slate-400">No completed forcing trials yet.</p>
              <p className="text-[10px] text-slate-500">
                Answer the active question to record trial telemetry and compare actual input with pre-sealed predictions.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs space-y-2 ${
                    h.hit
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">
                      Trial #{h.step || i + 1}: {h.category}
                    </span>
                    {h.hit ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> HIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                        <Sparkles className="w-3 h-3" /> DIVERGED
                      </span>
                    )}
                  </div>

                  {h.question && (
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">
                        Question Asked:
                      </span>
                      <p className="leading-snug line-clamp-2 text-slate-300">
                        {h.question}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-500/30">
                      <span className="text-[9px] font-mono text-cyan-400 block">SEALED PREDICTION:</span>
                      <span className="font-mono font-bold text-cyan-200">"{h.predicted}"</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/50 border border-slate-800">
                      <span className="text-[9px] font-mono text-slate-400 block">USER INPUT:</span>
                      <span className="font-mono font-medium text-slate-200">"{h.actual}"</span>
                    </div>
                  </div>

                  {h.insight && (
                    <p className="text-[9px] text-slate-400 italic line-clamp-2">
                      Mechanism: {h.insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: EVOLUTION (Self-Upgrading Model & Persistent Memory)*/}
      {/* ========================================================= */}
      {(activeTab === 'evolution' || activeTab === 'all') && (
        <div className="space-y-3">
          {/* Model Generation Card */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Self-Upgrading Neural Engine
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Current Generation:</span>
                <span className="font-mono font-bold text-white text-xs">{modelEvo.version || 'v2.0'}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Inputs Absorbed:</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">{modelEvo.total_inputs_absorbed || 0}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              CLAIRVOYANT analyzes every input, extracts semantic nuances, dynamically expands its synonym dictionary, and upgrades its predictive weights continuously.
            </p>
          </div>

          {/* Persistent User Memory Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                Persistent User Memory
              </span>
              <span className="text-[10px] font-mono text-purple-400">
                SQLite Memory
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase">Lifetime Trials:</span>
                <span className="font-mono font-bold text-cyan-300">{userMemory.total_trials || 0}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase">Lifetime Hits:</span>
                <span className="font-mono font-bold text-emerald-400">{userMemory.total_hits || 0}</span>
              </div>
            </div>

            {userMemory.recent_trials && userMemory.recent_trials.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-400 uppercase block font-mono">Recent Memory Encounters:</span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {userMemory.recent_trials.slice(0, 5).map((t, idx) => (
                    <div key={idx} className="p-1.5 rounded bg-slate-950/40 border border-slate-800/60 text-[10px] flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[130px] font-mono">"{t.user_input}"</span>
                      <span className={t.is_hit ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {t.is_hit ? "MATCH" : "DIVERGED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamically Learned Vocabulary */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Learned Lexical Adaptations ({modelEvo.learned_synonyms_count || 0})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Auto-Absorbed</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {Object.entries(learnedSynonyms).map(([qid, syns]) => (
                <div key={qid} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 block">{qid}:</span>
                  <div className="flex flex-wrap gap-1">
                    {syns.slice(-6).map((s, sIdx) => (
                      <span key={sIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PROFILE & AXIS                                    */}
      {/* ========================================================= */}
      {(activeTab === 'profile' || activeTab === 'all') && (
        <div className="space-y-3">
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
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
              <div className="flex justify-between text-xs mb-1">
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
        </div>
      )}

      {/* Footer Notice */}
      <div className="mt-auto p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          Self-upgrading neural engine: All inputs update model empirical weights and expand semantic knowledge vectors.
        </span>
      </div>
    </aside>
  );
}
