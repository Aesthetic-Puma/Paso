import { create } from 'zustand';

export interface FeedbackEntry {
  id: string;
  countryId: string;
  taskId?: string;
  type: 'duration' | 'correction';
  value: string;
  createdAt: string;
}

interface FeedbackState {
  entries: FeedbackEntry[];
  submitFeedback: (entry: Omit<FeedbackEntry, 'id' | 'createdAt'>) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  entries: [],

  submitFeedback: (entry) => {
    const full: FeedbackEntry = {
      ...entry,
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    // Mock: log and store locally
    console.log('[Paso Feedback]', full);
    set((s) => ({ entries: [...s.entries, full] }));
  },
}));
