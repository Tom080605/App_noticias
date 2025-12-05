export interface Source {
  title: string;
  uri: string;
}

export interface NewsResult {
  summary: string;
  sources: Source[];
  timestamp?: string;
}

export interface SavedArticle extends NewsResult {
  id: string;
  topic: string;
  date: string;
}

export enum BubbleState {
  GREETING = 'GREETING',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  SAVED_LIST = 'SAVED_LIST'
}

export interface QuickTopic {
  id: string;
  label: string;
  icon: string;
  query: string;
}