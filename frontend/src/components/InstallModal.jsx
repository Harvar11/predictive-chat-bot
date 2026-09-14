import React, { useState } from 'react';
import { X, Download, Monitor, Smartphone, Apple, CheckCircle2, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

export default function InstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onPromptInstall
}) {
  if (!isOpen) return null;

  const [platform, setPlatform] = useState(() => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  });

  const handleDownloadBat = () => {
    const targetUrl = window.location.origin.includes('localhost') ? window.location.origin : 'https://clairvoyant-bj7z.onrender.com';
    const batContent = `@echo off
title CLAIRVOYANT Desktop App
echo Starting CLAIRVOYANT in Standalone App Window...
start "" "chrome.exe" --app="${targetUrl}" || start "" "msedge.exe" --app="${targetUrl}" || start "" "${targetUrl}"
exit
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Launch_CLAIRVOYANT.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-lg w-full p-5 sm:p-6 rounded-2xl border border-cyan-500/40 shadow-2xl relative space-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-cyan-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-400 animate-bounce" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              Download CLAIRVOYANT
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Install as a standalone application on Desktop, Android, or iOS.
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800 text-xs font-medium gap-1">
          <button
            onClick={() => setPlatform('desktop')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              platform === 'desktop'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>

          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              platform === 'android'
                ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              platform === 'ios'
                ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Content by Platform */}
        {platform === 'desktop' && (
          <div className="space-y-3 text-xs text-slate-300 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  Option 1: 1-Click Native Desktop App
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Installs directly into Windows / macOS as a standalone desktop window without browser bars.
              </p>

              {deferredPrompt ? (
                <button
                  onClick={onPromptInstall}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Install CLAIRVOYANT Desktop App Now
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                  <p className="text-cyan-300 font-medium">To install in Chrome / Edge:</p>
                  <p className="text-[11px] text-slate-400">
                    Click the <strong>Install icon (⊕ / ⊞)</strong> in the right corner of your browser's address bar, then click <strong>Install</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-purple-400" />
                Option 2: Windows Desktop Launcher (.bat)
              </span>
              <p className="text-slate-400 leading-relaxed">
                Download a lightweight 1-click Windows launcher shortcut that opens CLAIRVOYANT in isolated app mode.
              </p>
              <button
                onClick={handleDownloadBat}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                Download Launch_CLAIRVOYANT.bat
              </button>
            </div>
          </div>
        )}

        {platform === 'android' && (
          <div className="space-y-3 text-xs text-slate-300 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  Android Home Screen Install
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  INSTANT
                </span>
              </div>

              {deferredPrompt ? (
                <button
                  onClick={onPromptInstall}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Add CLAIRVOYANT to Home Screen
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <p className="text-[11px] text-slate-300">Tap the <strong>three dots (⋮)</strong> menu in the top right of Chrome.</p>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <p className="text-[11px] text-slate-300">Tap <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <p className="text-[11px] text-slate-300">CLAIRVOYANT will install with a native app icon and full-screen display!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {platform === 'ios' && (
          <div className="space-y-3 text-xs text-slate-300 animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-indigo-400" />
                iOS (iPhone & iPad Safari)
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Apple Safari enables full PWA standalone mode with zero app store installation:
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <p className="text-[11px] text-slate-300">
                    Tap the <strong>Share</strong> button (<strong>⎋</strong> box with arrow) at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <p className="text-[11px] text-slate-300">
                    Scroll down and tap <strong>'Add to Home Screen'</strong> (<strong>⊞</strong> icon).
                  </p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <p className="text-[11px] text-slate-300">
                    Tap <strong>Add</strong> in the top right. CLAIRVOYANT launches in borderless full-screen mode!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fast, offline cached & zero ads</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
