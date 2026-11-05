import bottleIcon from '../../assets/logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountsApi } from '../../services/api';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Logo from '../../components/common/Logo';

const inputClass = 'w-full bg-white dark:bg-dark-700 border border-gold-200 dark:border-dark-600 px-4 py-3.5 rounded-xl text-[15px] text-text-primary dark:text-cream-50 placeholder:text-text-muted/60 focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition';

const DashboardLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await accountsApi.login(credentials);
            // Only dashboard team members get in; a shopper account is turned away here, not after a redirect.
            if (!res.data.user?.is_staff) {
                setError('هذا الحساب لا يملك صلاحية الدخول إلى لوحة التحكم');
                return;
            }
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success(`أهلاً ${res.data.user.first_name || res.data.user.username}`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-cream-50 dark:bg-dark-900" dir="rtl">
            {/* Brand side: desktop only */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-gold-100 via-cream-50 to-gold-50 dark:from-dark-800 dark:via-dark-800 dark:to-dark-700 text-text-primary dark:text-cream-50">
                <Logo className="h-10 w-auto self-start" />
                <div className="max-w-sm">
                    <img src={bottleIcon} alt="" className="w-16 mb-8 opacity-80" />
                    <p className="text-3xl leading-snug font-bold mb-3">كل شيء في متجرك، من مكان واحد.</p>
                    <p className="text-text-secondary dark:text-gold-400 leading-relaxed">المنتجات والطلبات والعملاء ومظهر المتجر.</p>
                </div>
                <p className="text-xs text-text-muted dark:text-gold-500">© 2026 عطور فايح</p>
            </div>

            {/* Form side */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <Logo className="h-9 w-auto mb-10 lg:hidden text-text-primary dark:text-cream-50" />

                    <h1 className="text-2xl font-bold text-text-primary dark:text-cream-50 mb-1.5">مرحباً بعودتك</h1>
                    <p className="text-text-secondary dark:text-gold-400 mb-8">سجّل دخولك لإدارة المتجر</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div role="alert" className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-rose-600 dark:text-rose-400 text-sm">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-sm font-medium text-text-secondary dark:text-gold-400">اسم المستخدم</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                required
                                autoFocus
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                dir="ltr"
                                value={credentials.username}
                                onChange={handleChange}
                                className={`${inputClass} text-left`}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-text-secondary dark:text-gold-400">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    dir="ltr"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock'))}
                                    className={`${inputClass} text-left pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-dark-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {capsLock && <p className="text-xs text-amber-600">زر الأحرف الكبيرة (Caps Lock) مفعّل</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gold-600 hover:bg-gold-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60"
                        >
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : 'تسجيل الدخول'}
                        </button>
                    </form>

                    <p className="text-sm text-text-muted dark:text-gold-500 mt-8">
                        نسيت كلمة المرور؟ اطلبها من مالك المتجر.
                    </p>
                    <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-gold-400 hover:text-gold-600 mt-3">
                        <ArrowRight size={16} />
                        العودة إلى المتجر
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardLogin;
