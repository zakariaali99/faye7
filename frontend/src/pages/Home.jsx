import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import ProductCard from '../components/products/ProductCard';
import { productsApi, cmsApi } from '../services/api';
import { Sparkles, ShieldCheck, Truck, Gift } from 'lucide-react';

// Used when the dashboard has no home sections configured yet.
const DEFAULT_SECTIONS = [
    { key: 'features', is_active: true },
    { key: 'categories', is_active: true },
    { key: 'featured_products', is_active: true },
    { key: 'banner', is_active: true },
    { key: 'best_sellers', is_active: true },
    { key: 'vision', is_active: true },
];

const SectionHeading = ({ title, subtitle, linkText, linkTo }) => (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
        <div>
            <h2 className="t-head text-2xl md:text-4xl text-[var(--t-ink)]">{title}</h2>
            {subtitle && <p className="text-[var(--t-muted)] mt-2">{subtitle}</p>}
        </div>
        {linkText && (
            <Link to={linkTo} className="t-link text-sm md:text-[15px] text-[var(--t-ink)] whitespace-nowrap">{linkText}</Link>
        )}
    </div>
);

const ProductGrid = ({ items }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
        {items.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
);

const Home = () => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hpcSections, setHpcSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, bannerRes, catRes, hpcRes] = await Promise.all([
                    productsApi.getAll({ is_featured: true }),
                    cmsApi.getBanners(),
                    productsApi.getCategories(),
                    cmsApi.getHPC()
                ]);
                setProducts(prodRes.data.results || prodRes.data || []);
                setBanners(bannerRes.data.results || bannerRes.data || []);
                setCategories(catRes.data.results || catRes.data || []);

                const sortedHpc = (hpcRes.data.results || hpcRes.data || []).sort((a, b) => a.order - b.order);
                setHpcSections(sortedHpc);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sectionRenderers = {
        features: (section) => {
            const features = section.content || [
                { title: 'عطور أصلية 100%', desc: 'من مصادرها الرسمية' },
                { title: 'تقسيمات تناسبك', desc: 'جرّب قبل الزجاجة الكاملة' },
                { title: 'توصيل لكل ليبيا', desc: 'الدفع عند الاستلام' },
                { title: 'تغليف أنيق', desc: 'مثالي كهدية' }
            ];
            const icons = [ShieldCheck, Sparkles, Truck, Gift];

            return (
                <section key="features" className="border-b border-[var(--t-line)]">
                    <div className="t-container py-6 md:py-8 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
                        {features.map((feature, idx) => {
                            const Icon = icons[idx] || Sparkles;
                            return (
                                <div key={idx} className="flex items-start gap-3">
                                    <Icon size={22} strokeWidth={1.5} className="text-[var(--t-accent)] shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm md:text-[15px] font-medium text-[var(--t-ink)]">{feature.title}</h3>
                                        <p className="text-xs md:text-sm text-[var(--t-muted)] mt-0.5 line-clamp-2">{feature.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            );
        },
        categories: (section) => categories.length > 0 && (
            <section key="categories" className="t-container pt-12 md:pt-20">
                <SectionHeading title={section.content?.heading || 'تسوق حسب القسم'} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {categories.map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.id}`} className="group block">
                            <div className="aspect-square overflow-hidden bg-[var(--t-surface)] rounded-[var(--t-radius)]">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name_ar} loading="lazy" className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center t-head text-2xl md:text-3xl text-[var(--t-muted)]">{cat.name_ar}</div>
                                )}
                            </div>
                            <h3 className="mt-3 text-[15px] md:text-base text-[var(--t-ink)] flex items-center gap-1 group-hover:underline underline-offset-4">
                                {cat.name_ar} <span aria-hidden="true">←</span>
                            </h3>
                        </Link>
                    ))}
                </div>
            </section>
        ),
        best_sellers: (section) => {
            const items = products.filter(p => p.is_bestseller);
            return items.length > 0 && (
                <section key="best_sellers" className="t-container pt-12 md:pt-20">
                    <SectionHeading title={section.content?.heading || 'الأكثر مبيعاً'} linkText={section.content?.button_text || 'عرض الكل'} linkTo="/products" />
                    <ProductGrid items={items.slice(0, 4)} />
                </section>
            );
        },
        featured_products: (section) => (
            <section key="featured_products" className="t-container pt-12 md:pt-20">
                <SectionHeading title={section.content?.heading || 'عطور مختارة لك'} linkText="عرض الكل" linkTo="/products" />
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-[var(--t-surface)] animate-pulse rounded-[var(--t-radius)]" />)}
                    </div>
                ) : (
                    <ProductGrid items={products.slice(0, 8)} />
                )}
            </section>
        ),
        banner: () => banners.length > 0 && (
            <section key="banner" className="pt-12 md:pt-20">
                <div className="t-container">
                    <div className="grid md:grid-cols-2 items-center gap-6 md:gap-12 bg-[var(--t-surface)] rounded-[var(--t-radius)] overflow-hidden">
                        <div className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]">
                            <img src={banners[0].image} className="w-full h-full object-cover mix-blend-multiply" alt={banners[0].title || ''} loading="lazy" />
                        </div>
                        <div className="p-6 pt-0 md:p-12">
                            <h2 className="t-head text-3xl md:text-5xl text-[var(--t-ink)] leading-tight mb-5">{banners[0].title}</h2>
                            <Link to={banners[0].button_link || '/products'} className="t-btn">اكتشف الآن</Link>
                        </div>
                    </div>
                </div>
            </section>
        ),
        stats: (section) => {
            const stats = section.content || [
                { value: '15K+', label: 'عميل سعيد' },
                { value: '500+', label: 'عطر حصري' },
                { value: '10+', label: 'سنوات خبرة' },
                { value: '24/7', label: 'خدمة عملاء' }
            ];
            return (
                <section key="stats" className="t-container pt-12 md:pt-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[var(--t-line)] divide-x divide-x-reverse divide-[var(--t-line)]">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="py-8 text-center">
                                <p className="t-head text-3xl md:text-5xl text-[var(--t-ink)]">{stat.value}</p>
                                <p className="text-sm text-[var(--t-muted)] mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>
            );
        },
        vision: (section) => (
            <section key="vision" className="t-container pt-16 md:pt-28">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="t-head text-2xl md:text-4xl leading-snug text-[var(--t-ink)] mb-5">
                        {section.content?.quote || 'العطر هو اللغة التي لا تحتاج إلى كلمات لتخبر العالم من أنت.'}
                    </p>
                    <p className="text-[var(--t-muted)] leading-loose md:text-lg">
                        {section.content?.description || 'في بوتيك فايح، نؤمن أن العطر ليس مجرد منتج، بل هو رحلة عبر الزمن والمكان، تجسد أرقى معاني الفخامة والجمال العربي الأصيل.'}
                    </p>
                    <Link to="/about" className="t-btn-outline mt-8">قصتنا</Link>
                </div>
            </section>
        )
    };

    const sections = !loading && hpcSections.length === 0 ? DEFAULT_SECTIONS : hpcSections;

    return (
        <div className="overflow-x-hidden">
            <Hero />

            {sections.map(section => {
                if (!section.is_active) return null;
                const renderer = sectionRenderers[section.key];
                return renderer ? renderer(section) : null;
            })}
        </div>
    );
};

export default Home;
