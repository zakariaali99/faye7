import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi } from '../../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// Opens links to other sites in a new tab and store links inside the app.
const SlideLink = ({ to, children, ...props }) => (
    /^https?:\/\//.test(to)
        ? <a href={to} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
        : <Link to={to} {...props}>{children}</Link>
);

// Shopify-style image banner: a large photo with a short heading and one button.
const Hero = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await cmsApi.getSlides();
                // An admin's browser gets every slide from the API, so keep only the live ones here too.
                const now = new Date();
                setSlides((res.data.results || res.data || []).filter(slide =>
                    slide.is_active &&
                    (!slide.start_date || new Date(slide.start_date) <= now) &&
                    (!slide.end_date || new Date(slide.end_date) >= now)));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    if (loading) {
        return <section className="h-[60svh] md:h-[72vh] bg-[var(--t-surface)] animate-pulse" />;
    }

    if (slides.length === 0) {
        return (
            <section className="bg-[var(--t-surface)]">
                <div className="t-container py-20 md:py-32 text-center">
                    <h1 className="t-head text-4xl md:text-6xl text-[var(--t-ink)] mb-4">عطور أصلية بتقسيمات تناسبك</h1>
                    <p className="text-[var(--t-muted)] text-lg mb-8">اختر عطرك المفضل وجرّبه قبل شراء الزجاجة كاملة.</p>
                    <Link to="/products" className="t-btn">تسوق الآن</Link>
                </div>
            </section>
        );
    }

    const hasPortrait = slides.some(slide => slide.image_mobile);

    return (
        <section className={`relative ${hasPortrait ? 'h-[78svh]' : 'h-[60svh]'} md:h-[72vh] overflow-hidden bg-[var(--t-dark)]`}>
            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={slides.length > 1}
                className="h-full w-full hero-swiper"
            >
                {slides.map((slide, index) => {
                    const hasText = slide.title || slide.subtitle || slide.description_ar || slide.button_text;
                    return (
                        <SwiperSlide key={slide.id || index} className="relative">
                            <img src={slide.image} className="hidden md:block absolute inset-0 w-full h-full object-cover" alt={slide.title || ''} />
                            <img src={slide.image_mobile || slide.image} className="md:hidden absolute inset-0 w-full h-full object-cover" alt={slide.title || ''} />

                            {/* A link without button text makes the whole picture clickable. */}
                            {!slide.button_text && slide.button_link && (
                                <SlideLink to={slide.button_link} className="absolute inset-0 z-20" aria-label={slide.title || 'عرض'} />
                            )}

                            {hasText && (
                                <>
                                    <div className="absolute inset-0 bg-black/35" />
                                    <div className="relative z-10 h-full t-container flex items-center justify-center text-center">
                                        <div className="max-w-2xl text-white">
                                            {slide.subtitle && <p className="text-sm md:text-base mb-3 opacity-90">{slide.subtitle}</p>}
                                            {slide.title && <h1 className="t-head text-4xl sm:text-5xl md:text-6xl leading-tight mb-5">{slide.title}</h1>}
                                            {slide.description_ar && (
                                                <p className="text-base md:text-lg opacity-90 mb-8 leading-relaxed">{slide.description_ar}</p>
                                            )}
                                            {slide.button_text && (
                                                <SlideLink
                                                    to={slide.button_link || '/products'}
                                                    className="inline-flex items-center justify-center bg-white text-[#121212] border border-white rounded-[var(--t-radius-btn)] px-8 py-3.5 text-[15px] font-medium hover:bg-transparent hover:text-white transition-colors"
                                                >
                                                    {slide.button_text}
                                                </SlideLink>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            <style>{`
                .hero-swiper .swiper-pagination-bullet { background: #fff !important; opacity: .5; margin-bottom: 1rem !important; }
                .hero-swiper .swiper-pagination-bullet-active { opacity: 1; }
            `}</style>
        </section>
    );
};

export default Hero;
