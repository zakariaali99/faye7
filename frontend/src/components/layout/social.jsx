import { Instagram, Youtube, MessageCircle } from 'lucide-react';

export const PHONE = '0917359191';
export const EMAIL = 'info@faye7.ly';

export const TikTokIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-1.26-.88-2.12-2.22-2.49-3.66L15.8 20.06c-.05 1.05-.34 2.1-.9 3.01-.55.91-1.39 1.62-2.34 2.05-1.01.46-2.15.58-3.23.41-1.12-.17-2.18-.7-3.03-1.45-.85-.75-1.41-1.78-1.57-2.9-.16-1.12.01-2.3.56-3.29.54-1 1.41-1.79 2.45-2.22 1.04-.43 2.2-.44 3.28-.1v4.19c-.91-.32-1.95-.21-2.73.35-.78.56-1.16 1.55-1.02 2.51.14.96.84 1.78 1.75 2.1.91.31 2.01.07 2.66-.64.65-.7.83-1.72.63-2.65L12.7 0h-.175z" />
    </svg>
);

export const SOCIAL_LINKS = [
    { label: 'واتساب', href: 'https://wa.me/218917359191', Icon: MessageCircle },
    { label: 'إنستغرام', href: 'https://www.instagram.com/faye7.perfumes?igsh=MXVnejh4d25qMjV4ZQ==', Icon: Instagram },
    { label: 'تيك توك', href: 'https://www.tiktok.com/@faye7perfumes?_r=1&_t=ZS-943SX1wYWer', Icon: TikTokIcon },
    { label: 'يوتيوب', href: 'https://m.youtube.com/@faye7perfumes?si=3KH5kj2c5Q47rVYB', Icon: Youtube },
];

export const SocialIcons = ({ className = '' }) => (
    <div className={`flex items-center gap-4 ${className}`}>
        {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:opacity-70 transition-opacity">
                <Icon size={20} strokeWidth={1.5} />
            </a>
        ))}
    </div>
);
