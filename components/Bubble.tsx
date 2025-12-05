import React, { ReactNode } from 'react';

interface BubbleProps {
  children: ReactNode;
  className?: string;
}

export const Bubble: React.FC<BubbleProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-6 md:p-8 w-[95%] mx-auto transition-all duration-500 ease-in-out bubble-entrance ${className}`}>
      {children}
      
      {/* Decorative reflection */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none" />
    </div>
  );
};