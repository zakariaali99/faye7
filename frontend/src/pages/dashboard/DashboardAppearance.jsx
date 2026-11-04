import { useState, useEffect } from 'react';
import { cmsApi } from '../../services/api';
import { Palette, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { THEMES } from '../../theme';

const thumb = (key) => `${import.meta.env.BASE_URL}themes/${key}.jpg`;

const DashboardAppearance = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await cmsApi.getSettings();
                setSettings(res.data);
            } catch {
                toast.error('تعذر تحميل الإعدادات');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const activate = async (key) => {
        setSavingKey(key);
        try {
            const res = await cmsApi.updateSettings(settings.id, { store_theme: key });
            setSettings(res.data);
            toast.success(`تم تفعيل ثيم «${THEMES[key].name}» في المتجر`);
        } catch {
            toast.error('تعذر تفعيل الثيم');
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-gold-300 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const active = settings?.store_theme;

    return (
        <div className="space-y-10 animate-fade-in">
            <div>
                <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1 flex items-center gap-3">
                    <Palette size={28} className="text-gold-500" />
                    مظهر المتجر
                </h2>
                <p className="text-text-secondary dark:text-gold-400 text-sm">
                    اختر شكل المتجر. «معاينة» تفتح المتجر بالثيم في تبويب جديد ولا يراها الزبائن، و«تفعيل» يغيّر المتجر للجميع فوراً.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Object.entries(THEMES).map(([key, theme]) => {
                    const isActive = key === active;
                    return (
                        <div
                            key={key}
                            className={`bg-white dark:bg-dark-700 rounded-[32px] border-2 overflow-hidden shadow-sm transition-all ${isActive ? 'border-gold-500 shadow-xl shadow-gold-500/10' : 'border-gold-100 dark:border-dark-600'}`}
                        >
                            <div className="aspect-[16/11] overflow-hidden bg-cream-50 dark:bg-dark-600 border-b border-gold-100 dark:border-dark-600">
                                <img src={thumb(key)} alt={theme.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-xl font-black text-text-primary dark:text-cream-50">
                                        {theme.name} <span className="text-sm font-bold text-text-muted">({theme.ref})</span>
                                    </h3>
                                    {isActive && (
                                        <span className="flex items-center gap-1 text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                                            <CheckCircle2 size={14} /> مفعّل الآن
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary dark:text-gold-400/80 leading-relaxed">{theme.desc}</p>
                                <div className="flex gap-3 pt-2">
                                    <a
                                        href={`/?theme=${key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gold-200 dark:border-dark-500 text-text-primary dark:text-cream-50 font-bold text-sm hover:bg-gold-50 dark:hover:bg-dark-600 transition-all"
                                    >
                                        <Eye size={16} /> معاينة
                                    </a>
                                    <button
                                        onClick={() => activate(key)}
                                        disabled={isActive || savingKey !== null}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gold-600 text-white font-black text-sm hover:bg-gold-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {savingKey === key ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : isActive ? 'مفعّل' : 'تفعيل'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardAppearance;
