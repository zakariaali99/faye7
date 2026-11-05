import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Crown, Shuffle } from 'lucide-react';
import { staffUsersApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const emptyForm = { username: '', first_name: '', email: '', password: '', is_superuser: false, is_active: true };

const inputClass = 'w-full bg-cream-50 dark:bg-dark-700 border border-gold-200 dark:border-dark-600 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-gold-500/20 outline-none text-sm font-bold text-text-primary dark:text-cream-50 transition-all placeholder:text-text-muted/50';
const labelClass = 'block text-[11px] font-black text-text-secondary dark:text-gold-400 mb-2 tracking-wider';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ar-LY', { year: 'numeric', month: 'short', day: 'numeric' }) : 'لم يدخل بعد');

// A readable random password the owner can copy and hand over.
const generatePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint32Array(12));
    return Array.from(bytes, (n) => chars[n % chars.length]).join('');
};

const firstError = (data) => {
    if (!data) return null;
    if (typeof data.error === 'string') return data.error;
    const value = Object.values(data)[0];
    return Array.isArray(value) ? value[0] : typeof value === 'string' ? value : null;
};

const DashboardUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const me = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await staffUsersApi.list();
            setUsers(res.data.results || res.data || []);
        } catch (err) {
            toast.error(err.response?.status === 403 ? 'إدارة المستخدمين للمالك فقط' : 'فشل في جلب المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        setCurrentUser(user);
        setFormData(user ? { ...emptyForm, username: user.username, first_name: user.first_name, email: user.email, is_superuser: user.is_superuser, is_active: user.is_active } : emptyForm);
        setShowPassword(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUser(null);
        setFormData(emptyForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { ...formData };
        if (currentUser && !data.password) delete data.password;
        setSaving(true);
        try {
            if (currentUser) {
                await staffUsersApi.update(currentUser.id, data);
                toast.success('تم تحديث المستخدم');
            } else {
                await staffUsersApi.create(data);
                toast.success('تمت إضافة المستخدم');
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            toast.error(firstError(err.response?.data) || 'حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`حذف المستخدم «${user.username}» نهائياً؟ لإيقافه مؤقتاً استخدم «تعديل» وأوقف الحساب.`)) return;
        try {
            await staffUsersApi.delete(user.id);
            toast.success('تم حذف المستخدم');
            fetchUsers();
        } catch (err) {
            toast.error(firstError(err.response?.data) || 'فشل في حذف المستخدم');
        }
    };

    if (loading) return <div className="p-8">جاري التحميل...</div>;

    const editingSelf = currentUser && me && currentUser.id === me.id;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-cream-50">المستخدمون</h1>
                    <p className="text-sm text-gray-500 dark:text-gold-400 mt-1">من يستطيع الدخول إلى لوحة التحكم وإدارة المتجر</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-600 text-white px-6 py-3 rounded-xl hover:bg-gold-700 transition-colors shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    <span>إضافة مستخدم</span>
                </button>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 shadow-sm overflow-hidden text-right">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-0">
                        <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-100 dark:border-dark-600">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">المستخدم</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الصلاحية</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50 hidden md:table-cell">آخر دخول</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الحالة</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                                    <td className="px-4 md:px-6 py-4">
                                        <p className="font-bold text-gray-900 dark:text-cream-50 text-sm md:text-base">
                                            {user.first_name || user.username}
                                            {me?.id === user.id && <span className="text-xs font-normal text-gray-400 mr-2">(أنت)</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gold-400 font-poppins" dir="ltr">{user.username}</p>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        {user.is_superuser ? (
                                            <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400">
                                                <Crown size={12} /> مالك
                                            </span>
                                        ) : (
                                            <span className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gold-400">موظف</span>
                                        )}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-sm text-gray-500 dark:text-gold-400 hidden md:table-cell">{formatDate(user.last_login)}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                            {user.is_active ? 'نشط' : 'موقوف'}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                title="تعديل"
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {me?.id !== user.id && (
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    title="حذف"
                                                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gold-400 space-y-1">
                <p><strong className="text-gray-700 dark:text-cream-50">الموظف:</strong> يدير المنتجات والطلبات والعملاء والمحتوى والإعدادات.</p>
                <p><strong className="text-gray-700 dark:text-cream-50">المالك:</strong> كل ما سبق، ويضيف المستخدمين ويوقفهم.</p>
            </div>

            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <Modal.Header title={currentUser ? 'تعديل المستخدم' : 'إضافة مستخدم'} subtitle="Team" onClose={handleCloseModal} />
                <Modal.Body>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={labelClass}>الاسم</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                placeholder="مثال: أحمد"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>اسم المستخدم (للدخول)</label>
                                <input
                                    type="text"
                                    required
                                    dir="ltr"
                                    autoCapitalize="none"
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.trim() })}
                                    placeholder="ahmed"
                                    className={`${inputClass} font-poppins text-left`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>البريد (اختياري)</label>
                                <input
                                    type="email"
                                    dir="ltr"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`${inputClass} font-poppins text-left`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>{currentUser ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور'}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required={!currentUser}
                                    dir="ltr"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`${inputClass} font-poppins text-left pr-24`}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => { setFormData({ ...formData, password: generatePassword() }); setShowPassword(true); }}
                                        title="توليد كلمة مرور"
                                        aria-label="توليد كلمة مرور"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-dark-600"
                                    >
                                        <Shuffle size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        title={showPassword ? 'إخفاء' : 'إظهار'}
                                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-gold-600 hover:bg-gold-50 dark:hover:bg-dark-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-text-muted mt-1.5">8 أحرف على الأقل، ولا تكون أرقاماً فقط. انسخها وسلّمها للمستخدم.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center gap-3 p-3 bg-cream-50 dark:bg-dark-700 rounded-2xl border border-gold-200 dark:border-dark-600 ${editingSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    disabled={editingSelf}
                                    checked={formData.is_superuser}
                                    onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                    className="w-4 h-4 accent-gold-600"
                                />
                                <span className="text-sm font-bold text-text-primary dark:text-cream-50">مالك (يدير المستخدمين)</span>
                            </label>
                            <label className={`flex items-center gap-3 p-3 bg-cream-50 dark:bg-dark-700 rounded-2xl border border-gold-200 dark:border-dark-600 ${editingSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input
                                    type="checkbox"
                                    disabled={editingSelf}
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 accent-gold-600"
                                />
                                <span className="text-sm font-bold text-text-primary dark:text-cream-50">الحساب نشط</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gold-600 text-white py-3.5 rounded-2xl font-black text-sm hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20 active:scale-[0.98] disabled:opacity-60"
                        >
                            {currentUser ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default DashboardUsers;
