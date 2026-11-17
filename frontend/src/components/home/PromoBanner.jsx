import { Link } from 'react-router-dom';

const BannerLink = ({ to, children, className }) => {
    if (!to) return <div className={className}>{children}</div>;
    return /^https?:\/\//.test(to)
        ? <a href={to} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
        : <Link to={to} className={className}>{children}</Link>;
};

// A wide advertising image (top of the home page, top of the products page, or the filter sidebar).
// The whole picture opens the banner's link when it has one.
export const BannerStrip = ({ banners, className = '' }) => {
    if (!banners?.length) return null;
    return (
        <div className={`space-y-4 ${className}`}>
            {banners.map(banner => (
                <BannerLink key={banner.id} to={banner.link} className="block overflow-hidden rounded-[var(--t-radius)] bg-[var(--t-surface)]">
                    <img src={banner.image} alt={banner.title || ''} loading="lazy" className="w-full h-auto block" />
                </BannerLink>
            ))}
        </div>
    );
};

// The "advertising banner" home section: picture on one side, title and button on the other.
export const BannerFeature = ({ banner }) => (
    <div className="grid md:grid-cols-2 items-center gap-6 md:gap-12 bg-[var(--t-surface)] rounded-[var(--t-radius)] overflow-hidden">
        <div className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px] bg-[var(--t-img)]">
            <img src={banner.image} className="w-full h-full object-contain p-6 mix-blend-multiply" alt={banner.title || ''} loading="lazy" />
        </div>
        <div className="p-6 pt-0 md:p-12">
            {banner.title && <h2 className="t-head text-3xl md:text-5xl text-[var(--t-ink)] leading-tight mb-5">{banner.title}</h2>}
            <BannerLink to={banner.link || '/products'} className="t-btn">اكتشف الآن</BannerLink>
        </div>
    </div>
);
