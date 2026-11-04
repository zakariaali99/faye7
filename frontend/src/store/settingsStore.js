import { create } from 'zustand';
import { cmsApi } from '../services/api';

// Public store settings (theme, announcement bar, contact), fetched once per page load.
const useSettingsStore = create((set, get) => ({
    settings: null,
    fetchSettings: async () => {
        if (get().settings) return;
        try {
            const res = await cmsApi.getSettings();
            set({ settings: res.data });
        } catch (error) {
            console.error('Failed to fetch store settings', error);
        }
    },
}));

export default useSettingsStore;
