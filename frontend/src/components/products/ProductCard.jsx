import { useState } from 'react';
import { Link } from 'react-router-dom';
import bottleIcon from '../../assets/logo.png';

const genderLabel = { men: 'رجالي', women: 'نسائي' };

// Shopify-style card: the photo on a soft background, then brand, name and price. No box around it.
const ProductCard = ({ product }) => {
    const badge = product.is_new ? 'جديد' : product.is_bestseller ? 'الأكثر مبيعاً' : null;
    const [imageFailed, setImageFailed] = useState(false);
    const hasImage = product.main_image && !imageFailed;

    return (
        <Link to={`/product/${product.id}`} className="group block text-[var(--t-ink)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--t-img)] rounded-[var(--t-radius)]">
                {hasImage ? (
                    <img
                        src={product.main_image}
                        alt={product.name_ar}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="w-full h-full object-contain p-3 md:p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src={bottleIcon} alt="" className="w-1/4 opacity-15" />
                    </div>
                )}
                {badge && (
                    <span className="absolute top-3 right-3 bg-[var(--t-bg)] text-[var(--t-ink)] text-[11px] px-2.5 py-1 rounded-[var(--t-radius-btn)] border border-[var(--t-line)]">
                        {badge}
                    </span>
                )}
            </div>

            <div className="pt-3 md:pt-4 space-y-1">
                <p className="text-xs text-[var(--t-muted)]">
                    {[product.brand?.name_ar, genderLabel[product.gender] || 'للجنسين'].filter(Boolean).join(' · ')}
                </p>
                <h3 className="text-[15px] md:text-base leading-snug line-clamp-2 group-hover:underline underline-offset-4">
                    {product.name_ar}
                </h3>
                {product.min_price != null && (
                    <p className="text-[15px] text-[var(--t-ink)]">
                        <span className="text-[var(--t-muted)] text-xs ml-1">من</span>
                        {product.min_price} د.ل
                    </p>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
