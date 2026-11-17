import { Plus, Trash2 } from 'lucide-react';
import { HOME_SECTIONS } from './homeSections';

const inputClass = 'w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50';
const labelClass = 'text-sm font-bold text-text-secondary dark:text-gold-400';

const Field = ({ field, value, onChange }) => (
    <div className="space-y-2">
        <label className={labelClass}>{field.label}</label>
        {field.textarea ? (
            <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={`${inputClass} h-24 resize-none`} />
        ) : (
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} dir={field.ltr ? 'ltr' : undefined} className={`${inputClass} ${field.ltr ? 'text-sm text-left' : ''}`} />
        )}
    </div>
);

const HomeSectionFields = ({ sectionKey, content, setContent }) => {
    const config = HOME_SECTIONS[sectionKey];
    if (!config) {
        return <p className={`${labelClass} bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl`}>هذا القسم ليس له نصوص قابلة للتعديل.</p>;
    }

    if (config.list) {
        const updateItem = (idx, key, value) => setContent(content.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
        const emptyItem = Object.fromEntries(config.list.map(({ key }) => [key, '']));
        return (
            <div className="space-y-4">
                {content.map((item, idx) => (
                    <div key={idx} className="flex items-end gap-3 p-4 bg-cream-50/60 dark:bg-dark-800 rounded-2xl border border-gold-100 dark:border-dark-600">
                        <div className="flex-1 grid sm:grid-cols-2 gap-3">
                            {config.list.map(field => (
                                <Field key={field.key} field={field} value={item[field.key] || ''} onChange={(v) => updateItem(idx, field.key, v)} />
                            ))}
                        </div>
                        <button type="button" onClick={() => setContent(content.filter((_, i) => i !== idx))} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl" title="حذف">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => setContent([...content, emptyItem])} className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-bold text-sm">
                    <Plus size={18} /> {config.addLabel}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {config.note && <p className={`${labelClass} bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-100 dark:border-dark-600`}>{config.note}</p>}
            {config.fields.map(field => (
                <Field key={field.key} field={field} value={content[field.key] || ''} onChange={(v) => setContent({ ...content, [field.key]: v })} />
            ))}
        </div>
    );
};

export default HomeSectionFields;
