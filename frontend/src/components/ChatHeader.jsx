import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, EyeOff, RotateCcw, Volume2, VolumeX, Cpu, Lock, Unlock, Download, Smartphone } from 'lucide-react';

export default function ChatHeader({
  phase,
  persona,
  showMindPeek,
  onToggleMindPeek,
  isUnlocked,
  isMuted,
  onToggleMute,
  onReset,
  loading
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Check if iOS
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        setShowIosTip(true);
      } else {
        alert("To install on Desktop: Click the Install icon in your browser's address bar, or use the Desktop App launcher script!");
      }
    }
  };

  const getStatusBadge = () => {
    switch (phase) {
      case 'profiling':
        return {
          text: 'Phase 1: Neural Calibration',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400 animate-pulse'
        };
      case 'forcing':
      case 'quiz':
        return {
          text: 'Phase 2: Dynamic Psychological Forcing',
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          dot: 'bg-cyan-400 animate-ping'
        };
      case 'revealed':
        return {
          text: 'Hidden Patterns Unlocked',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          text: 'Online',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Bot Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${status.dot}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AURA
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Predictive AI
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${status.color}`}>
                {status.text}
              </span>
              {persona && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 animate-fade-in">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {persona}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install App Button (shows on both mobile and desktop when installable) */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              title="Install as App on Mobile or Desktop"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Mind Peek Button: Only shown once unlocked after 3 streak or 10 questions */}
          {isUnlocked ? (
            <button
              onClick={onToggleMindPeek}
              title={showMindPeek ? "Hide Mind-Peek HUD" : "Open Mind-Peek HUD (Inspect Predictions)"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border animate-fade-in ${
                showMindPeek
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/20'
              }`}
            >
              <Unlock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showMindPeek ? "Mind Peek (Open)" : "Mind Peek (Unlocked)"}</span>
            </button>
          ) : (
            <div
              title="Mind-Peek is encrypted. It unlocks after a 3-streak hit or 10 questions."
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-500 border border-slate-800/80 cursor-default"
            >
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Mind Peek Locked</span>
            </div>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Reset Session Button */}
          <button
            onClick={onReset}
            disabled={loading}
            title="Restart Session"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Install Instruction Modal / Banner */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-sm p-5 rounded-2xl border border-purple-500/40 text-center space-y-3">
            <Smartphone className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-bold text-white text-base">Install on iOS (iPhone / iPad)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> icon (⎋) at the bottom of Safari.<br />
              2. Scroll down and tap <strong>'Add to Home Screen'</strong> (⊞).<br />
              3. AURA will launch in full-screen standalone app mode!
            </p>
            <button
              onClick={() => setShowIosTip(false)}
              className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
