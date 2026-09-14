import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, Sparkles, Lock } from 'lucide-react';

export default function OptionPicker({
  options = [],
  onSelectOption,
  disabled = false,
  phase = 'quiz',
  currentQuestion = null
}) {
  const [typedInput, setTypedInput] = useState('');
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
  };

  return (
    <div className="w-full glass-panel border-t border-slate-800/80 px-3 py-2.5 sm:px-4 sm:py-3.5 space-y-2 safe-pb">
      <div className="max-w-3xl mx-auto space-y-2 sm:space-y-2.5">
        
        {/* Header / Context Instructions */}
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] sm:text-xs font-medium text-slate-400 flex items-center gap-1.5 truncate">
            {isFreeformOnly ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-cyan-300 font-semibold">Subconscious Thought Experiment:</span>
                <span className="hidden xs:inline">Type your answer below</span>
              </>
            ) : phase === 'profiling' ? (
              'Choose an option or type your own response:'
            ) : (
              'Select an option or type your immediate reaction:'
            )}
          </span>

          {options && options.length > 0 && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 shrink-0">
              Keys: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">{options.length}</kbd>
            </span>
          )}
        </div>

        {/* Option Chips (If question provides options) */}
        {options && options.length > 0 && (
          <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-2">
            {options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectOption(idx, opt)}
                disabled={disabled}
                className={`group relative flex items-center justify-between text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-150 min-h-[46px] touch-manipulation active:scale-[0.98] ${
                  disabled
                    ? 'opacity-50 cursor-not-allowed bg-slate-900/60 border-slate-800 text-slate-500'
                    : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300 shrink-0 transition">
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

        {/* Freeform Text Input Box */}
        <form onSubmit={handleTextSubmit} className="relative flex items-center gap-2 pt-0.5">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onFocus={() => {
                setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
              }}
              disabled={disabled}
              placeholder={isFreeformOnly ? placeholder : 'Or type your own response...'}
              className={`w-full bg-slate-950/90 border rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition shadow-inner ${
                isFreeformOnly
                  ? 'border-cyan-500/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 shadow-cyan-950/30'
                  : 'border-slate-800 focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !typedInput.trim()}
            className={`flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition active:scale-95 shrink-0 shadow-lg ${
              isFreeformOnly
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-950/50'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span>{isFreeformOnly ? 'Submit' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
