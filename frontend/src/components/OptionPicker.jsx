import React, { useState, useEffect } from 'react';
import { ArrowRight, Send } from 'lucide-react';

export default function OptionPicker({
  options = [],
  onSelectOption,
  disabled = false,
  phase = 'quiz'
}) {
  const [typedInput, setTypedInput] = useState('');

  // Keyboard shortcut listener (1..9) when not typing in the text input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is actively typing in an input element
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (disabled) return;

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

  if (!options || options.length === 0) return null;

  return (
    <div className="w-full glass-panel border-t border-slate-800/80 p-3 sm:p-4 space-y-3">
      <div className="max-w-3xl mx-auto space-y-3">
        
        {/* Header / Instructions */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-slate-400">
            {phase === 'profiling' ? 'Pick an option or type your response:' : 'Choose an option or type your natural reaction:'}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
            Quick keys: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">{options.length}</kbd>
          </span>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx, opt)}
              disabled={disabled}
              className={`group relative flex items-center justify-between text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-150 min-h-[48px] ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-slate-900/60 border-slate-800 text-slate-500'
                  : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-950/30 active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-300 group-hover:border-purple-400 group-hover:text-purple-300 shrink-0 transition">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white truncate">
                  {opt}
                </span>
              </div>

              <div className="w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-purple-500/20 text-purple-300">
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Freeform Text Input Box */}
        <form onSubmit={handleTextSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              disabled={disabled}
              placeholder="Type your answer here (keep it short and precise)..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-purple-500/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition pr-10 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={disabled || !typedInput.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs sm:text-sm shadow-md shadow-purple-950/50 transition active:scale-95 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
