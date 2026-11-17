import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import { BannerStrip, BannerFeature } from '../components/home/PromoBanner';
import ProductCard from '../components/products/ProductCard';
import { productsApi, cmsApi } from '../services/api';
import { Sparkles, ShieldCheck, Truck, Gift, CreditCard } from 'lucide-react';

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
    const [bestsellers, setBestsellers] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hpcSections, setHpcSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, bestRes, bannerRes, catRes, hpcRes] = await Promise.all([
                    productsApi.getAll({ is_featured: true }),
                    productsApi.getAll({ is_bestseller: true }),
                    cmsApi.getBanners(),
                    productsApi.getCategories(),
                    cmsApi.getHPC()
                ]);
                setProducts(prodRes.data.results || prodRes.data || []);
                setBestsellers(bestRes.data.results || bestRes.data || []);
                setBanners((bannerRes.data.results || bannerRes.data || []).filter(b => b.is_active));
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

    const topBanners = banners.filter(b => b.position === 'home_top');
    const middleBanners = banners.filter(b => b.position === 'home_middle');

    const sectionRenderers = {
        features: (section) => {
            const features = section.content || [
                { title: 'عطور أصلية 100%', desc: 'من مصادرها الرسمية' },
                { title: 'تقسيمات تناسبك', desc: 'جرّب قبل الزجاجة الكاملة' },
                { title: 'توصيل لكل ليبيا', desc: 'الدفع بالتحويل عند الطلب' },
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
                            <div className="aspect-square overflow-hidden bg-[var(--t-img)] rounded-[var(--t-radius)]">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name_ar} loading="lazy" className="w-full h-full object-contain p-3 md:p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]" />
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
            const items = bestsellers;
            return items.length > 0 && (
                <section key="best_sellers" className="t-container pt-12 md:pt-20">
                    <SectionHeading title={section.content?.heading || 'الأكثر مبيعاً'} linkText={section.content?.button_text || 'عرض الكل'} linkTo={section.content?.button_link || '/products'} />
                    <ProductGrid items={items.slice(0, 4)} />
                </section>
            );
        },
        featured_products: (section) => (
            <section key="featured_products" className="t-container pt-12 md:pt-20">
                <SectionHeading title={section.content?.heading || 'عطور مختارة لك'} linkText={section.content?.button_text || 'عرض الكل'} linkTo={section.content?.button_link || '/products'} />
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-[var(--t-surface)] animate-pulse rounded-[var(--t-radius)]" />)}
                    </div>
                ) : (
                    <ProductGrid items={products.slice(0, 8)} />
                )}
            </section>
        ),
        banner: () => middleBanners.length > 0 && (
            <section key="banner" className="pt-12 md:pt-20">
                <div className="t-container space-y-6">
                    {middleBanners.map(banner => <BannerFeature key={banner.id} banner={banner} />)}
                </div>
            </section>
        ),
        payment_notice: (section) => section.content?.heading && (
            <section key="payment_notice" className="border-b border-[var(--t-line)] bg-[var(--t-surface)]">
                <div className="t-container py-4 md:py-5 flex items-center justify-center gap-3 text-center">
                    <CreditCard size={22} strokeWidth={1.5} className="text-[var(--t-accent)] shrink-0" />
                    <div>
                        <p className="text-[15px] md:text-base font-medium text-[var(--t-ink)]">{section.content.heading}</p>
                        {section.content.description && <p className="text-xs md:text-sm text-[var(--t-muted)] mt-0.5">{section.content.description}</p>}
                    </div>
                </div>
            </section>
        ),
        ramadan: (section) => section.content?.heading && (
            <section key="ramadan" className="t-container pt-12 md:pt-20">
                <div className="bg-[var(--t-surface)] rounded-[var(--t-radius)] px-6 py-12 md:py-16 text-center">
                    <h2 className="t-head text-3xl md:text-5xl text-[var(--t-ink)] mb-4">{section.content.heading}</h2>
                    {section.content.subtitle && <p className="text-[var(--t-muted)] md:text-lg max-w-2xl mx-auto">{section.content.subtitle}</p>}
                    {section.content.button_text && (
                        <Link to={section.content.button_link || '/products'} className="t-btn mt-8">{section.content.button_text}</Link>
                    )}
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
                    <Link to={section.content?.button_link || '/about'} className="t-btn-outline mt-8">{section.content?.button_text || 'قصتنا'}</Link>
                </div>
            </section>
        )
    };

    const sections = !loading && hpcSections.length === 0 ? DEFAULT_SECTIONS : hpcSections;

    return (
        <div className="overflow-x-hidden">
            <Hero />
            <BannerStrip banners={topBanners} className="t-container pt-6 md:pt-10" />

            {sections.map(section => {
                if (!section.is_active) return null;
                const renderer = sectionRenderers[section.key];
                return renderer ? renderer(section) : null;
            })}
        </div>
    );
};

export default Home;
