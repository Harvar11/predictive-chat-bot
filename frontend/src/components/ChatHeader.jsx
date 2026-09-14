import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, RotateCcw, Volume2, VolumeX, Cpu, Unlock, Download, Smartphone, User, LogOut, Brain } from 'lucide-react';

export default function ChatHeader({
  phase,
  persona,
  showMindPeek,
  onToggleMindPeek,
  isUnlocked,
  isMuted,
  onToggleMute,
  onReset,
  loading,
  currentUser,
  onOpenAuth,
  onLogout,
  userMemory,
  modelVersion,
  onOpenInstall
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
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
          text: 'Phase 2: Psychological Forcing',
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          dot: 'bg-cyan-400 animate-ping'
        };
      case 'revealed':
        return {
          text: 'Patterns Unlocked',
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
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
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
                CLAIRVOYANT
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Predictive AI
                </span>
                {modelVersion && (
                  <span className="hidden md:inline text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {modelVersion.replace('CLAIRVOYANT-Cognition ', '').replace('AURA-Cognition ', '')}
                  </span>
                )}
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

        {/* Right: Controls & User Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          {/* Google Auth / User Memory Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-xs transition shadow-sm"
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full border border-purple-400"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-200 text-[10px] font-bold flex items-center justify-center">
                    {currentUser.name?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-slate-200 max-w-[90px] truncate">
                  {currentUser.name?.split(' ')[0] || 'Profile'}
                </span>
                {userMemory?.total_trials > 0 && (
                  <span className="text-[10px] font-mono px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    🧠 {userMemory.total_trials}
                  </span>
                )}
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl glass-card border border-slate-700/80 shadow-2xl z-50 space-y-2 animate-fade-in text-xs">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center font-bold">
                      {currentUser.name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email || 'Local User'}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Total Trials:</span>
                      <span className="font-mono text-cyan-300 font-bold">{userMemory?.total_trials || 0}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Lifetime Accuracy:</span>
                      <span className="font-mono text-emerald-400 font-bold">{userMemory?.accuracy_percent || 0}%</span>
                    </div>
                    {userMemory?.master_persona && (
                      <div className="pt-1 text-[10px] text-purple-300 border-t border-slate-800/80">
                        <span className="text-slate-500 uppercase block">Master Archetype:</span>
                        {userMemory.master_persona}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth();
                      }}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Switch Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign in with Google to persist memory and track neural profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-slate-700/80 transition shadow-sm hover:border-slate-500"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Download App Button (Desktop & Mobile) */}
          <button
            onClick={onOpenInstall}
            title="Download & Install CLAIRVOYANT on Desktop, Android, or iOS"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/25 to-cyan-600/25 hover:from-purple-600/40 hover:to-cyan-600/40 text-cyan-300 border border-cyan-500/40 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Mind Peek Button */}
          <button
            onClick={onToggleMindPeek}
            title={showMindPeek ? "Hide Mind-Peek HUD" : "Open Mind-Peek HUD (Inspect Predictions & Model Evolution)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border animate-fade-in ${
              showMindPeek
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                : 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/20'
            }`}
          >
            <Unlock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showMindPeek ? "Mind Peek (Open)" : "Mind Peek (Unlocked)"}</span>
          </button>

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

      {/* iOS Install Instruction Modal */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-sm p-5 rounded-2xl border border-purple-500/40 text-center space-y-3">
            <Smartphone className="w-8 h-8 text-purple-400 mx-auto" />
            <h3 className="font-bold text-white text-base">Install on iOS</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> icon (⎋) at the bottom of Safari.<br />
              2. Tap <strong>'Add to Home Screen'</strong> (⊞).<br />
              3. AURA will launch in standalone app mode!
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
