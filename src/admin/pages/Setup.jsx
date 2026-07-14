import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiKey, FiCheck } from 'react-icons/fi';
import Input from '../../components/common/Input';
import { useNotification } from '../../contexts/NotificationContext';
import { adminSetup, hasAdmin } from '../adminApi';

// Restricted onboarding: initializes the single, unique Administrator.
// Backend enforces that this succeeds only when zero admins exist.
export default function Setup() {
  const navigate = useNavigate();
  const { success, error: toastError } = useNotification();
  const [form, setForm] = useState({ email: '', password: '', adminCode: '', confirmCode: '', mfaMethod: 'password+code' });
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(false);

  useEffect(() => { hasAdmin().then((r) => { if (r.data.exists) { setExists(true); navigate('/admin/login', { replace: true }); } }); }, [navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.adminCode !== form.confirmCode) { toastError('Admin Codes do not match'); return; }
    if (form.adminCode.length < 6) { toastError('Admin Code must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await adminSetup(form);
      success('Administrator initialized');
      navigate('/admin/users');
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (exists) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-violet-600 text-white shadow-lg"><FiShield className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-bold text-white">Initialize Administrator</h1>
            <p className="text-xs text-admin-400">Only one administrator may exist</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-admin-800 bg-admin-900 p-6 shadow-xl space-y-4">
          <Input label="Admin Email" type="email" icon={<FiMail />} value={form.email} onChange={set('email')} required />
          <Input label="Password" type="password" icon={<FiLock />} value={form.password} onChange={set('password')} showToggle required />
          <Input label="Admin Code" type="password" icon={<FiKey />} value={form.adminCode} onChange={set('adminCode')} showToggle required hint="Min 6 chars · stored hashed" />
          <Input label="Confirm Admin Code" type="password" icon={<FiKey />} value={form.confirmCode} onChange={set('confirmCode')} showToggle required />

          <div>
            <label className="block text-sm font-medium text-admin-300 mb-1">Default MFA Method</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'password+code', label: 'Password + Code' },
                { id: 'otp+code', label: 'Email OTP + Code' },
              ].map((m) => (
                <button type="button" key={m.id} onClick={() => setForm((f) => ({ ...f, mfaMethod: m.id }))} className={`py-2 rounded-lg text-sm font-medium border transition-colors ${form.mfaMethod === m.id ? 'border-accent-500 bg-accent-600/10 text-white' : 'border-admin-700 text-admin-300'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-60">
            <FiCheck className="w-4 h-4" /> Create Administrator
          </button>
        </form>
      </div>
    </div>
  );
}
