import React, { useState, useEffect } from 'react';
import { FiMusic } from 'react-icons/fi';
import { formatFileSize } from '../../utils/helpers';
import { base64ToBlob } from '../../utils/blob';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';

const AudioPreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      const cleanup = createAudioUrl();
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isUnlocked, isPasswordProtected]);

  const createAudioUrl = () => {
    if (file?.url) {
      setAudioUrl(file.url);
      return;
    }
    const data = file?.content || file?.fileData;
    if (!data) return;
    try {
      const blob = base64ToBlob(data, file.type);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating audio URL:', e);
    }
  };

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const audioSource = data.filePath || data.fileData;
      if (audioSource) {
        if (/^https?:\/\//.test(audioSource)) {
          setAudioUrl(audioSource);
        } else {
          try {
            const blob = base64ToBlob(audioSource, file.type);
            setAudioUrl(URL.createObjectURL(blob));
          } catch {
            setAudioUrl(audioSource);
          }
        }
      }
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This audio is password protected"
        onUnlock={handleUnlock}
        unlockError={unlockError}
        isUnlocking={isUnlocking}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
          <FiMusic className="text-green-600" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Audio File</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{file?.name}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatFileSize(file?.size)}</span>
          <span>•</span>
          <span>{file?.duration || 'Unknown duration'}</span>
        </div>
        {audioUrl && (
          <div className="w-full max-w-md mt-4">
            <audio controls className="w-full rounded-lg">
              <source src={audioUrl} type={file?.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPreview;
