import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, AtSign, Loader2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

export default function EditUsernameModal({
  isOpen,
  currentUsername,
  onClose,
  onUpdateUsername,
}) {
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewUsername(currentUsername || '');
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUsername]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newUsername.trim().toLowerCase();

    if (!trimmed) {
      setError('Please enter a username');
      return;
    }

    if (trimmed === (currentUsername || '').toLowerCase()) {
      onClose();
      return;
    }

    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (trimmed.length > 30) {
      setError('Username cannot exceed 30 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onUpdateUsername(trimmed);
      setSuccess(true);
      soundManager.playSubtleClick();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to update username. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = newUsername.trim().length;
  const isChanged = newUsername.trim().toLowerCase() !== (currentUsername || '').toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-950/50 p-5 sm:p-6 overflow-hidden z-10">
        {/* Glow backdrop decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-600/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <AtSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Edit Username
            </h3>
            <p className="text-xs text-slate-400">
              Personalize your cognitive profile identity
            </p>
          </div>
        </div>

        {/* Current Handle Indicator */}
        {currentUsername && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Current Handle:</span>
            <span className="font-mono text-cyan-300 font-bold">@{currentUsername}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                New Username
              </label>
              <span className={`text-[10px] font-mono ${charCount > 30 ? 'text-rose-400' : 'text-slate-500'}`}>
                {charCount}/30
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold text-sm pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setError('');
                }}
                placeholder="choose_username"
                disabled={isSubmitting}
                autoFocus
                maxLength={30}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <p className="text-[11px] text-slate-500 mt-1.5">
              3 to 30 characters. Use letters, numbers, underscores, or hyphens.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Username updated successfully!</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isChanged || charCount < 3}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Username</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
