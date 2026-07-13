import React from 'react';
import { FiFile, FiDownload, FiShare2 } from 'react-icons/fi';
import { formatFileSize } from '../../utils/helpers';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import Button from '../common/Button';

const DefaultPreview = ({ file, onDownload, onShare, isPasswordProtected, onUnlock }) => {
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  const handleUnlock = async () => {
    await unlock();
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This file is password protected"
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
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
          <FiFile className="text-gray-500" size={48} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{file?.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">File type: {file?.type || 'Unknown'}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatFileSize(file?.size)}</span>
          <span>•</span>
          <span>Uploaded by {file?.uploader || 'Unknown'}</span>
        </div>
        <div className="mt-6 flex gap-3">
          <Button size="sm" onClick={onDownload}>
            <FiDownload className="mr-2" /> Download
          </Button>
          <Button size="sm" variant="outline" onClick={onShare}>
            <FiShare2 className="mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DefaultPreview;
