import React from 'react';
import { Source } from '../types';

interface SourceChipProps {
  source: Source;
}

export const SourceChip: React.FC<SourceChipProps> = ({ source }) => {
  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-3 py-1 bg-white/60 hover:bg-white/90 border border-indigo-100 rounded-full text-xs font-medium text-indigo-800 transition-colors duration-200 mb-2 mr-2 truncate max-w-[200px]"
      title={source.title}
    >
      <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span className="truncate">{source.title}</span>
    </a>
  );
};
