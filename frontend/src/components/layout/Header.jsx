import logoImg from '../../assets/logo.png';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, X, Phone, ChevronDown, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useSettingsStore from '../../store/settingsStore';
import CartDrawer from '../cart/CartDrawer';
import { productsApi } from '../../services/api';
import { PHONE, SocialIcons } from './social';

const DEFAULT_BANNER = 'توصيل لكل مدن ليبيا · الدفع عند الاستلام';

const fallbackCategories = [
    { id: 1, slug: 'oriental', name_ar: 'عطور شرقية' },
    { id: 2, slug: 'oud', name_ar: 'عطور عود' },
];

const Header = () => {
    const { cart } = useCartStore();
    const settings = useSettingsStore(state => state.settings);
    const bannerText = settings ? (settings.top_banner_is_active ? settings.top_banner_text : '') : DEFAULT_BANNER;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);

    const token = localStorage.getItem('access_token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isAdmin = !!token && user?.is_staff;

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const cartItemsCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    const shownCategories = categories.length > 0 ? categories : fallbackCategories;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productsApi.getCategories();
                setCategories(res.data.results || res.data || []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
    }, [location.pathname, location.search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const isActive = (path) => {
        if (path === '#') return false;
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    const navLinks = [
        { name: 'الرئيسية', path: '/' },
        { name: 'كل العطور', path: '/products' },
        {
            name: 'الأقسام',
            path: '#',
            dropdown: shownCategories.map(c => ({ name: c.name_ar, path: `/products?category=${c.id}` }))
        },
        { name: 'تتبع الطلب', path: '/track' },
        { name: 'من نحن', path: '/about' },
        { name: 'اتصل بنا', path: '/contact' },
    ];

    return (
        <>
            {/* Announcement bar */}
            {bannerText && (
                <div className="bg-[var(--t-dark)] text-[var(--t-bg)] text-xs md:text-sm text-center py-2.5 px-4">
                    {bannerText}
                </div>
            )}

            <header className={`sticky top-0 z-[100] bg-[var(--t-bg)] border-b border-[var(--t-line)] transition-shadow ${scrolled ? 'shadow-[0_1px_12px_rgb(0_0_0/0.06)]' : ''}`}>
                <div className="t-container h-16 md:h-20 grid grid-cols-[1fr_auto_1fr] lg:flex items-center gap-4 lg:gap-10">
                    <div className="lg:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(true)} aria-label="القائمة" className="p-2 -mr-2 text-[var(--t-ink)]">
                            <Menu size={22} strokeWidth={1.5} />
                        </button>
                    </div>

                    <Link to="/" className="flex items-center gap-3 shrink-0 justify-self-center">
                        <img src={logoImg} alt="عطور فايح" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                        <span className="t-head text-lg md:text-2xl text-[var(--t-ink)] leading-none">عطور فايح</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-7 flex-1">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group/nav">
                                <Link
                                    to={link.path}
                                    onClick={(e) => link.dropdown && e.preventDefault()}
                                    className={`text-[15px] flex items-center gap-1 py-7 transition-colors ${isActive(link.path) ? 'text-[var(--t-ink)] t-link' : 'text-[var(--t-muted)] hover:text-[var(--t-ink)]'}`}
                                >
                                    {link.name}
                                    {link.dropdown && <ChevronDown size={14} />}
                                </Link>

                                {link.dropdown && (
                                    <div className="absolute top-full -right-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-opacity">
                                        <div className="bg-[var(--t-bg)] min-w-52 border border-[var(--t-line)] py-3 shadow-[0_8px_24px_rgb(0_0_0/0.06)]">
                                            {link.dropdown.map(item => (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    className="block px-5 py-2 text-sm text-[var(--t-muted)] hover:text-[var(--t-ink)] hover:underline underline-offset-4"
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="flex items-center justify-end gap-1 md:gap-2 text-[var(--t-ink)]">
                        <button onClick={() => setIsSearchOpen(true)} aria-label="بحث" className="p-2 hover:opacity-70">
                            <Search size={21} strokeWidth={1.5} />
                        </button>
                        {isAdmin && (
                            <Link to="/dashboard" aria-label="لوحة التحكم" className="hidden md:block p-2 hover:opacity-70">
                                <User size={21} strokeWidth={1.5} />
                            </Link>
                        )}
                        <button onClick={() => setIsCartOpen(true)} aria-label="السلة" className="relative p-2 hover:opacity-70">
                            <ShoppingBag size={21} strokeWidth={1.5} />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-0.5 left-0.5 bg-[var(--t-btn)] text-[var(--t-btn-ink)] text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium">
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-x-0 top-0 h-full bg-[var(--t-bg)] border-b border-[var(--t-line)]"
                        >
                            <form onSubmit={handleSearchSubmit} className="t-container h-full flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-3 border border-[var(--t-ink)] rounded-[var(--t-radius-btn)] px-4 h-11 max-w-3xl mx-auto">
                                    <Search size={18} strokeWidth={1.5} className="text-[var(--t-muted)]" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ابحث عن عطر أو ماركة"
                                        className="w-full bg-transparent outline-none text-[15px] text-[var(--t-ink)] placeholder:text-[var(--t-muted)]"
                                    />
                                </div>
                                <button type="button" onClick={() => setIsSearchOpen(false)} aria-label="إغلاق" className="p-2 text-[var(--t-ink)]">
                                    <X size={22} strokeWidth={1.5} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/40"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.25 }}
                            className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-[var(--t-bg)] flex flex-col"
                            dir="rtl"
                        >
                            <div className="h-16 px-5 border-b border-[var(--t-line)] flex justify-between items-center">
                                <span className="t-head text-lg text-[var(--t-ink)]">عطور فايح</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="إغلاق" className="p-2 -ml-2 text-[var(--t-ink)]">
                                    <X size={22} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <nav className="py-2">
                                    {navLinks.filter(l => !l.dropdown).map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={`flex items-center justify-between px-5 py-3.5 text-base text-[var(--t-ink)] ${isActive(link.path) ? 'font-medium' : ''}`}
                                        >
                                            {link.name}
                                            <ChevronLeft size={16} strokeWidth={1.5} className="text-[var(--t-muted)]" />
                                        </Link>
                                    ))}
                                </nav>

                                <div className="border-t border-[var(--t-line)] py-2">
                                    <p className="px-5 pt-3 pb-1 text-xs text-[var(--t-muted)]">الأقسام</p>
                                    {shownCategories.map(item => (
                                        <Link
                                            key={item.id}
                                            to={`/products?category=${item.id}`}
                                            className="flex items-center justify-between px-5 py-3 text-[15px] text-[var(--t-ink)]"
                                        >
                                            {item.name_ar}
                                            <ChevronLeft size={16} strokeWidth={1.5} className="text-[var(--t-muted)]" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-[var(--t-line)] bg-[var(--t-surface)] px-5 py-5 space-y-4 text-[var(--t-ink)]">
                                {isAdmin && (
                                    <Link to="/dashboard" className="flex items-center gap-2 text-sm">
                                        <User size={18} strokeWidth={1.5} /> لوحة التحكم
                                    </Link>
                                )}
                                <a href={`tel:${PHONE}`} className="flex items-center gap-2 text-sm">
                                    <Phone size={18} strokeWidth={1.5} /> <span dir="ltr">{PHONE}</span>
                                </a>
                                <SocialIcons />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default Header;
