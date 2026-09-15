import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, RotateCcw, Volume2, VolumeX, Cpu, Unlock, Lock, Download, Smartphone, User, LogOut, Brain, MoreVertical, Edit2 } from 'lucide-react';

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
  onOpenEditUsername,
  userMemory,
  modelVersion,
  onOpenInstall
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
          shortText: 'Calibration',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400 animate-pulse'
        };
      case 'forcing':
      case 'quiz':
        return {
          text: 'Phase 2: Psychological Forcing',
          shortText: 'Forcing',
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          dot: 'bg-cyan-400 animate-ping'
        };
      case 'revealed':
        return {
          text: 'Patterns Unlocked',
          shortText: 'Unlocked',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400'
        };
      default:
        return {
          text: 'Online',
          shortText: 'Online',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-2.5 py-2 sm:px-6 sm:py-3 safe-pt">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Bot Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-purple-900/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400 animate-pulse-subtle" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-slate-950 ${status.dot}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                CLAIRVOYANT
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Predictive AI
                </span>
                {modelVersion && (
                  <span className="hidden md:inline text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {modelVersion.replace('CLAIRVOYANT-Cognition ', '').replace('AURA-Cognition ', '')}
                  </span>
                )}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border ${status.color}`}>
                {status.text}
              </span>
              {persona && (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 truncate max-w-[120px] sm:max-w-none">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{persona}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & User Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          {/* Mind Peek Button - Locked until 3 streak or 10 questions */}
          <button
            onClick={onToggleMindPeek}
            title={
              !isUnlocked
                ? "Locked: Unlocks automatically after a 3-prediction streak or 10 questions"
                : showMindPeek
                ? "Hide Mind-Peek HUD"
                : "Open Mind-Peek HUD"
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
              !isUnlocked
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                : showMindPeek
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                : 'bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {!isUnlocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            )}
            <span className="font-mono text-xs">Peek</span>
          </button>

          {/* User Profile (shows username) or "Login / Sign Up" Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-purple-500/50 text-xs transition shadow-sm group"
                title={`Signed in as @${currentUser.username || currentUser.name} (Click for profile & options)`}
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.username || currentUser.name}
                    className="w-5 h-5 rounded-full border border-cyan-400 shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {(currentUser.username || currentUser.name)?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="font-mono text-cyan-300 font-bold max-w-[85px] sm:max-w-[130px] truncate">
                  @{currentUser.username || currentUser.name}
                </span>

                {/* Edit Username icon inside the username pill */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditUsername?.();
                  }}
                  className="p-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-400 hover:text-white transition"
                  title="Edit Username"
                >
                  <Edit2 className="w-3 h-3" />
                </span>

                {userMemory?.total_trials > 0 && (
                  <span className="hidden sm:inline text-[10px] font-mono px-1 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    🧠 {userMemory.total_trials}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl glass-card border border-slate-700/80 shadow-2xl z-50 space-y-2 animate-fade-in text-xs">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center font-bold">
                        {(currentUser.username || currentUser.name)?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-white truncate font-mono text-xs">
                            @{currentUser.username || currentUser.name}
                          </p>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onOpenEditUsername?.();
                            }}
                            className="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-400 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition"
                            title="Edit Username"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email || currentUser.name}</p>
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

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenEditUsername?.();
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-600/25 to-cyan-600/25 hover:from-purple-600/40 hover:to-cyan-600/40 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Username</span>
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenAuth();
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline"
                        >
                          Switch Account
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
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Log In or Sign Up"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Login / Sign Up</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

          {/* Desktop Toolbar Buttons (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={onOpenInstall}
              title="Download & Install CLAIRVOYANT"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600/25 to-cyan-600/25 hover:from-purple-600/40 hover:to-cyan-600/40 text-cyan-300 border border-cyan-500/40 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download</span>
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>

            <button
              onClick={onReset}
              disabled={loading}
              title="Restart Session"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile More Actions Menu (⋮) */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl glass-card border border-slate-700 shadow-2xl z-50 space-y-1 animate-fade-in text-xs">
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onReset();
                    }}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-slate-800/80 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Restart Session</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleMute();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-200 hover:bg-slate-800/80 transition"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{isMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onOpenInstall();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-cyan-300 hover:bg-cyan-950/40 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Install / App</span>
                  </button>
                </div>
              </>
            )}
          </div>
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
              3. CLAIRVOYANT will launch in standalone app mode!
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
