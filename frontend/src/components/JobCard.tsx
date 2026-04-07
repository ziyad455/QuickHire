import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, MapPin, Building, Briefcase, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JobResult } from '../lib/jobs';

interface JobCardProps {
  job: JobResult;
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: index * 0.08,
        ease: 'power3.out',
      }
    );
  }, [index]);

  // Logic to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-primary bg-primary/10 border-primary/20';
    if (score >= 75) return 'text-secondary bg-secondary/10 border-secondary/20';
    return 'text-outline bg-surface_container_highest border-outline_variant/30';
  };

  return (
    <div
      ref={cardRef}
      onClick={() => {
        navigate(`/dashboard/job/${job.id}`, { state: { job } });
      }}
      className="bg-surface_container_lowest border border-outline_variant/15 rounded-[24px] p-6 shadow-ambient-sm transition-all duration-400 ease-in-out relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:shadow-ambient"
    >
      {/* Decorative Glow if High Score */}
      {job.matchScore >= 90 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors pointer-events-none" />
      )}
      
      {/* Content Container */}
      <div className="transition-all duration-300">
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div>
            <h3 className="text-xl font-heading font-extrabold text-on_surface group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            
            <div className="flex flex-wrap items-center mt-2 gap-3 text-sm text-on_surface_variant font-medium">
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
            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${getScoreColor(job.matchScore)} backdrop-blur-sm`}>
               <span className="font-heading font-black text-2xl leading-none">{job.matchScore}%</span>
               <span className="text-[10px] uppercase tracking-widest font-bold mt-1 opacity-80">Match</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-outline leading-relaxed mb-6 line-clamp-2 relative z-10 font-medium">
          {job.description}
        </p>

        {/* Tags and Meta */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 pt-4 border-t border-outline_variant/15 justify-between">
           
           {/* Skills */}
           <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-surface_container_low text-on_surface_variant rounded-xl text-xs border border-outline_variant/30 flex items-center font-semibold">
                     {skill.required && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-primary"/>}
                     {skill.name}
                  </span>
              ))}
           </div>

           {/* Meta Pills */}
           <div className="flex gap-2">
               <span className="px-3 py-1.5 bg-surface text-on_surface_variant rounded-xl text-xs border border-outline_variant/30 flex items-center font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                 <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                 {job.type}
               </span>
               <span className="px-3 py-1.5 bg-surface text-on_surface_variant rounded-xl text-xs border border-outline_variant/30 flex items-center font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                 <Globe className="w-3.5 h-3.5 mr-1.5" />
                 {job.remoteOption}
               </span>
               <span className="px-3 py-1.5 bg-surface text-on_surface_variant rounded-xl text-xs border border-outline_variant/30 font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                 {job.source}
               </span>
           </div>
        </div>
      </div>
    </div>
  );
};
