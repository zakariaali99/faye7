import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false, // dashboard
            toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
            storeDark: null, // storefront: null follows the device setting until the visitor picks
            setStoreDark: (storeDark) => set({ storeDark }),
        }),
        {
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;
