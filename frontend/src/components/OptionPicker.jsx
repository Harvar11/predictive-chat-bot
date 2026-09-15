import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, Sparkles } from 'lucide-react';

export default function OptionPicker({
  options = [],
  onSelectOption,
  disabled = false,
  phase = 'quiz',
  currentQuestion = null
}) {
  const [typedInput, setTypedInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const inputRef = useRef(null);

  const inputMode = currentQuestion?.input_mode || (options.length > 0 ? 'both' : 'freeform');
  const placeholder = currentQuestion?.placeholder || 'Type your immediate thought...';
  const isFreeformOnly = options.length === 0 || inputMode === 'freeform';

  // Automatically focus input when in freeform forcing mode
  useEffect(() => {
    if (isFreeformOnly && !disabled) {
      inputRef.current?.focus();
    }
  }, [currentQuestion, isFreeformOnly, disabled]);

  // Reset custom input toggle when question changes
  useEffect(() => {
    setShowCustomInput(false);
  }, [currentQuestion]);

  // Keyboard shortcut listener (1..9) when options are present and not typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (disabled || !options || options.length === 0) return;

      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= options.length) {
        onSelectOption(keyNum - 1, options[keyNum - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, disabled, onSelectOption]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const clean = typedInput.trim();
    if (!clean || disabled) return;

    onSelectOption(null, clean);
    setTypedInput('');
    setShowCustomInput(false);
  };

  const hasOptions = options && options.length > 0;

  return (
    <div className="sticky bottom-0 z-20 w-full glass-panel border-t border-slate-800/80 px-2.5 py-2 sm:px-4 sm:py-3 safe-pb touch-pan-y">
      <div className="max-w-3xl mx-auto space-y-1.5 sm:space-y-2.5">
        
        {/* Desktop Helper / Header (Hidden on mobile to save vertical space) */}
        <div className="hidden sm:flex items-center justify-between px-0.5">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 truncate">
            {isFreeformOnly ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-cyan-300 font-semibold">Subconscious Thought Experiment:</span>
                <span>Type your answer below</span>
              </>
            ) : phase === 'profiling' ? (
              'Choose an option or type your own response:'
            ) : (
              'Select an option or type your immediate reaction:'
            )}
          </span>

          {hasOptions && (
            <span className="text-[11px] font-mono text-slate-500 shrink-0">
              Keys: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">{options.length}</kbd>
            </span>
          )}
        </div>

        {/* Option Chips (If question provides options) */}
        {hasOptions && (
          <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOption(idx, opt)}
                disabled={disabled}
                className={`group relative flex items-center justify-between text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all duration-150 min-h-[44px] touch-pan-y active:scale-[0.98] ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed bg-slate-900/60 border-slate-800 text-slate-500'
                    : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800/90 hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-800 border border-slate-700 text-[11px] sm:text-xs font-mono font-bold text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300 shrink-0 transition">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white break-words whitespace-normal leading-snug">
                    {opt}
                  </span>
                </div>

                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-slate-500 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom text input toggle for mobile (when options exist) */}
        {hasOptions && !isFreeformOnly && (
          <div className="sm:hidden text-center pt-0.5">
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] text-slate-500 hover:text-cyan-400 transition"
            >
              {showCustomInput ? 'Hide text input' : 'or type custom response'}
            </button>
          </div>
        )}

        {/* Freeform Text Input Box: Always visible when isFreeformOnly; hidden on mobile when options exist unless toggled */}
        {(isFreeformOnly || showCustomInput) && (
          <form onSubmit={handleTextSubmit} className="relative flex items-center gap-1.5 sm:gap-2 pt-0.5">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setTypedInput('');
                }}
                onFocus={() => {
                  setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
                }}
                disabled={disabled}
                placeholder={isFreeformOnly ? placeholder : 'Or type your own response...'}
                className={`w-full bg-slate-950/90 border rounded-xl sm:rounded-2xl pl-3.5 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition shadow-inner ${
                  isFreeformOnly
                    ? 'border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 shadow-cyan-950/30'
                    : 'border-slate-800 focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50'
                }`}
              />
              {typedInput && (
                <button
                  type="button"
                  onClick={() => setTypedInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 text-xs rounded-full hover:bg-slate-800 transition"
                  title="Clear text"
                >
                  &times;
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled || !typedInput.trim()}
              className={`flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition active:scale-95 shrink-0 shadow-lg ${
                isFreeformOnly
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-950/50'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>{isFreeformOnly ? 'Submit' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* On desktop: show the text input form under options */}
        {hasOptions && !isFreeformOnly && !showCustomInput && (
          <div className="hidden sm:block">
            <form onSubmit={handleTextSubmit} className="relative flex items-center gap-2 pt-0.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setTypedInput('');
                  }}
                  disabled={disabled}
                  placeholder="Or type your own response..."
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition shadow-inner"
                />
                {typedInput && (
                  <button
                    type="button"
                    onClick={() => setTypedInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 text-xs rounded-full hover:bg-slate-800 transition"
                    title="Clear text"
                  >
                    &times;
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={disabled || !typedInput.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition active:scale-95 shrink-0 bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
