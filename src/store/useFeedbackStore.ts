import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      entries: [],

      submitFeedback: (entry) => {
        const full: FeedbackEntry = {
          ...entry,
          id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        };
        console.log('[Paso Feedback]', full);
        set((s) => ({ entries: [...s.entries, full] }));
      },
    }),
    {
      name: 'paso-feedback',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
