import { FiLock, FiUnlock } from 'react-icons/fi';
import Button from '../common/Button';

// Reusable password gate shown by every preview when a file is protected.
// State is owned by usePasswordUnlock; this component only renders the UI and
// wires the input/button to the props it is given.
export default function PasswordGate({
  title = 'This file is password protected',
  description = 'This file is password protected',
  onUnlock,
  unlockError,
  isUnlocking,
  password,
  setPassword,
}) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
      <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiLock className="w-10 h-10 text-yellow-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          onKeyPress={(e) => e.key === 'Enter' && onUnlock()}
        />
        {unlockError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <FiUnlock className="w-4 h-4" />
            {unlockError}
          </p>
        )}
        <Button onClick={onUnlock} loading={isUnlocking} className="w-full">
          <FiUnlock className="mr-2" /> Unlock
        </Button>
      </div>
    </div>
  );
}
