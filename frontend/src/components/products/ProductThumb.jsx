import { useState } from 'react';
import bottleIcon from '../../assets/logo.png';

// Small product photo for the cart and checkout. Shows the bottle icon when there is no
// photo or it fails to load, instead of an empty box.
const ProductThumb = ({ src, alt = '' }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <img src={bottleIcon} alt="" className="w-1/3 opacity-20" />
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="w-full h-full object-contain p-1 mix-blend-multiply"
        />
    );
};

export default ProductThumb;
