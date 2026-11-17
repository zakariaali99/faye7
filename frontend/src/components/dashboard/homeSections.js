// What each home page section shows and which of its texts the admin can edit.
// Sections with `list` hold a list of items (features, stats); the others hold one set of texts.
export const HOME_SECTIONS = {
    payment_notice: {
        label: 'رسالة طريقة الدفع',
        fields: [
            { key: 'heading', label: 'النص الرئيسي' },
            { key: 'description', label: 'نص إضافي (اختياري)', textarea: true },
        ],
    },
    features: {
        label: 'المميزات',
        list: [
            { key: 'title', label: 'العنوان' },
            { key: 'desc', label: 'الوصف' },
        ],
        addLabel: 'إضافة ميزة',
    },
    stats: {
        label: 'الإحصائيات',
        list: [
            { key: 'value', label: 'الرقم' },
            { key: 'label', label: 'الوصف' },
        ],
        addLabel: 'إضافة رقم',
    },
    banner: {
        label: 'البانر الإعلاني',
        note: 'الصورة والعنوان والرابط تأتي من تبويب «البانرات»، من البانرات التي مكانها «الرئيسية - وسط».',
        fields: [],
    },
    best_sellers: {
        label: 'الأكثر مبيعاً',
        fields: [
            { key: 'heading', label: 'العنوان' },
            { key: 'button_text', label: 'نص الرابط', placeholder: 'عرض الكل' },
            { key: 'button_link', label: 'رابط «عرض الكل»', placeholder: '/products', ltr: true },
        ],
    },
    featured_products: {
        label: 'عطور مختارة',
        fields: [
            { key: 'heading', label: 'العنوان' },
            { key: 'button_text', label: 'نص الرابط', placeholder: 'عرض الكل' },
            { key: 'button_link', label: 'رابط «عرض الكل»', placeholder: '/products', ltr: true },
        ],
    },
    categories: {
        label: 'الفئات',
        fields: [{ key: 'heading', label: 'العنوان' }],
    },
    vision: {
        label: 'رؤيتنا',
        fields: [
            { key: 'quote', label: 'المقولة', textarea: true },
            { key: 'description', label: 'الوصف', textarea: true },
            { key: 'button_text', label: 'نص الزر', placeholder: 'قصتنا' },
            { key: 'button_link', label: 'رابط الزر', placeholder: '/about', ltr: true },
        ],
    },
    ramadan: {
        label: 'المناسبات',
        fields: [
            { key: 'heading', label: 'العنوان' },
            { key: 'subtitle', label: 'العنوان الفرعي', textarea: true },
            { key: 'button_text', label: 'نص الزر' },
            { key: 'button_link', label: 'رابط الزر', placeholder: '/products', ltr: true },
        ],
    },
};

// Turns stored content into the shape the form edits: an array for list sections, an object otherwise.
export const contentForForm = (sectionKey, content) => {
    const config = HOME_SECTIONS[sectionKey];
    if (config?.list) return Array.isArray(content) ? content.map(item => ({ ...item })) : [];
    const values = content && !Array.isArray(content) ? content : {};
    const form = {};
    (config?.fields || []).forEach(({ key }) => { form[key] = values[key] || ''; });
    return form;
};

// Drops empty list rows before saving.
export const contentForSave = (sectionKey, content) => {
    const config = HOME_SECTIONS[sectionKey];
    if (config?.list) return content.filter(item => config.list.some(({ key }) => (item[key] || '').trim()));
    return content;
};
