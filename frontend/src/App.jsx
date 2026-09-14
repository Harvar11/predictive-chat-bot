import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import ChatHeader from './components/ChatHeader';
import ChatFeed from './components/ChatFeed';
import OptionPicker from './components/OptionPicker';
import MindPeekHUD from './components/MindPeekHUD';
import GoogleAuthModal from './components/GoogleAuthModal';
import InstallModal from './components/InstallModal';
import { soundManager } from './utils/sound';
import {
  apiStartSession,
  apiSubmitAnswer,
  apiGetDebugState,
  apiGoogleAuth,
  apiGetUserMemory,
  apiGetModelEvolution
} from './services/api';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [phase, setPhase] = useState('profiling');
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // User Authentication & Persistent Memory
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clairvoyant_user') || localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userMemory, setUserMemory] = useState(null);
  const [modelVersion, setModelVersion] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Mind-Peek telemetry unlock state (unlocked by default, closed until user opens it)
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [showMindPeek, setShowMindPeek] = useState(false);
  const [debugState, setDebugState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Native Android Hardware Back Gesture & PopState Interception
  useEffect(() => {
    const isAnyModalOpen = showMindPeek || showAuthModal || showInstallModal;
    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
    }
    const handlePopState = () => {
      if (showMindPeek) setShowMindPeek(false);
      if (showAuthModal) setShowAuthModal(false);
      if (showInstallModal) setShowInstallModal(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showMindPeek, showAuthModal, showInstallModal]);

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallModal(false);
      }
    }
  };

  // Helper to get persistent User ID (Google account or persistent device guest)
  const getUserId = useCallback(() => {
    if (currentUser?.user_id) return currentUser.user_id;
    try {
      let guestId = localStorage.getItem('clairvoyant_guest_id') || localStorage.getItem('aura_guest_id');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('clairvoyant_guest_id', guestId);
        localStorage.setItem('aura_guest_id', guestId);
      }
      return guestId;
    } catch {
      return 'guest_' + Math.random().toString(36).substring(2, 10);
    }
  }, [currentUser]);

  // Initialize or restart session
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setIsThinking(true);
      setIsUnlocked(true);
      setShowMindPeek(false);
      setPersona(null);

      const uid = getUserId();
      const res = await apiStartSession(10, 3, uid);
      setSessionId(res.session_id);
      setPhase(res.phase);

      if (res.user_memory) setUserMemory(res.user_memory);
      if (res.model_version) setModelVersion(res.model_version);

      const introMsg = {
        id: 'intro',
        role: 'bot',
        text: res.message || `Greetings. I am CLAIRVOYANT, an advanced cognitive prediction system.

I will guide your spontaneous thoughts using subconscious psychological forces and cognitive priming constraints. Before you type each answer, I will pre-lock my prediction with a cryptographic seal.

First, 3 quick calibration anchors to tune into your neural baseline. Let's begin.`,
      };

      const q = res.question;
      const qMsg = q ? {
        id: `q-${q.question_id}`,
        role: 'bot',
        category: q.category,
        stepBadge: `Calibration ${q.step_number}/${q.total_steps || 3}`,
        text: q.question,
        sealedHash: q.sealed_hash,
      } : null;

      setMessages(qMsg ? [introMsg, qMsg] : [introMsg]);
      setCurrentQuestion(q);

      try {
        const dbg = await apiGetDebugState(res.session_id);
        setDebugState(dbg.debug_state);
      } catch (e) {}

    } catch (err) {
      console.error('Failed to init session:', err);
      setMessages([
        {
          id: 'err',
          role: 'system',
          text: 'Failed to connect to backend server. Make sure the FastAPI server is running on port 8088.'
        }
      ]);
    } finally {
      setIsThinking(false);
      setLoading(false);
    }
  }, [getUserId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Sync debug state
  const refreshDebug = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const res = await apiGetDebugState(sid);
      setDebugState(res.debug_state);
      if (res.debug_state?.model_evolution?.version) {
        setModelVersion(res.debug_state.model_evolution.version);
      }
      if (res.debug_state?.user_memory) {
        setUserMemory(res.debug_state.user_memory);
      }
    } catch (e) {}
  }, []);

  // Handle Google Auth Login
  const handleLoginSuccess = async (authData) => {
    try {
      const profile = await apiGoogleAuth(authData);
      setCurrentUser(profile);
      try {
        localStorage.setItem('clairvoyant_user', JSON.stringify(profile));
        localStorage.setItem('aura_user', JSON.stringify(profile));
      } catch {}
      setUserMemory(profile);

      soundManager.playRevealFanfare();

      const syncMsg = {
        id: `auth-${Date.now()}`,
        role: 'system',
        text: `🔐 Synchronized profile: ${profile.name}. Recalling ${profile.total_trials} lifetime trials (${profile.accuracy_percent}% accuracy).`,
      };
      setMessages((prev) => [...prev, syncMsg]);

      if (sessionId) {
        await refreshDebug(sessionId);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('clairvoyant_user');
      localStorage.removeItem('aura_user');
    } catch {}
    setCurrentUser(null);
    setUserMemory(null);
    initSession();
  };

  // Handle user selecting an option or typing freeform text
  const handleSelectOption = async (choiceIndex, choiceText) => {
    if (!sessionId || !currentQuestion || isThinking) return;

    soundManager.playTap();

    // Add user response bubble to feed
    const userMsg = {
      id: `ans-${Date.now()}`,
      role: 'user',
      text: choiceText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Submit answer to backend with persistent user_id
      const uid = getUserId();
      const res = await apiSubmitAnswer(sessionId, choiceIndex, choiceText, uid);

      soundManager.playTurnProgress();
      setPhase(res.phase);

      if (res.model_version) setModelVersion(res.model_version);
      if (res.user_memory) setUserMemory(res.user_memory);

      // Handle transition from calibration to cognitive forcing
      if (res.status === 'profiling_completed') {
        if (res.persona) setPersona(res.persona);
        const sysMsg = {
          id: `sys-${Date.now()}`,
          role: 'system',
          text: `🧠 Neural baseline calibrated. Persona: ${res.persona || 'Adaptive'}. Commencing Subconscious Forcing Trials.`,
        };
        setMessages((prev) => [...prev, sysMsg]);
      }

      // Check if neural model upgrade event occurred
      if (res.evolution_event?.new_synonym_learned) {
        soundManager.playTap();
      }

      // Check if reveal milestone was triggered (3 streak or 10 questions)
      if (res.is_reveal && res.reveal_data) {
        setIsUnlocked(true);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#38bdf8']
          });
        } catch (e) {}

        soundManager.playRevealFanfare();

        const revealMsg = {
          id: `reveal-${Date.now()}`,
          role: 'reveal',
          data: res.reveal_data,
        };
        setMessages((prev) => [...prev, revealMsg]);
      }

      // Advance to next question
      if (res.next_question) {
        const nextQ = res.next_question;
        setCurrentQuestion(nextQ);

        const badge = nextQ.phase === 'profiling'
          ? `Calibration ${nextQ.step_number}/${nextQ.total_steps || 3}`
          : `Forcing Trial #${nextQ.step_number}`;

        const nextMsg = {
          id: `q-${nextQ.question_id}-${Date.now()}`,
          role: 'bot',
          category: nextQ.category,
          stepBadge: badge,
          cognitiveBranch: nextQ.cognitive_branch,
          text: nextQ.question,
          sealedHash: nextQ.sealed_hash,
        };

        setMessages((prev) => [...prev, nextMsg]);
      } else {
        setCurrentQuestion(null);
      }

      await refreshDebug(sessionId);

    } catch (err) {
      console.error('Answer submission failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'system',
          text: 'Error transmitting response to neural engine. Please retry.'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMindPeek = () => {
    if (!isUnlocked) return;
    setShowMindPeek((prev) => {
      const next = !prev;
      if (next && sessionId) {
        refreshDebug(sessionId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen h-screen h-[100dvh] max-h-screen max-h-[100dvh] bg-[#070a12] text-slate-100 overflow-hidden font-sans overscroll-contain safe-pt">
      {/* Header */}
      <ChatHeader
        phase={phase}
        persona={persona}
        showMindPeek={showMindPeek}
        onToggleMindPeek={handleToggleMindPeek}
        isUnlocked={isUnlocked}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReset={initSession}
        loading={loading}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        userMemory={userMemory}
        modelVersion={modelVersion}
        onOpenInstall={() => setShowInstallModal(true)}
      />

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto relative">
        {/* Chat Feed */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <ChatFeed
            messages={messages}
            isThinking={isThinking}
            onOpenMindPeek={() => setShowMindPeek(true)}
          />

          {/* Option Picker & Freeform Forcing Input */}
          <OptionPicker
            options={currentQuestion?.options || []}
            onSelectOption={handleSelectOption}
            disabled={isThinking || !currentQuestion}
            phase={phase}
            currentQuestion={currentQuestion}
          />
        </div>

        {/* Mind-Peek Telemetry HUD */}
        {showMindPeek && isUnlocked && (
          <div className="fixed inset-0 z-40 flex flex-col justify-end lg:relative lg:inset-auto lg:flex-row animate-fade-in">
            <div
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm lg:hidden transition-opacity"
              onClick={() => setShowMindPeek(false)}
            />
            <div className="relative z-10 w-full lg:w-auto flex">
              <MindPeekHUD
                debugState={debugState}
                isOpen={showMindPeek}
                onClose={() => setShowMindPeek(false)}
                phase={phase}
              />
            </div>
          </div>
        )}
      </main>

      {/* Google Sign-In Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Download & Install Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onPromptInstall={handlePromptInstall}
      />
    </div>
  );
}
