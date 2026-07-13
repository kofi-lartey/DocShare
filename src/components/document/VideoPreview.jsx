import React, { useState, useEffect } from 'react';
import { FiVideo } from 'react-icons/fi';
import { formatFileSize } from '../../utils/helpers';
import { base64ToBlob } from '../../utils/blob';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import Button from '../common/Button';

const VideoPreview = ({ file, onDownload, isPasswordProtected, onUnlock }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      const cleanup = createVideoUrl();
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isUnlocked, isPasswordProtected]);

  const createVideoUrl = () => {
    if (file?.url) {
      setVideoUrl(file.url);
      return;
    }
    const data = file?.content || file?.fileData;
    if (!data) return;
    try {
      const blob = base64ToBlob(data, file.type);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating video URL:', e);
    }
  };

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const videoSource = data.filePath || data.fileData;
      if (videoSource) {
        if (/^https?:\/\//.test(videoSource)) {
          setVideoUrl(videoSource);
        } else {
          try {
            const blob = base64ToBlob(videoSource, file.type);
            setVideoUrl(URL.createObjectURL(blob));
          } catch {
            setVideoUrl(videoSource);
          }
        }
      }
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This video is password protected"
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
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">
        {videoUrl ? (
          <video controls className="w-full max-h-[500px] rounded-lg">
            <source src={videoUrl} type={file?.type} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
              <FiVideo className="text-purple-600" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Video File</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{file?.name}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatFileSize(file?.size)}</span>
              <span>•</span>
              <span>{file?.duration || 'Unknown duration'}</span>
            </div>
            <Button size="sm" className="mt-4" onClick={onDownload}>
              <FiDownload className="mr-2" /> Download Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;
