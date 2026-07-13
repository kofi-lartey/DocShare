import React, { useState, useEffect } from 'react';
import { FiMaximize2 } from 'react-icons/fi';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import ImageLoader from '../common/ImageLoader';
import { Modal } from '../common/Modal';

const ImagePreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [preview, setPreview] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    if (file?.url) {
      setPreview(file.url);
    } else if (file?.content) {
      setPreview(`data:${file.type};base64,${file.content}`);
    } else if (file?.fileData) {
      setPreview(`data:${file.type};base64,${file.fileData}`);
    }
  }, [file]);

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const unlockedSource = data.filePath || data.fileData;
      if (unlockedSource) {
        try {
          setPreview(`data:${file.type};base64,${unlockedSource}`);
        } catch {
          setPreview(unlockedSource);
        }
      }
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This image is password protected"
        onUnlock={handleUnlock}
        unlockError={unlockError}
        isUnlocking={isUnlocking}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">
          {preview ? (
            <img
              src={preview}
              alt={file?.name}
              className="max-h-[500px] w-auto object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsFullscreen(true)}
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageLoader size="lg" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Image Preview</h3>
              <p className="text-gray-500 dark:text-gray-400">{file?.name}</p>
              <p className="text-sm text-gray-400 mt-2">{file?.size ? `${Math.round(file.size / 1024)} KB` : ''}</p>
            </div>
          )}
        </div>
        {preview && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiMaximize2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} title={file?.name} size="lg">
        <div className="flex justify-center items-center min-h-[400px]">
          {preview && <img src={preview} alt={file?.name} className="max-h-[80vh] max-w-full object-contain" />}
        </div>
      </Modal>
    </>
  );
};

export default ImagePreview;
