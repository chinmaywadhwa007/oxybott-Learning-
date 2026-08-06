import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  Wand2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AceCodeLogo } from '../icons/AceCodeLogo';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { UsernameGenerator } from '../components/auth/UsernameGenerator';
import { OverlappingHeroComposition } from '../components/auth/OverlappingHeroComposition';
import { SecurityBadgeBanner } from '../components/auth/SecurityBadgeBanner';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

const GitHubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

type AuthMode = 'signup' | 'login' | 'forgot-password' | 'magic-link' | 'success';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setProfileModalOpen, addXp } = useAppStore();

  const {
    login,
    signup,
    sendMagicLink,
    verifyMagicLink,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
    setError,
    clearState,
    magicLinkSent,
    resetSent,
  } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signup');

  // Form State
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password reset token state
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Hover Focus Microinteraction State
  const [activeFocus, setActiveFocus] = useState<'left' | 'right' | 'none'>('none');

  // Ref to prevent double token verification in React Strict Mode
  const processedTokenRef = useRef<string | null>(null);

  // Sync mode and process Magic Links / Reset Links from URL query params
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode;
    const token = searchParams.get('token');

    if (token) {
      if (processedTokenRef.current === token) return;
      processedTokenRef.current = token;

      if (urlMode === 'forgot-password') {
        setResetToken(token);
        setMode('forgot-password');
      } else {
        setMode('magic-link');
        verifyMagicLink(token).then((success) => {
          if (success) {
            addXp(50);
            setMode('success');
          }
        });
      }
    } else if (urlMode && ['signup', 'login', 'forgot-password', 'magic-link'].includes(urlMode)) {
      clearState();
      setMode(urlMode);
    }
  }, [searchParams]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const success = await signup(firstName || 'Developer', username || email.split('@')[0], email, password);
    if (success) {
      addXp(50);
      setMode('success');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      addXp(20);
      navigate('/');
      setTimeout(() => setProfileModalOpen(true), 300);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMagicLink(email);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetToken) {
      const ok = await resetPassword(resetToken, password);
      if (ok) {
        setMode('login');
      }
    } else {
      await forgotPassword(email);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#081321] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]">
      {/* Ambient Background Glowing Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#5BE4FF]/16 via-purple-600/10 to-transparent blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating Background Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 7 + (i % 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
            style={{
              top: `${(i * 13) % 90}%`,
              left: `${(i * 19) % 95}%`,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-[#5BE4FF]/40 blur-[1px]"
          />
        ))}
      </div>

      {/* TOP HEADER NAVIGATION */}
      <header className="relative z-20 w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#5BE4FF]/50 transition-colors">
            <AceCodeLogo className="w-6 h-6 text-[#5BE4FF]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#5BE4FF] transition-colors">
            Oxybott
          </span>
        </Link>

        {/* Auth Mode Switch Pills */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              clearState();
              setMode(mode === 'login' ? 'signup' : 'login');
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#9BA9C2] hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{mode === 'login' ? "Don't have an account?" : 'Already registered?'}</span>
            <span className="text-[#5BE4FF] underline underline-offset-4 font-black">
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT COLUMN: HERO MARKETING */}
          <div
            onMouseEnter={() => setActiveFocus('left')}
            onMouseLeave={() => setActiveFocus('none')}
            className="lg:col-span-6 flex flex-col justify-center space-y-6 transition-all duration-300"
          >
            <OverlappingHeroComposition />
          </div>

          {/* RIGHT COLUMN: AUTHENTICATION CARD */}
          <div
            onMouseEnter={() => setActiveFocus('right')}
            onMouseLeave={() => setActiveFocus('none')}
            className="lg:col-span-6 w-full flex justify-center lg:justify-end transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              {/* SIGNUP FORM */}
              {mode === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-[460px] rounded-[24px] bg-[#0F1623]/95 text-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl"
                >
                  <SecurityBadgeBanner />

                  <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-1">
                      Start building today.
                    </h1>
                    <p className="text-[#9BA9C2] text-xs sm:text-sm font-medium leading-relaxed">
                      Create your encrypted account to begin.
                    </p>
                  </div>

                  {/* ERROR BANNER */}
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignupSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                        First Name
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Alex"
                          required
                          style={{ paddingLeft: '48px' }}
                          className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                        />
                      </div>
                    </div>

                    <UsernameGenerator value={username} onChange={setUsername} />

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com"
                          required
                          style={{ paddingLeft: '48px' }}
                          className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{ paddingLeft: '48px' }}
                          className="w-full h-[46px] pr-11 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-[#64748B] hover:text-[#9BA9C2] transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {password && <PasswordStrengthMeter password={password} />}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{ paddingLeft: '48px' }}
                          className={`w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:ring-2 transition-all duration-200 outline-none ${
                            confirmPassword && confirmPassword !== password
                              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                              : 'border-white/[0.08] focus:border-[#5BE4FF] focus:ring-[#5BE4FF]/20'
                          }`}
                        />
                      </div>
                      {confirmPassword && confirmPassword !== password && (
                        <p className="text-xs font-semibold text-rose-400 pl-1">
                          Passwords do not match.
                        </p>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <p className="text-xs font-semibold text-[#5BE4FF] pl-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#5BE4FF] to-[#48D7FF] hover:from-[#7AF0FF] hover:to-[#5CE1FF] text-[#081321] font-black text-sm shadow-[0_0_20px_rgba(91,228,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Create Account &amp; Protect</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-[460px] rounded-[24px] bg-[#0F1623]/95 text-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl"
                >
                  <SecurityBadgeBanner />

                  <div className="mb-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-1">
                      Welcome back.
                    </h1>
                    <p className="text-[#9BA9C2] text-xs sm:text-sm font-medium leading-relaxed">
                      Authenticate to access your workspace.
                    </p>
                  </div>

                  {/* ERROR BANNER */}
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                        Email Address or Username
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@example.com or alex_code"
                          required
                          style={{ paddingLeft: '48px' }}
                          className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            clearState();
                            setMode('forgot-password');
                          }}
                          className="text-xs font-bold text-[#5BE4FF] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          style={{ paddingLeft: '48px' }}
                          className="w-full h-[46px] pr-11 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-[#64748B] hover:text-[#9BA9C2] transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#5BE4FF] to-[#48D7FF] hover:from-[#7AF0FF] hover:to-[#5CE1FF] text-[#081321] font-black text-sm shadow-[0_0_20px_rgba(91,228,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Secure Continue</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        clearState();
                        setMode('magic-link');
                      }}
                      className="text-xs font-bold text-[#5BE4FF] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Send Instant Magic Link (Passwordless)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* MAGIC LINK FORM */}
              {mode === 'magic-link' && (
                <motion.div
                  key="magic-link"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-[460px] rounded-[24px] bg-[#0F1623]/95 text-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl"
                >
                  <SecurityBadgeBanner />

                  {magicLinkSent ? (
                    <div className="text-center py-5 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] border border-[#5BE4FF]/20 flex items-center justify-center mx-auto shadow-sm">
                        <Wand2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-black text-white">Magic Link Sent!</h2>
                      <p className="text-[#9BA9C2] text-xs leading-relaxed max-w-xs mx-auto">
                        We sent a magic link to <span className="font-bold text-white">{email || 'your email'}</span>. Check your email (or terminal console) and click the link to log in.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          clearState();
                          setMode('login');
                        }}
                        className="mt-3 px-5 py-2.5 rounded-xl bg-[#5BE4FF] text-[#081321] font-bold text-xs cursor-pointer hover:bg-[#7AE8FF] transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-1">
                          Passwordless Magic Link
                        </h1>
                        <p className="text-[#9BA9C2] text-xs sm:text-sm font-medium leading-relaxed">
                          We&apos;ll send an encrypted one-click login link to your inbox.
                        </p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                            Work or Personal Email
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="alex@example.com"
                              required
                              style={{ paddingLeft: '48px' }}
                              className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#5BE4FF] to-[#48D7FF] hover:from-[#7AF0FF] hover:to-[#5CE1FF] text-[#081321] font-black text-sm shadow-[0_0_20px_rgba(91,228,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <span>Send Instant Magic Link</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </form>

                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            clearState();
                            setMode('login');
                          }}
                          className="text-xs font-semibold text-[#9BA9C2] hover:text-white transition-colors cursor-pointer"
                        >
                          &larr; Return to Standard Password Login
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot-password' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-[460px] rounded-[24px] bg-[#0F1623]/95 text-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl"
                >
                  <SecurityBadgeBanner />

                  {resetSent ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] border border-[#5BE4FF]/20 flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                      </div>
                      <h2 className="text-2xl font-black text-white">Check your inbox!</h2>
                      <p className="text-[#9BA9C2] text-xs leading-relaxed max-w-xs mx-auto">
                        We&apos;ve sent a password reset link to <span className="font-bold text-white">{email || 'your email'}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          clearState();
                          setMode('login');
                        }}
                        className="mt-3 px-5 py-2.5 rounded-xl bg-[#5BE4FF] text-[#081321] font-bold text-xs cursor-pointer hover:bg-[#7AE8FF] transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-5">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-1">
                          {resetToken ? 'Set new password' : 'Reset password'}
                        </h1>
                        <p className="text-[#9BA9C2] text-xs sm:text-sm font-medium leading-relaxed">
                          {resetToken ? 'Enter your new password below.' : 'Enter your account email to receive reset instructions.'}
                        </p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleForgotSubmit} className="space-y-3">
                        {resetToken ? (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                              New Password
                            </label>
                            <div className="relative flex items-center">
                              <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                                <Lock className="w-4 h-4" />
                              </div>
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ paddingLeft: '48px' }}
                                className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
                              Email Address
                            </label>
                            <div className="relative flex items-center">
                              <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10">
                                <Mail className="w-4 h-4" />
                              </div>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="alex@example.com"
                                required
                                style={{ paddingLeft: '48px' }}
                                className="w-full h-[46px] pr-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#5BE4FF] to-[#48D7FF] hover:from-[#7AF0FF] hover:to-[#5CE1FF] text-[#081321] font-black text-sm shadow-[0_0_20px_rgba(91,228,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-5 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <span>{resetToken ? 'Update Password' : 'Send Reset Link'}</span>
                              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>
              )}

              {/* SUCCESSFUL SIGNUP STATE */}
              {mode === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-[460px] rounded-[24px] bg-[#0F1623]/95 text-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-2xl text-center relative overflow-hidden"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5BE4FF] to-sky-400 text-[#081321] flex items-center justify-center mx-auto shadow-lg shadow-[#5BE4FF]/30 mb-5"
                  >
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] font-extrabold text-[11px] border border-[#5BE4FF]/20">
                      <Sparkles className="w-3 h-3" />
                      +50 XP EARNED
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Welcome to Oxybott 🎉
                    </h1>
                    <p className="text-[#9BA9C2] text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                      Your account is active and verified! Explore personalized paths, interactive labs, and real-world coding challenges.
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    type="button"
                    onClick={() => {
                      setProfileModalOpen(true);
                      navigate('/');
                    }}
                    className="w-full h-[46px] rounded-xl bg-[#5BE4FF] hover:bg-[#7AE8FF] text-[#081321] font-black text-sm shadow-[0_0_20px_rgba(91,228,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-6"
                  >
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 w-full max-w-[1280px] mx-auto px-6 sm:px-8 py-3 text-center text-xs text-[#64748B]">
        &copy; {new Date().getFullYear()} Oxybott Inc. All rights reserved. &bull; End-to-End Encrypted Authentication
      </footer>
    </div>
  );
};
