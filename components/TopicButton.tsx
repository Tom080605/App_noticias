import React from 'react';
import { QuickTopic } from '../types';

interface TopicButtonProps {
  topic: QuickTopic;
  onClick: (topic: string) => void;
}

export const TopicButton: React.FC<TopicButtonProps> = ({ topic, onClick }) => {
  return (
    <button
      onClick={() => onClick(topic.query)}
      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/50 hover:bg-indigo-50 active:bg-indigo-100 active:scale-95 border border-transparent hover:border-indigo-200 transition-all duration-200 group touch-manipulation"
    >
      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{topic.icon}</span>
      <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600">{topic.label}</span>
    </button>
  );
};