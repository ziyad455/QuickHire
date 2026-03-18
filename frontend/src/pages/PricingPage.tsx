import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary-500/30">
      
      {/* Navigation Block (Reused style from LandingPage to maintain consistency) */}
      <nav className="border-b border-background-elevated bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <span className="text-xl font-heading font-bold text-text-primary">QuickHire</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How it works</Link>
            <Link to="/pricing" className="text-sm font-medium text-primary-400">Pricing</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl shadow-glow transition-all">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl shadow-glow transition-all">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden py-20 px-4">
        {/* Background Visuals */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight"
            >
              Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] pb-2">Career</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-secondary"
            >
              Unlock the full power of AI gap analysis and start landing interviews at top tech companies.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center mt-8"
            >
              <div className="bg-background-elevated p-1 rounded-full inline-flex items-center relative shadow-inner">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors ${!isYearly ? 'text-text-primary cursor-default' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  {!isYearly && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-background-surface rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-white/5"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Monthly</span>
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${isYearly ? 'text-text-primary cursor-default' : 'text-text-muted hover:text-text-secondary'}`}
                >
                  {isYearly && (
                    <motion.div
                      layoutId="billing-pill"
                      className="absolute inset-0 bg-background-surface rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-white/5"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center">
                    Yearly <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded-md transition-colors">-20%</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            
            {/* Basic Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-background-surface border border-background-elevated rounded-3xl p-8 hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="text-xl font-heading font-bold text-text-primary">Basic</h3>
              <p className="text-sm text-text-muted mt-2">For individuals just getting started.</p>
              <div className="my-6">
                <span className="text-4xl font-black">${isYearly ? 4 : 5}</span>
                <span className="text-text-muted">/mo</span>
                {isYearly && <div className="text-xs text-text-muted mt-1">Billed $48 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="w-full py-3 px-4 bg-background-elevated hover:bg-background-elevated/80 text-white rounded-xl font-medium transition-all active:scale-[0.98] border border-white/5 hover:border-white/10"
              >
                Start Basic
              </button>
              <div className="mt-8 space-y-4">
                <FeatureItem text="3 AI Resume Scans /mo" />
                <FeatureItem text="Basic Job Matching" />
                <FeatureItem text="Top Matches Blurred" />
                <FeatureItem text="Identify Missing Skills" />
                <FeatureItem text="Community Support" />
              </div>
            </motion.div>

            {/* Recommended Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-gradient-to-b from-background-surface to-background border-2 border-primary-500/50 rounded-3xl p-8 shadow-glow transform md:-translate-y-4 z-10 hover:md:-translate-y-6 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] transition-all duration-300"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                Recommended
              </div>
              <h3 className="text-xl font-heading font-bold text-text-primary">Pro </h3>
              <p className="text-sm text-text-muted mt-2">The sweet spot for active job hunters.</p>
              <div className="my-6">
                <span className="text-4xl font-black">${isYearly ? 8 : 10}</span>
                <span className="text-text-muted">/mo</span>
                {isYearly && <div className="text-xs text-primary-400 mt-1">Billed $96 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-glow"
              >
                Get Recommended
              </button>
              <div className="mt-8 space-y-4">
                <FeatureItem text="Unlimited Resume Scans" />
                <FeatureItem text="Premium Matches Unlocked" />
                <FeatureItem text="Deep Gap Analysis" />
                <FeatureItem text="Fix Suggestions by AI" />
                <FeatureItem text="Priority Email Support" />
              </div>
            </motion.div>

            {/* Elite Tier */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-background-surface border border-background-elevated rounded-3xl p-8 hover:border-accent-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-transparent pointer-events-none" />
              <h3 className="text-xl font-heading font-bold text-accent-500 relative z-10">Elite</h3>
              <p className="text-sm text-text-muted mt-2 relative z-10">Power users & frequent seekers.</p>
              <div className="my-6 relative z-10">
                <span className="text-4xl font-black">${isYearly ? 23 : 29}</span>
                <span className="text-text-muted">/mo</span>
                {isYearly && <div className="text-xs text-text-muted mt-1">Billed $276 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="w-full py-3 px-4 bg-background border border-accent-500/30 hover:bg-accent-500/10 text-accent-500 rounded-xl font-medium transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] relative z-10"
              >
                Go Elite
              </button>
              <div className="mt-8 space-y-4 relative z-10">
                <FeatureItem text="Everything in Recommended" />
                <FeatureItem text="Unlimited AI Tailoring" />
                <FeatureItem text="AI Interview Coach" />
                <FeatureItem text="Direct Recruiter Referrals" />
                <FeatureItem text="1-on-1 Profile Review" />
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Extracted Feature Component for clean code
const FeatureItem = ({ text, included = true }: { text: string, included?: boolean }) => (
  <div className="flex items-start">
    {included ? (
      <CheckCircle2 className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
    ) : (
      <X className="w-5 h-5 text-text-muted mr-3 flex-shrink-0 mt-0.5" />
    )}
    <span className={`text-sm ${included ? 'text-text-secondary' : 'text-text-muted line-through'}`}>{text}</span>
  </div>
);

export default PricingPage;
