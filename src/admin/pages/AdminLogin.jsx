import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShield, FiArrowRight, FiKey } from 'react-icons/fi';
import Input from '../../components/common/Input';
import { useNotification } from '../../contexts/NotificationContext';
import { adminLogin, adminLoginOtp, hasAdmin } from '../adminApi';

// Admin login — step 1 of the MFA flow. Picks between:
//   Option A: username/email + password  → mfaToken
//   Option B: email + OTP (sent)         → mfaToken
// The unique Admin Code is collected in the second step (MfaVerify).
export default function AdminLogin() {
  const navigate = useNavigate();
  const { success, error: toastError } = useNotification();
  const [method, setMethod] = useState('password+code');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [noAdmin, setNoAdmin] = useState(false);

  useEffect(() => { hasAdmin().then((r) => { if (!r.data.exists) setNoAdmin(true); }); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (method === 'password+code') {
        const res = await adminLogin({ email, password });
        navigate(`/admin/login/verify?mfaToken=${res.data.mfaToken}&method=password+code`);
      } else {
        const res = await adminLoginOtp({ email });
        // Mock surfaces the OTP; production delivers it via email.
        success(`OTP sent to ${email}${res.data.otp ? ` (demo OTP: ${res.data.otp})` : ''}`);
        navigate(`/admin/login/verify?mfaToken=${res.data.mfaToken}&method=otp+code`);
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-violet-600 text-white shadow-lg"><FiShield className="w-6 h-6" /></span>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Console</h1>
            <p className="text-xs text-admin-400">Restricted · Single Administrator</p>
          </div>
        </div>

        <div className="rounded-2xl border border-admin-800 bg-admin-900 p-6 shadow-xl">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-admin-800/60 mb-5">
            {[
              { id: 'password+code', label: 'Password + Code' },
              { id: 'otp+code', label: 'Email OTP + Code' },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${method === m.id ? 'bg-accent-600 text-white' : 'text-admin-300 hover:text-white'}`}>
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" type="email" icon={<FiMail />} value={email} onChange={(e) => setEmail(e.target.value)} required />
            {method === 'password+code' && (
              <Input label="Password" type="password" icon={<FiLock />} value={password} onChange={(e) => setPassword(e.target.value)} showToggle required />
            )}
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-60">
              Continue <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          {noAdmin && (
            <button onClick={() => navigate('/admin/setup')} className="mt-4 w-full text-center text-xs text-accent-300 hover:text-accent-200">
              No administrator yet? Initialize one →
            </button>
          )}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-admin-500"><FiKey className="w-3.5 h-3.5" /> A unique Admin Code is required on the next step.</p>
        </div>
      </div>
    </div>
  );
}
