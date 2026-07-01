import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../app/AppContext';

interface AuthScreenProps {
  onGuestAccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onGuestAccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useApp();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Please enter your name');
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="pulse-glow-bg top-[20%] left-[50%] -translate-x-1/2" />

      <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 bg-card border border-border-subtle rounded-[24px] mx-auto flex items-center justify-center text-4xl shadow-xl glow-primary"
          >
            ⚖️
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white font-display tracking-tight mt-4"
          >
            Goal75
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-xs text-text-secondary max-w-[280px] mx-auto leading-relaxed"
          >
            Every kilogram lost is a step closer to feeling lighter. Consistency beats complexity.
          </motion.p>
        </div>

        {/* Form Body Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border-subtle rounded-[28px] p-6 shadow-2xl space-y-6"
        >
          {error && (
            <div className="bg-danger-brand/10 border border-danger-brand/20 text-danger-brand text-xs rounded-xl p-3 flex gap-2 items-center">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider pl-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-text-secondary" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-background border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-text-secondary" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  className="w-full bg-background border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-text-secondary" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-white text-xs font-semibold focus:border-primary-brand focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-brand text-black hover:opacity-90 disabled:opacity-50 py-3.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-md font-display flex items-center justify-center gap-1.5"
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Create Cloud Account' : 'Sign In to Cloud'}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] bg-border-subtle/50 flex-1" />
            <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">or</span>
            <div className="h-[1px] bg-border-subtle/50 flex-1" />
          </div>

          {/* Social Logins */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-background hover:bg-white/5 border border-border-subtle text-white py-3.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.55 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.87 3C6.3 7.62 8.92 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.42-4.93 3.42-8.6z"
              />
              <path
                fill="#FBBC05"
                d="M5.37 14.5c-.24-.73-.37-1.5-.37-2.3s.13-1.57.37-2.3L1.5 7.5C.54 9.41 0 11.64 0 14s.54 4.59 1.5 6.5l3.87-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.03.69-2.35 1.1-4.27 1.1-3.08 0-5.7-2.58-6.63-5.46l-3.87 3C3.39 20.35 7.35 23 12 23z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[11px] font-bold text-primary-brand hover:underline cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </motion.div>

        {/* Continue as Guest Bypass */}
        <div className="text-center">
          <button
            onClick={onGuestAccess}
            className="text-xs text-text-secondary hover:text-white font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles size={14} className="text-primary-brand" />
            Continue as Guest (Local Offline Mode)
          </button>
        </div>

      </div>
    </div>
  );
};
export default AuthScreen;
