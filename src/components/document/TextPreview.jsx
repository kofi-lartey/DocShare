import React, { useState, useEffect } from 'react';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import ImageLoader from '../common/ImageLoader';

const TextPreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [content, setContent] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isUnlocked, isPasswordProtected]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (file?.content) {
        try {
          const decoded = atob(file.content);
          setContent(decoded);
        } catch {
          setContent(file.content);
        }
      } else if (file?.fileData) {
        try {
          const decoded = atob(file.fileData);
          setContent(decoded);
        } catch {
          setContent(file.fileData);
        }
      } else if (file?.url) {
        const response = await fetch(file.url);
        const text = await response.text();
        setContent(text);
      }
    } catch (error) {
      setContent('Unable to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const unlockedSource = data.filePath || data.fileData;
      if (unlockedSource) {
        try {
          setContent(atob(unlockedSource));
        } catch {
          setContent(unlockedSource);
        }
        setLoading(false);
      }
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This document is password protected"
        onUnlock={handleUnlock}
        unlockError={unlockError}
        isUnlocking={isUnlocking}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <ImageLoader size="md" />
      </div>
    );
  }

  const displayContent = showFull ? content : content.slice(0, 1000);
  const hasMore = content.length > 1000;

  return (
    <div className="w-full">
      <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
          {displayContent || 'No content to display'}
        </pre>
      </div>
      {hasMore && (
        <button
          onClick={() => setShowFull(!showFull)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showFull ? 'Show less' : `Show more (${content.length - 1000} more characters)`}
        </button>
      )}
    </div>
  );
};

export default TextPreview;
