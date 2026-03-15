import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import CVUploadWidget from '../components/CVUploadWidget';

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
    },
  };

  return (
    <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className={className}>
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary font-body overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg shadow-glow flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-heading font-bold tracking-tight">QuickHire</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-text-secondary">
          <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</a>
        </div>
        <div className="flex space-x-4">
          <a href="/login" className="px-5 py-2.5 text-sm font-medium text-text-primary hover:text-primary-400 transition-colors">Log in</a>
          <a href="/signup" className="px-5 py-2.5 text-sm font-medium bg-text-primary text-background rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">Sign up</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32 space-y-32 relative z-10">
        
        {/* SECTION: Hero */}
        <section className="text-center space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-background-surface/50 border border-background-elevated px-4 py-2 rounded-full mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span className="text-sm font-medium text-text-secondary">AI Parsing Engine v2.0 Live</span>
          </div>

          <AnimatedText 
            text="Skip the Search. Let AI Find Your Perfect Role." 
            className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight max-w-4xl leading-tight"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xl text-text-secondary max-w-2xl text-center leading-relaxed"
          >
            Upload your CV once. Our AI instantly extracts your skills and calculates compatibility scores against thousands of active job listings.
          </motion.p>

          <div className="w-full pt-8">
            <CVUploadWidget />
          </div>
        </section>

        {/* SECTION: How It Works (Visual Workflow) */}
        <section id="how-it-works" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-heading font-bold">How QuickHire Works</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              We've entirely eliminated the manual job search. Here is how our AI matching engine connects you to your next role.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden lg:block absolute top-[120px] left-[10%] w-[80%] h-0.5 bg-gradient-to-r from-background-elevated via-primary-500/50 to-background-elevated z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-background-surface border border-background-elevated rounded-3xl p-8 text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-400"
              >
                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto bg-background-elevated rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:bg-primary-500 group-hover:shadow-glow transition-all duration-400">
                  <span className="font-heading font-black text-2xl text-text-muted group-hover:text-white transition-colors">1</span>
                </div>
                <h4 className="text-xl font-bold mb-3">Upload CV</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Drop your resume in PDF or DOCX format. We don't store your file; we extract the text immediately and securely.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-background-surface border border-background-elevated rounded-3xl p-8 text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-400"
              >
                <div className="absolute inset-0 bg-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto bg-background-elevated rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:bg-accent-500 group-hover:shadow-ai-glow transition-all duration-400">
                  <span className="font-heading font-black text-2xl text-text-muted group-hover:text-white transition-colors">2</span>
                </div>
                <h4 className="text-xl font-bold mb-3">AI Structuring</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Our Language Models instantly parse your unstructured experience into a highly organized, standardized JSON profile.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-background-surface border border-background-elevated rounded-3xl p-8 text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-400"
              >
                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 mx-auto bg-background-elevated rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:bg-primary-500 group-hover:shadow-glow transition-all duration-400">
                  <span className="font-heading font-black text-2xl text-text-muted group-hover:text-white transition-colors">3</span>
                </div>
                <h4 className="text-xl font-bold mb-3">Smart Matching</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  We compare your profile against thousands of active job listings, assigning a precise Match Score (0-100) to each.
                </p>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-background-surface border border-primary-500/30 rounded-3xl p-8 text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-400 shadow-[0_4px_24px_rgba(16,185,129,0.1)]"
              >
                <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-glow border border-primary-400/50">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3">Top Jobs Ranked</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Log in to your dashboard to see your top-ranked jobs. Deep-dive into Gap Analysis to see exactly what skills you're missing.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-background-elevated py-12 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span className="text-xl font-heading font-bold text-text-primary">QuickHire</span>
            </div>
            <p className="text-text-secondary text-sm">
              Your Smartest Path to the Perfect Job.
            </p>
          </div>

          {/* Center Status */}
          <div className="text-center">
            <p className="text-text-muted text-sm flex items-center justify-center">
              Built with <span className="mx-1 text-primary-500">♥</span> by Ziyad Tber
            </p>
          </div>

          {/* Socials / Contact */}
          <div className="flex justify-center md:justify-end space-x-6">
            <a 
              href="mailto:ziyad.tber@example.com" 
              className="text-text-muted hover:text-primary-400 transition-colors"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
            <a 
              href="https://github.com/ziyad455" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-muted hover:text-primary-400 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
            </a>
            <a 
              href="https://linkedin.com/in/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-muted hover:text-primary-400 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
