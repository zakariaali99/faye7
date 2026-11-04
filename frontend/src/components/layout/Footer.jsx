import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { PHONE, EMAIL, SocialIcons } from './social';
import Logo from '../common/Logo';

const Footer = () => {
    return (
        <footer className="mt-16 md:mt-24 border-t border-[var(--t-line)] bg-[var(--t-surface)] text-[var(--t-ink)]">
            <div className="t-container py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                    <div className="md:col-span-2">
                        <Logo className="h-10 w-auto mb-4" />
                        <p className="text-[var(--t-muted)] leading-relaxed max-w-md mb-6">
                            تقسيمات العطور من مكتبتي الخاصة،
                            <br />
                            حتا لو ماشريتش كسبنا شوفتك و تعال اشري مره تانية….
                        </p>
                        <SocialIcons />
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-4">روابط سريعة</h3>
                        <ul className="space-y-2.5 text-[var(--t-muted)] text-[15px]">
                            <li><Link to="/products" className="hover:text-[var(--t-ink)] hover:underline underline-offset-4">كل العطور</Link></li>
                            <li><Link to="/about" className="hover:text-[var(--t-ink)] hover:underline underline-offset-4">من نحن</Link></li>
                            <li><Link to="/contact" className="hover:text-[var(--t-ink)] hover:underline underline-offset-4">اتصل بنا</Link></li>
                            <li><Link to="/track" className="hover:text-[var(--t-ink)] hover:underline underline-offset-4">تتبع طلبك</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-4">تواصل معنا</h3>
                        <ul className="space-y-3 text-[var(--t-muted)] text-[15px]">
                            <li className="flex items-center gap-2.5"><MapPin size={16} strokeWidth={1.5} /> مصراتة، ليبيا</li>
                            <li className="flex items-center gap-2.5"><Phone size={16} strokeWidth={1.5} /> <a href={`tel:${PHONE}`} dir="ltr">{PHONE}</a></li>
                            <li className="flex items-center gap-2.5"><Mail size={16} strokeWidth={1.5} /> <a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-[var(--t-line)]">
                <div className="t-container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[var(--t-muted)]">
                    <p>&copy; 2026 عطور فايح · جميع الحقوق محفوظة</p>
                    <div className="flex gap-5">
                        <Link to="/terms" className="hover:text-[var(--t-ink)]">الشروط والأحكام</Link>
                        <Link to="/privacy" className="hover:text-[var(--t-ink)]">سياسة الخصوصية</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
