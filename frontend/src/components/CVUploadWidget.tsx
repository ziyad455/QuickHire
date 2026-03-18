import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CVUploadWidgetProps {
  onUpload?: (e: React.MouseEvent | React.DragEvent, file?: File) => void;
}

const CVUploadWidget: React.FC<CVUploadWidgetProps> = ({ onUpload }) => {
  const navigate = useNavigate();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      onUpload(e as unknown as React.MouseEvent, e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (onUpload) {
      fileInputRef.current?.click();
    } else {
      navigate('/signup');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (onUpload && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e, e.dataTransfer.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div 
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          isDragActive 
            ? "border-primary-400 bg-primary-500/10 shadow-glow scale-[1.02]" 
            : "border-background-elevated bg-background-surface hover:border-primary-500/50 hover:bg-background-elevated/50 hover:-translate-y-1 hover:shadow-glow"
        )}
      >
        {/* Physical depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-colors" />
            <div className="relative bg-background-surface border border-background-elevated p-4 rounded-full group-hover:bg-background-elevated transition-colors">
              <Upload className={cn(
                "w-8 h-8 transition-colors duration-300",
                isDragActive ? "text-primary-400" : "text-text-secondary group-hover:text-primary-400"
              )} />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-heading font-bold text-text-primary">
              Drop your CV here
            </h3>
            <p className="text-text-secondary max-w-sm mx-auto">
              We'll instantly parse your experience and match you with highest-paying remote jobs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm font-medium text-primary-400 bg-primary-500/10 px-4 py-2 rounded-full border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
            <FileText className="w-4 h-4" />
            <span>PDF, DOCX up to 5MB</span>
          </div>
          
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
             <div className="bg-primary-500 text-white p-2 rounded-full shadow-lg">
                <ArrowRight className="w-5 h-5" />
             </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CVUploadWidget;
