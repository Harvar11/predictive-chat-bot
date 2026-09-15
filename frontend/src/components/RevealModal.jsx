import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, XCircle, Zap, Brain, RotateCcw, ArrowRight, Award, Share2, Copy, Check } from 'lucide-react';
import { soundManager } from '../utils/sound';

export default function RevealModal({
  isOpen,
  revealData,
  onClose,
  onRestart
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundManager.playRevealFanfare();
      // Trigger festive confetti explosion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6']
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen || !revealData) return null;

  const reason = revealData.reason || revealData.reveal_reason || 'Cognitive milestone achieved! Full Telemetry Unlocked.';
  const total_hits = revealData.total_hits ?? 0;
  const total_questions = revealData.total_questions ?? 0;
  const accuracy_percent = revealData.accuracy_percent ?? revealData.accuracy ?? 0;
  const max_streak = revealData.max_streak ?? 0;
  const archetype = revealData.archetype || revealData.persona || 'Adaptive Explorer';
  const description = revealData.description || revealData.persona_description || 'Adaptive subconscious decision profile.';
  const history = revealData.history || [];

  const handleShare = async () => {
    const text = `🧠 CLAIRVOYANT predicted my subconscious thoughts with ${accuracy_percent}% accuracy! Archetype: ${archetype} (Peak Streak: ${max_streak}). Can it read your mind?`;
    const shareUrl = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CLAIRVOYANT Cognitive Mind Profile',
          text: text,
          url: shareUrl,
        });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-950/80 p-5 sm:p-8 overflow-hidden my-auto">
        
        {/* Glow backdrop decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>SYSTEM REVEAL TRIGGERED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            I Anticipated Your Choices
          </h2>

          <p className="mt-1.5 text-sm text-slate-300 max-w-md">
            {reason}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block mb-1">
              Accuracy
            </span>
            <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {accuracy_percent}%
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block mb-1">
              Hits
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">
              {total_hits} <span className="text-sm font-normal text-slate-400">/ {total_questions}</span>
            </span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 block mb-1">
              Best Streak
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
              {max_streak} <Zap className="w-4 h-4 fill-amber-400" />
            </span>
          </div>
        </div>

        {/* Personality Archetype Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/30 mb-6 relative">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">
              Archetype: <span className="text-purple-300">{archetype}</span>
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Prediction Timeline List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            Prediction Log vs. Your Choice
          </h4>
          <div className="max-h-48 sm:max-h-56 overflow-y-auto space-y-2 pr-1">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
                  item.hit
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/20 text-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-200 truncate">{item.question}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>Predicted: <strong className="text-purple-300">{item.predicted}</strong></span>
                    <span>•</span>
                    <span>You chose: <strong className="text-slate-200">{item.actual}</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  {item.hit ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> HIT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> MISS
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950/50 transition active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                Share Mind Profile
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 transition active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Start Fresh Quiz
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition"
          >
            Keep Answering
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
