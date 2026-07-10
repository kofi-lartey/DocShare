import { useState } from 'react';
import { FiShield, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { updateConsent } from '../../services/api';
import { Link } from 'react-router-dom';

const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'docshare_privacy_consent';

// Read any previously stored client-side choice so the banner never reappears
// on refresh, even before the server state loads.
const readStoredConsent = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Privacy consent banner shown to authenticated users who have not yet
 * recorded a consent choice. The banner is dismissed immediately on click
 * (local state + localStorage) and the server is synced in the background,
 * so a failed/slow API call never leaves the banner stuck on screen.
 */
export default function ConsentBanner() {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!readStoredConsent());

  const serverConsented = !!user?.privacyConsent?.consentVersion;
  if (!user || serverConsented || dismissed) return null;

  const setConsent = async (analytics, geoTracking) => {
    // 1) Hide immediately and persist locally — independent of the API.
    const record = { analytics, geoTracking, version: CONSENT_VERSION, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setDismissed(true);

    // 2) Best-effort background sync to the server.
    try {
      const res = await updateConsent({ analytics, geoTracking, consentVersion: CONSENT_VERSION });
      updateUser({ ...user, privacyConsent: res.data });
      success('Privacy preferences saved');
    } catch (err) {
      // Banner is already hidden; only surface a non-blocking notice.
      error(err.message || 'Failed to sync consent to server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
            <FiShield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Your privacy choices
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We'd like to collect anonymous download analytics (hashed IP only) to improve your experience. See our{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                disabled={busy}
                onClick={() => setConsent(true, true)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                <FiCheck className="w-3.5 h-3.5" />
                Accept
              </button>
              <button
                disabled={busy}
                onClick={() => setConsent(false, false)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <FiX className="w-3.5 h-3.5" />
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
