// Storefront themes. The active one is chosen in the dashboard (Appearance page) and saved in
// the store settings. Django writes it into index.html (<meta name="store-theme">), so the store
// opens already themed. `?theme=<key>` previews another theme in this tab only.
export const THEMES = {
    dawn: { name: 'كلاسيك', ref: 'Dawn', desc: 'أبيض وأسود، أزرار مربّعة، بسيط ونظيف.' },
    prestige: { name: 'فاخر', ref: 'Prestige', desc: 'عاجي مع لمسة برونزية وعناوين بخط أميري.' },
    sense: { name: 'دافئ', ref: 'Sense', desc: 'بيج دافئ ولون طوبي، زوايا دائرية وأزرار كبسولة.' },
};

export const DEFAULT_THEME = 'dawn';

const isTheme = (key) => Object.prototype.hasOwnProperty.call(THEMES, key);

const readPreview = () => {
    const fromUrl = new URLSearchParams(window.location.search).get('theme');
    if (isTheme(fromUrl)) {
        try { sessionStorage.setItem('store-theme-preview', fromUrl); } catch { /* storage blocked */ }
        return fromUrl;
    }
    try {
        const saved = sessionStorage.getItem('store-theme-preview');
        if (isTheme(saved)) return saved;
    } catch { /* storage blocked */ }
    return null;
};

const readServerTheme = () => {
    const value = document.querySelector('meta[name="store-theme"]')?.content;
    return isTheme(value) ? value : null;
};

const readCachedTheme = () => {
    try {
        const saved = localStorage.getItem('store-theme');
        return isTheme(saved) ? saved : null;
    } catch {
        return null;
    }
};

export const cacheTheme = (key) => {
    if (!isTheme(key)) return;
    try { localStorage.setItem('store-theme', key); } catch { /* storage blocked */ }
};

// Read once at page load, before the router rewrites the URL.
const preview = readPreview();
const serverTheme = readServerTheme();

export const previewTheme = preview;

// The theme to paint first. When it came from the server (or a preview) it is final;
// otherwise the store settings are fetched and may replace it (local dev, where Vite serves index.html).
export const initialTheme = preview || serverTheme || readCachedTheme() || DEFAULT_THEME;
export const themeIsFinal = !!(preview || serverTheme);

export const resolveTheme = (settingsTheme) => (isTheme(settingsTheme) ? settingsTheme : DEFAULT_THEME);
