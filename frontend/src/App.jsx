import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import ChatHeader from './components/ChatHeader';
import ChatFeed from './components/ChatFeed';
import OptionPicker from './components/OptionPicker';
import MindPeekHUD from './components/MindPeekHUD';
import { soundManager } from './utils/sound';
import {
  apiStartSession,
  apiSubmitAnswer,
  apiGetDebugState,
} from './services/api';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [phase, setPhase] = useState('profiling');
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Mind-Peek telemetry unlock state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showMindPeek, setShowMindPeek] = useState(false);
  
  const [debugState, setDebugState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize or restart session
  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setIsThinking(true);
      setIsUnlocked(false);
      setShowMindPeek(false);
      setPersona(null);

      const res = await apiStartSession(10, 3);
      setSessionId(res.session_id);
      setPhase(res.phase);

      const introMsg = {
        id: 'intro',
        role: 'bot',
        text: "Greetings. I am AURA, an advanced cognitive prediction system.\n\nI will guide your spontaneous thoughts using subconscious psychological forces and cognitive priming constraints. Before you type each answer, I will pre-lock my prediction with a cryptographic seal.\n\nFirst, 3 quick calibration anchors to tune into your neural baseline. Let's begin.",
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
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Sync debug state
  const refreshDebug = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const res = await apiGetDebugState(sid);
      setDebugState(res.debug_state);
    } catch (e) {}
  }, []);

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
      // Submit answer to backend
      const res = await apiSubmitAnswer(sessionId, choiceIndex, choiceText);

      soundManager.playTurnProgress();
      setPhase(res.phase);

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

      // Predictions are kept silent in chat and delivered exclusively to Mind-Peek HUD
      // No turn-by-turn prediction cards are posted to chat feed

      // Check if reveal milestone was triggered (3 streak or 10 questions)
      // Mind-Peek is unlocked, but does NOT pop up automatically (user opens when desired)
      if (res.is_reveal && res.reveal_data) {
        setIsUnlocked(true);
        // setShowMindPeek(false) - remains closed until user clicks

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
    <div className="flex flex-col h-screen max-h-screen bg-[#070a12] text-slate-100 overflow-hidden font-sans">
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
          <div className="fixed inset-y-0 right-0 z-40 lg:relative lg:inset-auto flex">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMindPeek(false)}
            />
            <div className="relative z-10 h-full flex">
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
    </div>
  );
}
