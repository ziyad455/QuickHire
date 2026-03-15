import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-heading font-bold text-primary-400">
            QuickHire <span className="text-text-primary">AI</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Your Smartest Path to the Perfect Job
          </p>
        </header>

        {/* Theme Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Default Job Card */}
          <div className="bg-background-surface rounded-xl p-6 border border-background-elevated shadow-lg transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Senior Frontend Engineer</h3>
                <p className="text-text-muted">TechCorp Inc. • Remote</p>
              </div>
              <div className="bg-primary-500/10 text-primary-400 text-sm font-bold px-3 py-1 rounded-full border border-primary-500/20">
                92% Match
              </div>
            </div>
            <p className="text-text-secondary mb-6 line-clamp-2">
              We are looking for an experienced frontend engineer with deep knowledge of React, Tailwind CSS, and scalable architectures.
            </p>
            <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer">
              Apply Now
            </button>
          </div>

          {/* Locked / Blurred Job Card (Free Tier) */}
          <div className="bg-background-surface rounded-xl p-6 border border-background-elevated shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center opacity-100 group-hover:bg-background/80 transition-all">
              <svg className="w-10 h-10 text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="font-semibold text-text-primary">Unlock with Premium</span>
            </div>
            
            <div className="flex justify-between items-start mb-4 opacity-50">
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Product Designer</h3>
                <p className="text-text-muted">DesignStudio • New York</p>
              </div>
               <div className="bg-text-muted/10 text-text-secondary text-sm font-bold px-3 py-1 rounded-full border border-text-muted/20">
                Score Hidden
              </div>
            </div>
            <p className="text-text-secondary mb-6 opacity-50">
              Join our creative team to build beautiful, intuitive interfaces for millions of users.
            </p>
            <button className="w-full bg-background-elevated text-text-muted font-medium py-2 px-4 rounded-lg cursor-not-allowed opacity-50">
              Apply Now
            </button>
          </div>

        </div>

        {/* AI Gap Analysis Section */}
        <section className="bg-background-surface/50 rounded-2xl p-8 border border-accent-500/20 shadow-ai-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-accent-500/20 rounded-lg text-accent-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">AI Gap Analysis</h2>
            </div>
            <p className="text-text-secondary mb-6 max-w-2xl">
              We identified 2 missing skills for the Senior Frontend Engineer role. Adding experience in <span className="text-primary-400 font-semibold">GraphQL</span> and <span className="text-primary-400 font-semibold">Next.js</span> could increase your match score to 98%.
            </p>
            <button className="bg-gradient-to-r cursor-pointer inset-auto from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-lg shadow-accent-500/20 flex items-center space-x-2">
              <span>View Full Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
