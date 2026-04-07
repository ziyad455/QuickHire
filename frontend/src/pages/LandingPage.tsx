import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CVUploadWidget from '../components/CVUploadWidget';

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.from('.hero-text', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
      });
      
      // Step cards entrance
      gsap.from('.step-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: '#how-it-works',
          start: 'top 80%'
        },
        ease: 'power2.out'
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-on_surface font-body overflow-x-hidden selection:bg-primary/20">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary_fixed_dim/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary_fixed_dim/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 bg-surface/60 backdrop-blur-[20px] sticky top-0 border-b border-outline_variant/15">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-heading font-bold tracking-tight text-on_surface">Luminal Talent</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-sm font-medium text-on_surface_variant hover:text-primary transition-colors">How it works</a>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/login" className="px-5 py-2.5 text-sm font-medium text-on_surface_variant hover:text-on_surface transition-colors">Log in</a>
          <a href="/signup" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-br from-primary to-primary_container text-on_primary rounded-xl shadow-ambient hover:shadow-ambient-sm transition-shadow border-t border-primary_fixed_dim">Sign up</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32 space-y-32 relative z-10">
        
        {/* SECTION: Hero */}
        <section className="text-center space-y-8 flex flex-col items-center">
          <div className="hero-text inline-flex items-center space-x-2 bg-surface_container_lowest border border-outline_variant/15 px-4 py-2 rounded-full mb-4 shadow-ambient-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-on_surface_variant">AI Neural Engine v2.0 Live</span>
          </div>

          <h1 className="hero-text text-5xl md:text-7xl font-heading font-extrabold tracking-[-0.04em] max-w-4xl leading-tight text-on_surface">
            Skip the Search. Let AI Find Your Perfect Role.
          </h1>
          
          <p className="hero-text text-lg md:text-xl text-on_surface_variant max-w-2xl text-center leading-relaxed">
            Upload your resume and let our neural matching engine decode your true potential. We don't just find jobs; we orchestrate careers through deep semantic analysis.
          </p>

          <div className="hero-text w-full pt-8">
            <CVUploadWidget />
          </div>
        </section>

        {/* SECTION: How It Works */}
        <section id="how-it-works" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-on_surface tracking-tight">The Path to Your Peak Potential</h2>
            <p className="text-on_surface_variant text-lg max-w-2xl mx-auto">
              Our four-step algorithmic pipeline ensures every nuance of your experience is quantified and matched.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="step-card bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-ambient transition-all duration-400">
              <div className="w-16 h-16 bg-surface_container_low rounded-xl flex items-center justify-center mb-6 border border-outline_variant/10 group-hover:bg-primary transition-colors duration-400">
                <span className="font-heading font-black text-2xl text-on_surface_variant group-hover:text-on_primary transition-colors">1</span>
              </div>
              <h4 className="text-xl font-heading font-bold mb-3 text-on_surface">Upload</h4>
              <p className="text-on_surface_variant text-sm leading-relaxed">
                Simply drop your resume. PDF, DOCX, or LinkedIn Profile URL.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-ambient transition-all duration-400">
              <div className="w-16 h-16 bg-surface_container_low rounded-xl flex items-center justify-center mb-6 border border-outline_variant/10 group-hover:bg-secondary transition-colors duration-400">
                <span className="font-heading font-black text-2xl text-on_surface_variant group-hover:text-on_primary transition-colors">2</span>
              </div>
              <h4 className="text-xl font-heading font-bold mb-3 text-on_surface">AI Structuring</h4>
              <p className="text-on_surface_variant text-sm leading-relaxed">
                Our LLMs extract core competencies and hidden soft skills instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-ambient transition-all duration-400">
              <div className="w-16 h-16 bg-surface_container_low rounded-xl flex items-center justify-center mb-6 border border-outline_variant/10 group-hover:bg-primary transition-colors duration-400">
                <span className="font-heading font-black text-2xl text-on_surface_variant group-hover:text-on_primary transition-colors">3</span>
              </div>
              <h4 className="text-xl font-heading font-bold mb-3 text-on_surface">Smart Matching</h4>
              <p className="text-on_surface_variant text-sm leading-relaxed">
                We compare your profile against 50k+ daily listings using semantic analysis.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card bg-surface_container_lowest border border-primary/20 rounded-[24px] p-8 relative overflow-hidden group hover:-translate-y-1 hover:shadow-ambient transition-all duration-400">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary_container rounded-xl flex items-center justify-center mb-6 shadow-ambient-sm border-t border-primary_fixed_dim">
                <CheckCircle2 className="w-8 h-8 text-on_primary" />
              </div>
              <h4 className="text-xl font-heading font-bold mb-3 text-on_surface">Ranking</h4>
              <p className="text-on_surface_variant text-sm leading-relaxed relative z-10">
                Receive a curated list of roles where you are the top 1%.
              </p>
            </div>

          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-outline_variant/15 py-12 bg-surface_container_low relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xl font-heading font-bold text-on_surface">Luminal Talent</span>
            </div>
            <p className="text-on_surface_variant text-sm">
              Building the digital curator's workbench for tomorrow's careers.
            </p>
          </div>

          <div className="text-center">
            <p className="text-on_surface_variant text-sm flex items-center justify-center">
              Built with <span className="mx-1 text-primary">♥</span>
            </p>
          </div>

          <div className="flex justify-center md:justify-end space-x-6">
            <span className="text-sm font-medium text-on_surface_variant hover:text-primary transition-colors cursor-pointer">Privacy</span>
            <span className="text-sm font-medium text-on_surface_variant hover:text-primary transition-colors cursor-pointer">Terms</span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
