import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Building, Briefcase, Globe, Lock } from 'lucide-react';
import type { JobMock } from '../lib/mockData';

interface JobCardProps {
  job: JobMock;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const isPremiumLocked = job.matchScore > 80;

  // Logic to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
    if (score >= 75) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-text-muted bg-background-elevated border-white/5';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-gradient-to-b from-background-surface to-background border-[1px] border-background-elevated rounded-2xl p-6 shadow-md transition-all duration-400 ease-in-out hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-[0px_12px_24px_0_rgba(16,185,129,0.1)] relative overflow-hidden group"
    >
      {/* Decorative Glow if High Score */}
      {job.matchScore >= 90 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary-500/10 transition-colors" />
      )}
      
      {/* Premium Overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-background/5 backdrop-blur-[2px]">
           <div className="bg-background-surface border border-primary-500/30 p-3 rounded-2xl shadow-glow mb-2">
              <Lock className="w-8 h-8 text-primary-400" />
           </div>
           <h4 className="text-xl font-heading font-bold text-text-primary mb-1">Top Match</h4>
           <div className="inline-block mt-1 font-heading font-black text-3xl text-primary-400">{job.matchScore}%</div>
           <p className="text-sm text-text-secondary mt-2 max-w-[200px]">
             Upgrade to Premium to view companies matching over 80%.
           </p>
           <button className="mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl shadow-glow transition-colors">
              Unlock Premium
           </button>
        </div>
      )}

      {/* Content Container (Blurred if locked) */}
      <div className={`transition-all duration-300 ${isPremiumLocked ? 'blur-md opacity-40 select-none pointer-events-none' : ''}`}>
        <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary-400 transition-colors">{job.title}</h3>
          
          <div className="flex flex-wrap items-center mt-2 gap-3 text-sm text-text-secondary">
             <div className="flex items-center">
                 <Building className="w-4 h-4 mr-1.5 opacity-70" />
                 {job.company}
             </div>
             <div className="flex items-center">
                 <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                 {job.location}
             </div>
          </div>
        </div>
        
        {/* Match Score */}
        <div className="flex flex-col items-end pl-4">
          <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(job.matchScore)}`}>
             <span className="font-heading font-black text-2xl leading-none">{job.matchScore}%</span>
             <span className="text-[10px] uppercase tracking-wider font-bold mt-1 opacity-80">Match</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-text-muted leading-relaxed mb-6 line-clamp-2 relative z-10">
        {job.description}
      </p>

      {/* Tags and Meta */}
      <div className="flex flex-wrap items-center gap-2 relative z-10 pt-4 border-t border-background-elevated/50 justify-between">
         
         {/* Skills */}
         <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-background-elevated text-text-secondary rounded-lg text-xs border border-white/5 flex items-center">
                   {skill.required && <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary-500"/>}
                   {skill.name}
                </span>
            ))}
         </div>

         {/* Meta Pills */}
         <div className="flex gap-2">
             <span className="px-2.5 py-1 bg-background text-text-muted rounded-lg text-xs border border-background-elevated flex items-center">
               <Briefcase className="w-3 h-3 mr-1.5" />
               {job.type}
             </span>
             <span className="px-2.5 py-1 bg-background text-text-muted rounded-lg text-xs border border-background-elevated flex items-center">
               <Globe className="w-3 h-3 mr-1.5" />
               {job.remoteOption}
             </span>
         </div>
      </div>
      </div>
    </motion.div>
  );
};
