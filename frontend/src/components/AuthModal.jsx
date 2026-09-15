import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  AtSign, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  Check, 
  Users, 
  LogOut, 
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { 
  getDeviceAccounts, 
  saveDeviceAccount, 
  removeDeviceAccount, 
  clearAllDeviceAccounts 
} from '../utils/accountManager';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  initialMode = 'login', // 'login' | 'signup' | 'switch_account' | 'google_chooser'
  onSwitchAccount,
  onOpenEditUsername,
  onLogout
}) {
  if (!isOpen) return null;

  // View state: 'login' | 'signup' | 'switch_account' | 'google_chooser'
  const [view, setView] = useState(() => {
    if (initialMode === 'switch_account') return 'switch_account';
    if (initialMode === 'signup') return 'signup';
    if (initialMode === 'google_chooser') return 'google_chooser';
    return 'login';
  });

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupName, setSignupName] = useState('');

  // Google Sign-In state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);

  // Saved device accounts (reactive state)
  const [savedAccounts, setSavedAccounts] = useState(() => getDeviceAccounts());

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const gsiButtonRef = useRef(null);

  // Refresh saved accounts whenever view opens or changes
  useEffect(() => {
    setSavedAccounts(getDeviceAccounts());
  }, [isOpen, view]);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'switch_account') {
        setView('switch_account');
      } else if (initialMode === 'signup') {
        setView('signup');
      } else if (initialMode === 'google_chooser') {
        setView('google_chooser');
      } else {
        setView('login');
      }
      setError('');
    }
  }, [isOpen, initialMode]);

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
                  const authObj = {
                    credential: response.credential,
                    user_id: `google_${payload.sub}`,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    auth_type: 'google'
                  };
                  saveDeviceAccount(authObj);
                  onLoginSuccess({
                    type: 'google',
                    data: authObj
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
              text: 'continue_with',
              logo_alignment: 'left',
              width: 300,
            });
          }
        }
      } catch (err) {
        console.debug('GSI notice:', err);
      }
    }
  }, [isOpen, view, onLoginSuccess, onClose]);

  // Handle Switch View
  const handleSwitchView = (newView) => {
    setView(newView);
    setError('');
  };

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
      const profile = await onLoginSuccess({
        type: 'login',
        data: {
          identifier: ident,
          password: pwd
        }
      });
      if (profile && rememberMe) {
        saveDeviceAccount({ ...profile, auth_type: 'password' });
      }
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
      const profile = await onLoginSuccess({
        type: 'register',
        data: {
          email,
          password: pwd,
          username,
          name: name || username
        }
      });
      if (profile) {
        saveDeviceAccount({ ...profile, auth_type: 'password' });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Sign-In or open Google Chooser
  const handleTriggerGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {}
    }
    setView('google_chooser');
    setError('');
  };

  // Select account from Google Chooser (1-click login)
  const handleSelectGoogleAccount = async (account) => {
    setLoading(true);
    setError('');
    try {
      const authData = {
        user_id: account.user_id || `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: account.email,
        name: account.name,
        picture: account.avatar_url || account.picture,
        auth_type: 'google'
      };
      const profile = await onLoginSuccess({
        type: 'google',
        data: authData
      });
      saveDeviceAccount(profile || authData);
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit manual Google account
  const handleManualGoogleSubmit = async (e) => {
    e?.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Google email address (e.g. name@gmail.com)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const derivedUser = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const derivedName = googleName.trim() || derivedUser.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const authData = {
        user_id: `google_${derivedUser}`,
        email: cleanEmail,
        name: derivedName,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        auth_type: 'google'
      };
      const profile = await onLoginSuccess({
        type: 'google',
        data: authData
      });
      saveDeviceAccount(profile || authData);
      onClose();
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Instant Account Switch (Spotify 1-Click Multi-Account Switcher)
  const handleSwitchToAccount = async (account) => {
    if (account.user_id === currentUser?.user_id) {
      // Already active account
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (onSwitchAccount) {
        await onSwitchAccount(account);
      } else {
        // Fallback: trigger standard login success with cached profile
        await onLoginSuccess({
          type: account.auth_type || 'google',
          data: account
        });
      }
      saveDeviceAccount(account);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not switch to this account.');
    } finally {
      setLoading(false);
    }
  };

  // Remove single account from device
  const handleRemoveAccount = (e, userIdOrEmail) => {
    e.stopPropagation();
    const updated = removeDeviceAccount(userIdOrEmail);
    setSavedAccounts(updated);
  };

  // Clear all accounts from device
  const handleClearAll = () => {
    if (window.confirm('Sign out and remove all saved accounts from this device?')) {
      clearAllDeviceAccounts();
      setSavedAccounts([]);
      onLogout?.();
      onClose();
    }
  };

  // Filter Google accounts for Google Chooser
  const googleAccounts = savedAccounts.filter(
    (a) => a.auth_type === 'google' || a.user_id?.startsWith('google_') || a.email?.includes('@gmail.com')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto safe-pb safe-pt">
      <div className="w-full max-w-md bg-[#121212] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5 my-auto max-h-[92dvh] overflow-y-auto text-slate-200">
        
        {/* Top Bar: Back & Close */}
        <div className="flex items-center justify-between pb-1">
          {view !== 'login' && view !== 'switch_account' ? (
            <button
              onClick={() => handleSwitchView('login')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : view === 'switch_account' && currentUser ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Signed In</span>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-purple-900/40 mx-auto">
            <div className="w-full h-full bg-[#121212] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {view === 'login' && 'Log in to CLAIRVOYANT'}
            {view === 'signup' && 'Sign up for CLAIRVOYANT'}
            {view === 'google_chooser' && 'Google Sign-In'}
            {view === 'switch_account' && 'Switch Account'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {view === 'login' && 'Subconscious predictive cognition & psychological forces'}
            {view === 'signup' && 'Unlock lifetime mind-peek telemetry & cognitive archetypes'}
            {view === 'google_chooser' && 'Choose an account to continue to CLAIRVOYANT'}
            {view === 'switch_account' && 'Select an account to switch to, or add a new profile'}
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <span className="text-sm shrink-0">⚠️</span>
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: SPOTIFY LOG IN                                       */}
        {/* ============================================================ */}
        {view === 'login' && (
          <div className="space-y-4 animate-fade-in">
            {/* Spotify-Style Prominent "Continue with Google" Button */}
            <button
              type="button"
              onClick={handleTriggerGoogle}
              className="w-full py-3 px-4 rounded-full border border-slate-700 hover:border-slate-500 bg-transparent hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* If Google accounts are remembered, show fast 1-click switcher pill */}
            {savedAccounts.length > 0 && (
              <button
                type="button"
                onClick={() => handleSwitchView('switch_account')}
                className="w-full py-2.5 px-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-xs font-semibold text-purple-300 hover:text-white flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Switch saved account on this device</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-900 text-cyan-300 font-mono text-[10px]">
                  {savedAccounts.length}
                </span>
              </button>
            )}

            {/* Spotify Divider: or */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#121212] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                or
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Email / Username + Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-white block mb-1.5">
                  Email or username
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setError('');
                  }}
                  placeholder="Email or username"
                  required
                  className="w-full px-3.5 py-3 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Password"
                    required
                    className="w-full px-3.5 py-3 pr-10 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#242424] border-slate-600 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Spotify Bold Action Pill Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-950/30 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Logging in...' : 'Log In'}</span>
              </button>
            </form>

            {/* Bottom Switch to Sign Up */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchView('signup')}
                  className="font-bold text-white hover:text-cyan-300 underline underline-offset-4 ml-1 transition"
                >
                  Sign up for CLAIRVOYANT
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SPOTIFY SIGN UP                                      */}
        {/* ============================================================ */}
        {view === 'signup' && (
          <div className="space-y-4 animate-fade-in">
            {/* "Continue with Google" Button */}
            <button
              type="button"
              onClick={handleTriggerGoogle}
              className="w-full py-3 px-4 rounded-full border border-slate-700 hover:border-slate-500 bg-transparent hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#121212] px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                or
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  What's your email?
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-white">Create a password</label>
                  <span className="text-[10px] text-slate-400 font-mono">Min 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Create a password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Choose your unique username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={signupUsername}
                    onChange={(e) => {
                      setSignupUsername(e.target.value);
                      setError('');
                    }}
                    placeholder="voyager_42"
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  What should we call you? <span className="text-slate-500 font-normal">(Display Name)</span>
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your preferred name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                />
              </div>

              {/* Sign Up Action Pill Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 mt-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition transform active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-purple-950/30 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              </button>
            </form>

            {/* Bottom Switch to Log In */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="font-bold text-white hover:text-cyan-300 underline underline-offset-4 ml-1 transition"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: GOOGLE ACCOUNT CHOOSER (SPOTIFY & GITHUB STANDARD)   */}
        {/* ============================================================ */}
        {view === 'google_chooser' && (
          <div className="space-y-4 animate-fade-in">
            {/* Google Header */}
            <div className="p-4 rounded-2xl bg-[#1e1e1e] border border-slate-800 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-md">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Choose an account</h3>
              <p className="text-xs text-slate-400">
                to continue to <span className="text-purple-300 font-semibold">CLAIRVOYANT</span>
              </p>
            </div>

            {/* Official GSI Button mount if client ID active */}
            <div ref={gsiButtonRef} className="flex justify-center empty:hidden" />

            {/* Saved Google Accounts */}
            {googleAccounts.length > 0 && !showAddGoogleAccount ? (
              <div className="space-y-2">
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {googleAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      role="button"
                      tabIndex={0}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#242424] hover:bg-[#2e2e2e] border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {acc.avatar_url ? (
                          <img
                            src={acc.avatar_url}
                            alt={acc.name}
                            className="w-9 h-9 rounded-full border border-blue-400 shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {(acc.name || acc.email)?.[0]?.toUpperCase() || 'G'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 truncate">
                            {acc.name || acc.email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccount(e, acc.email)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove from this device"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddGoogleAccount(true)}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#1e1e1e] hover:bg-[#282828] border border-slate-800 text-xs text-slate-300 hover:text-white transition font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Use another Google account</span>
                </button>
              </div>
            ) : (
              /* Add New Google Account Form */
              <form onSubmit={handleManualGoogleSubmit} className="space-y-3.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-white">Google Account Email</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!googleEmail.includes('@')) {
                          setGoogleEmail((prev) => (prev.trim() ? `${prev.trim()}@gmail.com` : ''));
                        }
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
                    >
                      + @gmail.com
                    </button>
                  </div>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => {
                      setGoogleEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="yourname@gmail.com"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Display Name <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white text-sm text-white placeholder:text-slate-500 focus:outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {googleAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddGoogleAccount(false)}
                      className="w-1/3 py-2.5 px-3 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-slate-300 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleSwitchView('login')}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                ← Back to standard login
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: SPOTIFY MULTI-ACCOUNT SWITCHER ("SWITCH ACCOUNT")     */}
        {/* ============================================================ */}
        {view === 'switch_account' && (
          <div className="space-y-4 animate-fade-in">
            {savedAccounts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#1e1e1e] border border-slate-800 text-center space-y-3">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  No accounts are remembered on this device yet.
                </p>
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Log in with an account
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 px-1">
                  Accounts on this device ({savedAccounts.length}):
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedAccounts.map((acc) => {
                    const isActive = currentUser && (
                      (acc.user_id && acc.user_id === currentUser.user_id) ||
                      (acc.email && currentUser.email && acc.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                      (acc.username && currentUser.username && acc.username.toLowerCase() === currentUser.username.toLowerCase())
                    );

                    return (
                      <div
                        key={acc.user_id || acc.email}
                        onClick={() => handleSwitchToAccount(acc)}
                        role="button"
                        tabIndex={0}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition cursor-pointer group shadow-sm border ${
                          isActive
                            ? 'bg-[#1a2820] border-emerald-500/50 shadow-md shadow-emerald-950/20'
                            : 'bg-[#242424] hover:bg-[#2d2d2d] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {acc.avatar_url ? (
                            <img
                              src={acc.avatar_url}
                              alt={acc.name}
                              className={`w-10 h-10 rounded-full shrink-0 object-cover border-2 ${
                                isActive ? 'border-emerald-400' : 'border-slate-700'
                              }`}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {(acc.username || acc.name || acc.email)?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-white truncate">
                                {acc.name || acc.username}
                              </p>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {acc.auth_type === 'google' ? 'Google' : 'Password'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono truncate">
                              @{acc.username || acc.email.split('@')[0]}
                            </p>
                            {acc.total_trials > 0 && (
                              <p className="text-[10px] text-cyan-400 mt-0.5">
                                🧠 {acc.total_trials} trials ({acc.accuracy_percent}% accuracy)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isActive ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 text-xs font-bold transition">
                              Switch
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleRemoveAccount(e, acc.user_id || acc.email)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove account from this device"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Switcher Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchView('login')}
                    className="w-full py-3 px-4 rounded-full border border-slate-700 hover:border-slate-500 bg-transparent hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span>+ Log in with another account</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400 px-1">
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          onLogout?.();
                          onClose();
                        }}
                        className="text-slate-400 hover:text-white transition hover:underline flex items-center gap-1"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Log out of current</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-rose-400 hover:text-rose-300 transition hover:underline flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Forget all accounts</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
