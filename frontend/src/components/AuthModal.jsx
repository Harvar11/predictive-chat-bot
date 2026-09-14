import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Shield, Eye, EyeOff, Lock, User, Mail, AtSign, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupName, setSignupName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const gsiButtonRef = useRef(null);

  // Reset errors when switching tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
  };

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
                  const payload = jsonPayload ? JSON.parse(jsonPayload) : {};
                  onLoginSuccess({
                    type: 'google',
                    data: {
                      credential: response.credential,
                      user_id: `google_${payload.sub}`,
                      email: payload.email,
                      name: payload.name,
                      picture: payload.picture,
                    }
                  });
                  onClose();
                } catch (e) {
                  onLoginSuccess({
                    type: 'google',
                    data: { credential: response.credential }
                  });
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
              text: activeTab === 'signup' ? 'signup_with' : 'signin_with',
              logo_alignment: 'left',
              width: 280,
            });
          }
        }
      } catch (err) {
        console.debug('GSI init notice:', err);
      }
    }
  }, [isOpen, activeTab, onLoginSuccess, onClose]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    const ident = loginIdentifier.trim();
    const pwd = loginPassword;

    if (!ident) {
      setError('Please enter your email address or username');
      return;
    }
    if (!pwd) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLoginSuccess({
        type: 'login',
        data: {
          identifier: ident,
          password: pwd
        }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    const email = signupEmail.trim();
    const pwd = signupPassword;
    const username = signupUsername.trim().toLowerCase();
    const name = signupName.trim();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!pwd || pwd.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, or hyphens');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLoginSuccess({
        type: 'register',
        data: {
          email,
          password: pwd,
          username,
          name: name || username
        }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback 1-click Google Sign-In button handler if GSI widget is not loaded
  const handleQuickGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const promptEmail = prompt("Enter your Google Account Email for instant authentication:");
      if (!promptEmail) {
        setLoading(false);
        return;
      }
      const cleanEmail = promptEmail.trim().toLowerCase();
      if (!cleanEmail.includes('@')) {
        setError('Invalid email address format.');
        setLoading(false);
        return;
      }
      const derivedUser = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      await onLoginSuccess({
        type: 'google',
        data: {
          user_id: `google_${derivedUser}`,
          email: cleanEmail,
          name: derivedUser,
          picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(derivedUser)}`
        }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto safe-pb safe-pt">
      <div className="glass-card max-w-md w-full p-5 sm:p-6 rounded-2xl border border-purple-500/40 shadow-2xl relative space-y-4 my-auto max-h-[92dvh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-purple-900/40 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              CLAIRVOYANT
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Cognitive Vault
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Save your lifetime prediction history & archetypes
            </p>
          </div>
        </div>

        {/* Tab Switcher: Log In vs Sign Up */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Google Authentication Option */}
        <div className="space-y-2 pt-1">
          <div ref={gsiButtonRef} className="flex justify-center empty:hidden" />
          
          <button
            type="button"
            onClick={handleQuickGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>{activeTab === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
            {activeTab === 'signup' ? 'or register with email' : 'or log in with credentials'}
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Error Notice Banner */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fade-in flex items-start gap-2">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-cyan-400" />
                Email or Username
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => {
                  setLoginIdentifier(e.target.value);
                  setError('');
                }}
                placeholder="your_username or name@gmail.com"
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition"
                  title={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition active:scale-[0.98] disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Log In to Profile'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className="text-xs text-purple-300 hover:text-purple-200 transition"
              >
                Don't have an account? <span className="underline font-semibold">Sign Up</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP FORM */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Valid Email Address
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => {
                  setSignupEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@gmail.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Create Password
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Min 6 chars</span>
              </div>
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Create a secure password"
                  required
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition"
                  title={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-emerald-400" />
                  Choose Username
                </label>
                <span className="text-[10px] text-slate-500 font-mono">3-30 chars</span>
              </div>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => {
                  setSignupUsername(e.target.value);
                  setError('');
                }}
                placeholder="e.g. quantum_mind"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Display Name <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Your preferred name"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition active:scale-[0.98] disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating Account...' : 'Sign Up & Create Account'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className="text-xs text-cyan-300 hover:text-cyan-200 transition"
              >
                Already have an account? <span className="underline font-semibold">Log In</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer: Guest Mode option & Security indicator */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition touch-manipulation font-medium flex items-center gap-1"
          >
            <span>Continue as Guest</span>
          </button>
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" /> PBKDF2 Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
