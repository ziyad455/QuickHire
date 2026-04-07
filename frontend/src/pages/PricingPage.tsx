import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from('.anim-header', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      }).from('.anim-card', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=0.2');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col font-body selection:bg-primary/20">
      
      {/* Navigation Block */}
      <nav className="border-b border-outline_variant/15 bg-surface/60 backdrop-blur-[20px] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-heading font-bold text-on_surface tracking-tight">Luminal Talent</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#how-it-works" className="text-sm text-on_surface_variant hover:text-on_surface transition-colors font-semibold">How it works</Link>
            <Link to="/pricing" className="text-sm font-bold text-primary">Pricing</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary_container text-on_primary font-bold rounded-xl shadow-ambient hover:shadow-ambient-sm transition-all hover:-translate-y-0.5 border-t border-primary_fixed_dim">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-bold text-on_surface_variant hover:text-on_surface transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-br from-primary to-primary_container text-on_primary font-bold rounded-xl shadow-ambient hover:shadow-ambient-sm transition-all hover:-translate-y-0.5 border-t border-primary_fixed_dim">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden py-20 px-4">
        {/* Background Visuals */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <h1 className="anim-header text-4xl md:text-5xl lg:text-7xl font-heading font-extrabold tracking-[-0.04em] text-on_surface">
              Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary pb-2">Career</span>
            </h1>
            <p className="anim-header text-lg text-on_surface_variant md:text-xl font-medium max-w-2xl mx-auto">
              Unlock the full power of AI gap analysis and start landing interviews at top tech companies.
            </p>

            {/* Billing Toggle */}
            <div className="anim-header flex items-center justify-center mt-8">
              <div className="bg-surface_container_low p-1.5 rounded-full inline-flex items-center relative shadow-inner border border-outline_variant/15 w-[250px] h-[52px]">
                <div 
                  className="absolute inset-y-1.5 bg-surface_container_lowest rounded-full shadow-ambient-sm border border-outline_variant/15 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                  style={{ left: isYearly ? '50%' : '6px', right: isYearly ? '6px' : '50%' }} 
                />
                <button
                  onClick={() => setIsYearly(false)}
                  className={`relative flex-1 text-sm font-bold transition-colors z-10 h-full flex items-center justify-center ${!isYearly ? 'text-on_surface' : 'text-outline hover:text-on_surface_variant'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`relative flex-1 text-sm font-bold transition-colors z-10 h-full flex items-center justify-center ${isYearly ? 'text-on_surface' : 'text-outline hover:text-on_surface_variant'}`}
                >
                  Yearly <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">-20%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            
            {/* Basic Tier */}
            <div className="anim-card bg-surface_container_lowest border border-outline_variant/15 rounded-[32px] p-8 shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-2xl font-heading font-extrabold text-on_surface">Basic</h3>
              <p className="text-sm text-outline mt-2 font-medium">For individuals just getting started.</p>
              <div className="my-8">
                <span className="text-5xl font-heading font-black text-on_surface">${isYearly ? 4 : 5}</span>
                <span className="text-outline font-semibold text-lg">/mo</span>
                {isYearly && <div className="text-sm font-bold text-outline mt-2">Billed $48 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="w-full py-3.5 px-4 bg-surface_container_high hover:bg-outline_variant/30 text-on_surface rounded-xl font-bold transition-all border border-outline_variant/15 hover:border-outline_variant/30"
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
            </div>

            {/* Recommended Tier */}
            <div className="anim-card relative bg-gradient-to-b from-surface_container_lowest to-surface border-2 border-primary/50 rounded-[32px] p-8 shadow-ambient transform md:-translate-y-4 z-10 hover:md:-translate-y-6 transition-all duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on_primary text-xs font-bold uppercase tracking-widest py-1.5 px-5 rounded-full shadow-ambient-sm">
                Recommended
              </div>
              <div className="absolute inset-0 bg-primary/5 rounded-[30px] pointer-events-none" />
              
              <h3 className="text-2xl font-heading font-extrabold text-on_surface relative z-10">Pro</h3>
              <p className="text-sm text-outline mt-2 relative z-10 font-medium">The sweet spot for active job hunters.</p>
              <div className="my-8 relative z-10">
                <span className="text-5xl font-heading font-black text-on_surface">${isYearly ? 8 : 10}</span>
                <span className="text-outline font-semibold text-lg">/mo</span>
                {isYearly && <div className="text-sm font-bold text-primary mt-2">Billed $96 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="relative z-10 w-full py-3.5 px-4 bg-gradient-to-br from-primary to-primary_container text-on_primary rounded-xl font-bold transition-all hover:shadow-ambient-sm shadow-ambient border-t border-primary_fixed_dim hover:-translate-y-0.5"
              >
                Get Recommended
              </button>
              <div className="mt-8 space-y-4 relative z-10">
                <FeatureItem text="Unlimited Resume Scans" />
                <FeatureItem text="Premium Matches Unlocked" />
                <FeatureItem text="Deep Gap Analysis" />
                <FeatureItem text="Fix Suggestions by AI" />
                <FeatureItem text="Priority Email Support" />
              </div>
            </div>

            {/* Elite Tier */}
            <div className="anim-card bg-surface_container_lowest border border-outline_variant/15 rounded-[32px] p-8 shadow-ambient-sm hover:border-secondary/30 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none" />
              <h3 className="text-2xl font-heading font-extrabold text-secondary relative z-10">Elite</h3>
              <p className="text-sm text-outline mt-2 relative z-10 font-medium">Power users & frequent seekers.</p>
              <div className="my-8 relative z-10">
                <span className="text-5xl font-heading font-black text-on_surface">${isYearly ? 23 : 29}</span>
                <span className="text-outline font-semibold text-lg">/mo</span>
                {isYearly && <div className="text-sm font-bold text-outline mt-2">Billed $276 yearly</div>}
              </div>
              <button 
                onClick={handleCTA}
                className="w-full py-3.5 px-4 bg-surface border border-secondary/30 hover:bg-secondary/10 text-secondary rounded-xl font-bold transition-all relative z-10"
              >
                Go Elite
              </button>
              <div className="mt-8 space-y-4 relative z-10">
                <FeatureItem text="Everything in Pro" />
                <FeatureItem text="Unlimited AI Tailoring" />
                <FeatureItem text="AI Interview Coach" />
                <FeatureItem text="Direct Recruiter Referrals" />
                <FeatureItem text="1-on-1 Profile Review" />
              </div>
            </div>

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
      <CheckCircle2 className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
    ) : (
      <X className="w-5 h-5 text-outline mr-3 flex-shrink-0 mt-0.5" />
    )}
    <span className={`text-sm font-medium ${included ? 'text-on_surface_variant' : 'text-outline line-through'}`}>{text}</span>
  </div>
);

export default PricingPage;
