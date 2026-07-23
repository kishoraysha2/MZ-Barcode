import { create } from 'zustand';

export interface ThemeState {
  darkMode: boolean;
  accentColor: string;
  highContrast: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setAccentColor: (color: string) => void;
  toggleHighContrast: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: true,
  accentColor: 'purple',
  highContrast: false,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { darkMode: next };
    }),
  setDarkMode: (enabled) =>
    set(() => {
      if (typeof document !== 'undefined') {
        if (enabled) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { darkMode: enabled };
    }),
  setAccentColor: (color) => set({ accentColor: color }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
}));
