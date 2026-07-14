import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiShield, FiKey, FiMail, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Input from '../../components/common/Input';
import { useNotification } from '../../contexts/NotificationContext';
import { adminLoginVerify, adminLoginOtpVerify } from '../adminApi';

// Admin login — step 2 (MFA challenge). Collects the unique Admin Code and,
// for Option B, the email OTP. Exchanges the mfaToken for a full admin session.
export default function MfaVerify() {
  const navigate = useNavigate();
  const { success, error: toastError } = useNotification();
  const [params] = useSearchParams();
  const mfaToken = params.get('mfaToken');
  const method = params.get('method') || 'password+code';

  const [adminCode, setAdminCode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (method === 'password+code') {
        await adminLoginVerify({ mfaToken, adminCode });
      } else {
        await adminLoginOtpVerify({ mfaToken, otp, adminCode });
      }
      success('Admin authenticated');
      navigate('/admin/users');
    } catch (err) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-950 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-admin-800 bg-admin-900 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-600/20 text-accent-300"><FiShield className="w-5 h-5" /></span>
            <div>
              <h1 className="text-lg font-bold text-white">Multi-Factor Verification</h1>
              <p className="text-xs text-admin-400">{method === 'otp+code' ? 'Option B · Email OTP + Admin Code' : 'Option A · Password + Admin Code'}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {method === 'otp+code' && (
              <Input label="Email OTP" icon={<FiMail />} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" required />
            )}
            <Input label="Admin Code" type="password" icon={<FiKey />} value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Unique administrator code" showToggle required />
            <button type="submit" disabled={loading || !adminCode} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 disabled:opacity-60">
              Authenticate <FiArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button onClick={() => navigate('/admin/login')} className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs text-admin-400 hover:text-admin-200">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to login
          </button>
          <p className="mt-3 text-center text-[11px] text-admin-500">Demo mode · any Admin Code is accepted. Backend will verify the bcrypt hash.</p>
        </div>
      </div>
    </div>
  );
}
