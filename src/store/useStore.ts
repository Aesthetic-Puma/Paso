import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../data/countries';

export interface UserProfile {
  name: string;
  status: string;        // Étudiant·e | Jeune actif·ve | En transition
  nationality: string;   // Française | Autre pays de l'UE | Hors UE
  objective: string;     // Travailler | Explorer | Les deux
  duration: string;      // 6 mois | 1 an | 2 ans et plus | Je ne sais pas encore
  incomeAssured: string; // Oui – emploi… | Non – je chercherai…
  monthlyIncome: string; // < 1 500 € | 1 500 – 2 500 € | 2 500 – 4 000 € | + 4 000 € (if Oui)
  savings: string;       // < 1 000 € | 1 000 – 3 000 € | 3 000 – 6 000 € | + 6 000 € (if Non)
  domain: string;        // Ingénierie | Tech & Data | Santé | Design & Créa | Commerce | Hôtellerie
  englishLevel: string;  // Courant | Intermédiaire | Débutant
}

export interface ActivePlan {
  countryId: string;
  targetMonth: number | null;
  targetYear: number | null;
  isExplorative: boolean;
  taskStatuses: Record<string, Task['status']>;
  createdAt: string;
}

interface AppState {
  // Persisted
  onboardingDone: boolean;
  isEditingProfile: boolean;
  profile: UserProfile;
  favorites: string[];
  plans: ActivePlan[];
  activePlanCountryId: string | null;
  // In-memory only (never persisted)
  _hasHydrated: boolean;
  pendingInitialTab: string | null;

  setProfile: (profile: UserProfile) => void;
  completeOnboarding: () => void;
  editProfile: () => void;
  resetAll: () => void;
  setPendingInitialTab: (tab: string | null) => void;
  clearPendingInitialTab: () => void;
  toggleFavorite: (countryId: string) => void;
  createPlan: (plan: Omit<ActivePlan, 'createdAt'>) => void;
  setActivePlan: (countryId: string | null) => void;
  advanceTask: (countryId: string, taskId: string) => void;
  _setHasHydrated: (val: boolean) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  status: 'Étudiant·e',
  nationality: 'Française',
  objective: 'Travailler',
  duration: '1 an',
  incomeAssured: 'Oui',
  monthlyIncome: '< 1 500 €',
  savings: '',
  domain: 'Ingénierie',
  englishLevel: 'Intermédiaire',
};

const nextStatus = (s: Task['status']): Task['status'] => {
  if (s === 'todo') return 'in_progress';
  if (s === 'in_progress') return 'done';
  return 'todo';
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      isEditingProfile: false,
      profile: DEFAULT_PROFILE,
      favorites: [],
      plans: [],
      activePlanCountryId: null,
      _hasHydrated: false,
      pendingInitialTab: null,

      _setHasHydrated: (val) => set({ _hasHydrated: val }),
      setPendingInitialTab: (tab) => set({ pendingInitialTab: tab }),
      clearPendingInitialTab: () => set({ pendingInitialTab: null }),

      setProfile: (profile) => set({ profile }),

      completeOnboarding: () => set({ onboardingDone: true, isEditingProfile: false }),

      editProfile: () => set({ onboardingDone: false, isEditingProfile: true }),

      resetAll: () =>
        set({
          onboardingDone: false,
          isEditingProfile: false,
          profile: DEFAULT_PROFILE,
          favorites: [],
          plans: [],
          activePlanCountryId: null,
        }),

      toggleFavorite: (countryId) =>
        set((s) => ({
          favorites: s.favorites.includes(countryId)
            ? s.favorites.filter((id) => id !== countryId)
            : [...s.favorites, countryId],
        })),

      createPlan: (plan) =>
        set((s) => {
          const existing = s.plans.find((p) => p.countryId === plan.countryId);
          if (existing) {
            return {
              plans: s.plans.map((p) =>
                p.countryId === plan.countryId ? { ...plan, createdAt: p.createdAt } : p,
              ),
              activePlanCountryId: plan.countryId,
            };
          }
          return {
            plans: [...s.plans, { ...plan, createdAt: new Date().toISOString() }],
            activePlanCountryId: plan.countryId,
          };
        }),

      setActivePlan: (countryId) => set({ activePlanCountryId: countryId }),

      advanceTask: (countryId, taskId) =>
        set((s) => {
          const plan = s.plans.find((p) => p.countryId === countryId);
          if (!plan) return {};
          const current = plan.taskStatuses[taskId] ?? 'todo';
          return {
            plans: s.plans.map((p) =>
              p.countryId === countryId
                ? { ...p, taskStatuses: { ...p.taskStatuses, [taskId]: nextStatus(current) } }
                : p,
            ),
          };
        }),
    }),
    {
      name: 'paso-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingDone: state.onboardingDone,
        isEditingProfile: state.isEditingProfile,
        profile: state.profile,
        favorites: state.favorites,
        plans: state.plans,
        activePlanCountryId: state.activePlanCountryId,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
