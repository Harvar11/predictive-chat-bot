import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Shield, Eye, EyeOff, Lock } from 'lucide-react';

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const gsiButtonRef = useRef(null);

  // Initialize official Google Identity Services (GSI) if available
  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id) {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response?.credential) {
                try {
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                    atob(base64)
                      .split('')
                      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                      .join('')
                  );
                  const payload = JSON.parse(jsonPayload);
                  onLoginSuccess({
                    credential: response.credential,
                    user_id: `google_${payload.sub}`,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                  });
                  onClose();
                } catch (e) {
                  onLoginSuccess({ credential: response.credential });
                  onClose();
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (gsiButtonRef.current) {
            window.google.accounts.id.renderButton(gsiButtonRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 300,
            });
          }

          window.google.accounts.id.prompt();
        }
      } catch (err) {
        console.debug('GSI init notice:', err);
      }
    }
  }, [isOpen, onLoginSuccess, onClose]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address (e.g., name@gmail.com)');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const derivedName = name.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const authData = {
        user_id: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        name: derivedName,
        password: password,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`
      };
      await onLoginSuccess(authData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto safe-pb safe-pt">
      <div className="glass-card max-w-md w-full p-5 sm:p-6 rounded-2xl border border-purple-500/40 shadow-2xl relative space-y-4 my-auto max-h-[90dvh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-md shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              Secure Sign In
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">
              to continue to <span className="text-purple-300 font-semibold">CLAIRVOYANT</span>
            </p>
          </div>
        </div>

        {/* Official Google GSI Button Mount */}
        <div ref={gsiButtonRef} className="flex justify-center empty:hidden" />

        {/* Secure Sign-In Form with Password */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Google Email or Account
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="name@gmail.com"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-cyan-400" />
                Password
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Min 6 characters</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Display Name <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition active:scale-[0.98] disabled:opacity-50 touch-manipulation"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In / Secure Profile'}</span>
          </button>
        </form>

        {/* Guest fallback button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition touch-manipulation"
          >
            Continue as Guest (No Sign-In)
          </button>
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> PBKDF2 Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
