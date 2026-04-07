import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto !opacity-100" style={{ opacity: 1, transform: 'none' }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a CV file"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-[28px] border outline-none transition-all duration-300 focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          isDragActive
            ? "border-primary/70 bg-surface_container_lowest shadow-[0_24px_68px_rgba(53,37,205,0.20)]"
            : "border-outline_variant/45 bg-surface_container_lowest shadow-[0_18px_48px_rgba(25,28,29,0.12)] hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_24px_62px_rgba(53,37,205,0.16)]"
        )}
      >
        <div
          className={cn(
            "relative m-3 rounded-[22px] border bg-surface_container_lowest p-8 text-on_surface transition-all duration-300 md:p-10",
            isDragActive
              ? "border-primary/70"
              : "border-outline_variant/50 group-hover:border-primary/40"
          )}
        >
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div
              className={cn(
                "relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border shadow-[0_12px_32px_rgba(25,28,29,0.14)] md:mx-0",
                isDragActive
                  ? "border-primary bg-primary text-on_primary"
                  : "border-outline_variant/40 bg-on_surface text-inverse_on_surface group-hover:border-primary/50 group-hover:bg-primary"
              )}
            >
              <Upload className="h-7 w-7" />
              <div className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border border-surface_container_lowest bg-secondary shadow-[0_0_0_3px_rgba(255,255,255,0.9)]" />
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-outline_variant/60 bg-surface_container_low px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on_surface">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                CV Upload
              </div>
              <h3 className="text-2xl font-heading font-extrabold tracking-tight text-on_surface md:text-3xl">
                Drop your CV and get matched instantly
              </h3>
              <p className="text-sm font-semibold leading-relaxed text-on_surface_variant md:text-base">
                Upload a PDF or DOCX and we&apos;ll parse your experience to surface the strongest job matches.
              </p>
            </div>
          </div>

          <div
            className={cn(
              "relative mt-7 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-all duration-300",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-outline/70 bg-surface group-hover:border-primary/60 group-hover:bg-primary/5"
            )}
          >
            <div className="space-y-2">
              <p className="text-sm font-bold text-on_surface md:text-base">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs font-semibold text-on_surface_variant md:text-sm">
                Recommended: keep your resume under 10MB for faster parsing.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <FileText className="h-4 w-4" />
              <span>PDF or DOCX up to 10MB</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary_container px-5 py-2.5 text-sm font-bold text-on_primary shadow-[0_14px_30px_rgba(53,37,205,0.32)] transition-transform duration-300 group-hover:translate-x-0.5">
              <span>{onUpload ? 'Choose file' : 'Get started free'}</span>
              <ArrowRight className="h-4 w-4" />
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
    </div>
  );
};

export default CVUploadWidget;
