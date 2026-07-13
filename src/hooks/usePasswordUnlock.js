import { useState } from 'react';
import { verifyPassword } from '../services/api';

// Shared password-unlock state + logic for every preview component. Removes
// the ~250 lines of duplicated password state/UI that used to live in each
// preview. `unlock()` calls the API once and returns the unlocked `data`
// (filePath/fileData) so the caller can load the now-available source.
export function usePasswordUnlock(file, onUnlock) {
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const unlock = async () => {
    if (!password) {
      setUnlockError('Please enter password');
      return null;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file?.id || file?._id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        return result.data;
      }
      return null;
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
      return null;
    } finally {
      setIsUnlocking(false);
    }
  };

  return { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking };
}
