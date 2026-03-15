import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      // Redirect to intended destination or home
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkedInMock = () => {
    alert("LinkedIn Authentication requires backend OpenID Connect (OIDC) or custom token configuration which is not yet set up. Please use Email/Password for now.");
  };

  const handleGoogleSubmit = async () => {
    setError('');
    try {
      await loginWithGoogle();
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate with Google.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
             <Sparkles className="w-8 h-8 text-primary-500" />
             <span className="text-3xl font-heading font-bold text-text-primary">QuickHire</span>
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-heading font-bold tracking-tight text-text-primary">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-background-surface/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-background-elevated sm:rounded-2xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start text-red-500 text-sm">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-background border border-background-elevated rounded-lg py-2.5 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="mt-2 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-background border border-background-elevated rounded-lg py-2.5 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center items-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-glow hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign in' : 'Sign up'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-background-elevated" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background-surface px-2 text-text-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleGoogleSubmit}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-background border border-background-elevated px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background-elevated focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleLinkedInMock}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-background border border-background-elevated px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-background-elevated focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background transition-colors"
              >
                {/* LinkedIn SVG Icon */}
                <svg className="h-5 w-5 fill-[#0A66C2]" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
