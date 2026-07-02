import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiDownload, FiShare2, FiEye, FiCalendar, FiUser, 
  FiCode, FiCopy, FiFileText, FiImage, FiVideo, FiMusic,
  FiLock, FiClock, FiArrowLeft, FiMaximize2,
  FiInfo, FiAlertCircle, FiCheckCircle,
  FiFile, FiPrinter, FiBookmark, FiStar,
  FiExternalLink, FiLink, FiEyeOff, FiUnlock,
  FiX, FiShield
} from 'react-icons/fi';
import { getFile, verifyPassword } from '../services/api';
import { formatFileSize, formatDate } from '../utils/helpers';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../utils/helpers';

// ==================== File Preview Components ====================

const PDFPreview = ({ file, onDownload, isPasswordProtected, onUnlock }) => {
  const [page, setPage] = useState(1);
  const [totalPages] = useState(file?.pages || 3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Try to create PDF URL from file data
    if (file?.fileData || file?.content) {
      try {
        const data = file.fileData || file.content;
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        console.error('Error creating PDF URL:', e);
      }
    } else if (file?.url) {
      setPdfUrl(file.url);
    }
  }, [file]);

  const handleUnlock = async () => {
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        // Reload the file with the unlocked data
        if (result.data?.fileData) {
          const binaryString = atob(result.data.fileData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
          setShowPdfViewer(true);
        }
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  // If password protected and not unlocked, show lock screen
  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This document is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <div className="w-full">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            />
            {unlockError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {unlockError}
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleUnlock} 
            loading={isUnlocking}
            className="w-full"
          >
            <FiUnlock className="mr-2" /> Unlock Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[500px]">
          {pdfUrl && showPdfViewer ? (
            <iframe
              src={`${pdfUrl}#page=${page}&toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-[500px] rounded-lg border-0"
              title="PDF Viewer"
              allowFullScreen
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiFileText className="text-red-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">PDF Document</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{file?.name}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatFileSize(file?.size)}</span>
                <span>•</span>
                <span>{totalPages} pages</span>
              </div>
              <div className="mt-6 flex gap-3 justify-center">
                <Button 
                  size="sm" 
                  variant="primary" 
                  onClick={() => setShowPdfViewer(true)}
                  disabled={!pdfUrl}
                >
                  <FiEye className="mr-2" /> Preview PDF
                </Button>
                <Button size="sm" variant="outline" onClick={onDownload}>
                  <FiDownload className="mr-2" /> Download
                </Button>
              </div>
              {!pdfUrl && (
                <p className="mt-4 text-xs text-yellow-600 dark:text-yellow-400">
                  <FiInfo className="inline w-3 h-3 mr-1" />
                  Preview not available - file data not found
                </p>
              )}
            </div>
          )}
        </div>
        
        {pdfUrl && showPdfViewer && (
          <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50" 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <FiArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setIsFullscreen(true)}
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => window.print()}
              >
                <FiPrinter className="w-4 h-4" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setShowPdfViewer(false)}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} title={file?.name} size="lg">
        {pdfUrl && showPdfViewer ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-[80vh] rounded-lg border-0"
            title="PDF Fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
            <FiFileText className="text-red-600" size={80} />
            <p className="mt-4 text-gray-500">PDF Preview - Page {page} of {totalPages}</p>
            <Button size="sm" className="mt-4" onClick={onDownload}>
              <FiDownload className="mr-2" /> Download
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

// ImagePreview with password protection
const ImagePreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [preview, setPreview] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

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
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        if (result.data?.fileData) {
          setPreview(`data:${file.type};base64,${result.data.fileData}`);
        }
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This image is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-sm text-red-600">{unlockError}</p>
          )}
          <Button onClick={handleUnlock} loading={isUnlocking} className="w-full">
            <FiUnlock className="mr-2" /> Unlock
          </Button>
        </div>
      </div>
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
                <FiImage className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Image Preview</h3>
              <p className="text-gray-500 dark:text-gray-400">{file?.name}</p>
              <p className="text-sm text-gray-400 mt-2">{formatFileSize(file?.size)}</p>
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
          <img src={preview} alt={file?.name} className="max-h-[80vh] max-w-full object-contain" />
        </div>
      </Modal>
    </>
  );
};

// TextPreview with password protection
const TextPreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [content, setContent] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      loadContent();
    }
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
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        if (result.data?.fileData) {
          try {
            const decoded = atob(result.data.fileData);
            setContent(decoded);
          } catch {
            setContent(result.data.fileData);
          }
        }
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This document is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-sm text-red-600">{unlockError}</p>
          )}
          <Button onClick={handleUnlock} loading={isUnlocking} className="w-full">
            <FiUnlock className="mr-2" /> Unlock
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
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

// VideoPreview with password protection
const VideoPreview = ({ file, onDownload, isPasswordProtected, onUnlock }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      createVideoUrl();
    }
  }, [file, isUnlocked, isPasswordProtected]);

  const createVideoUrl = () => {
    if (file?.url) {
      setVideoUrl(file.url);
    } else if (file?.content) {
      try {
        const binaryString = atob(file.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: file.type });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } catch (e) {
        console.error('Error creating video URL:', e);
      }
    } else if (file?.fileData) {
      try {
        const binaryString = atob(file.fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: file.type });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } catch (e) {
        console.error('Error creating video URL from fileData:', e);
      }
    }
  };

  const handleUnlock = async () => {
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        if (result.data?.fileData) {
          const binaryString = atob(result.data.fileData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: file.type });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
        }
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This video is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-sm text-red-600">{unlockError}</p>
          )}
          <Button onClick={handleUnlock} loading={isUnlocking} className="w-full">
            <FiUnlock className="mr-2" /> Unlock
          </Button>
        </div>
      </div>
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

// AudioPreview with password protection
const AudioPreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      createAudioUrl();
    }
  }, [file, isUnlocked, isPasswordProtected]);

  const createAudioUrl = () => {
    if (file?.url) {
      setAudioUrl(file.url);
    } else if (file?.content) {
      try {
        const binaryString = atob(file.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: file.type });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (e) {
        console.error('Error creating audio URL:', e);
      }
    } else if (file?.fileData) {
      try {
        const binaryString = atob(file.fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: file.type });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (e) {
        console.error('Error creating audio URL from fileData:', e);
      }
    }
  };

  const handleUnlock = async () => {
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
        if (result.data?.fileData) {
          const binaryString = atob(result.data.fileData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: file.type });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This audio is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-sm text-red-600">{unlockError}</p>
          )}
          <Button onClick={handleUnlock} loading={isUnlocking} className="w-full">
            <FiUnlock className="mr-2" /> Unlock
          </Button>
        </div>
      </div>
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

// DefaultPreview with password protection
const DefaultPreview = ({ file, onDownload, onShare, isPasswordProtected, onUnlock }) => {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = async () => {
    if (!password) {
      setUnlockError('Please enter a password');
      return;
    }
    setIsUnlocking(true);
    setUnlockError('');
    try {
      const result = await verifyPassword(file.id, password);
      if (result.success) {
        setIsUnlocked(true);
        if (onUnlock) onUnlock();
      }
    } catch (err) {
      setUnlockError(err.message || 'Invalid password');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Password Protected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">This file is password protected</p>
        <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          {unlockError && (
            <p className="text-sm text-red-600">{unlockError}</p>
          )}
          <Button onClick={handleUnlock} loading={isUnlocking} className="w-full">
            <FiUnlock className="mr-2" /> Unlock
          </Button>
        </div>
      </div>
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

// ==================== Helper Functions ====================

const getFileIcon = (type) => {
  const iconClass = 'w-5 h-5';
  if (type?.includes('pdf')) return <FiFileText className={`${iconClass} text-red-500`} />;
  if (type?.includes('image')) return <FiImage className={`${iconClass} text-blue-500`} />;
  if (type?.includes('video')) return <FiVideo className={`${iconClass} text-purple-500`} />;
  if (type?.includes('audio')) return <FiMusic className={`${iconClass} text-green-500`} />;
  return <FiFile className={`${iconClass} text-gray-400`} />;
};

const getFilePreview = (file, onDownload, onShare, isPasswordProtected, onUnlock) => {
  const type = file?.type || '';
  
  if (type.includes('pdf')) return <PDFPreview file={file} onDownload={onDownload} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
  if (type.includes('image')) return <ImagePreview file={file} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
  if (type.includes('text') || type.includes('json') || type.includes('javascript') || 
      type.includes('css') || type.includes('html') || type.includes('xml')) {
    return <TextPreview file={file} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
  }
  if (type.includes('video')) return <VideoPreview file={file} onDownload={onDownload} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
  if (type.includes('audio')) return <AudioPreview file={file} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
  return <DefaultPreview file={file} onDownload={onDownload} onShare={onShare} isPasswordProtected={isPasswordProtected} onUnlock={onUnlock} />;
};

// ==================== Main Component ====================

export default function ViewDocument() {
  const { fileId } = useParams();
  const { success, error } = useNotification();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const result = await getFile(fileId);
        setFile(result.data);
        if (!result.data.requirePassword) {
          setIsUnlocked(true);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };
    if (fileId) fetchFile();
  }, [fileId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    success('Link copied to clipboard!');
  };

  const handleDownload = () => {
    success('Download started!');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    success('Document unlocked successfully!');
  };

  const isPasswordProtected = file?.requirePassword === true && !isUnlocked;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading document...</p>
      </div>
    );
  }

  if (errorMsg || !file) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="glass" padding="xl" className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">File Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMsg || 'The file you are looking for does not exist.'}</p>
          <Link to="/dashboard">
            <Button variant="primary">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FiEye className="text-white" size={18} />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocShare Pro
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <FiStar className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <FiShare2 className="mr-2" /> Share
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <FiDownload className="mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="lg" className="backdrop-blur-sm">
              {/* File Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-2xl',
                    file?.type?.includes('pdf') ? 'bg-red-100 dark:bg-red-900/30' :
                    file?.type?.includes('image') ? 'bg-blue-100 dark:bg-blue-900/30' :
                    file?.type?.includes('video') ? 'bg-purple-100 dark:bg-purple-900/30' :
                    file?.type?.includes('audio') ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  )}>
                    {getFileIcon(file?.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {file?.name}
                      </h1>
                      {file?.requirePassword && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <FiLock className="w-3 h-3" />
                          Protected
                        </Badge>
                      )}
                      {isUnlocked && file?.requirePassword && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <FiUnlock className="w-3 h-3" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiUser className="text-gray-400" size={14} />
                        {file?.uploader || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="text-gray-400" size={14} />
                        {formatDate(file?.uploadDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiEye className="text-gray-400" size={14} />
                        {file?.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <FiFile className="text-gray-400" size={14} />
                        {formatFileSize(file?.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={file?.status === 'active' ? 'success' : 'error'} className="px-3 py-1 text-xs">
                  {file?.status || 'Active'}
                </Badge>
              </div>

              {/* File Preview */}
              <div className="rounded-xl overflow-hidden">
                {getFilePreview(file, handleDownload, handleShare, isPasswordProtected, handleUnlock)}
              </div>

              {/* File Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button size="sm" variant="outline" onClick={() => handleCopy(file?.shareableLink)}>
                  <FiCopy className="mr-2" /> Copy Link
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowQR(true)}>
                  <FiCode className="mr-2" /> QR Code
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <FiDownload className="mr-2" /> Download
                </Button>
                <Button size="sm" variant="outline" onClick={handleShare}>
                  <FiShare2 className="mr-2" /> Share
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Share Card */}
            <Card variant="glass" padding="lg" className="backdrop-blur-sm">
              <CardHeader title="Share Document" subtitle="Share with anyone, anywhere" className="mb-3" />
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Shareable Link</label>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                      <code className="flex-1 px-2 py-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                        {file?.shareableLink}
                      </code>
                      <button 
                        onClick={() => handleCopy(file?.shareableLink)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiCopy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={handleShare}>
                    <FiShare2 className="mr-2" /> Share Document
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Details */}
            <Card variant="glass" padding="lg" className="backdrop-blur-sm">
              <CardHeader title="File Details" subtitle="Information about this document" className="mb-3" />
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={file?.status === 'active' ? 'success' : 'error'} size="sm">
                      {file?.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-500">File Size</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatFileSize(file?.size)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-500">Views</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {file?.views || 0}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-500">Uploaded</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(file?.uploadDate)}
                    </span>
                  </div>
                  {file?.expiresAt && (
                    <div className="flex justify-between py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                      <span className="text-gray-500">Expires</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatDate(file?.expiresAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Protected</span>
                    <span className={cn(
                      'flex items-center gap-1 font-medium',
                      file?.requirePassword ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                    )}>
                      {file?.requirePassword ? (
                        isUnlocked ? (
                          <>
                            <FiUnlock className="w-4 h-4" />
                            Unlocked
                          </>
                        ) : (
                          <>
                            <FiLock className="w-4 h-4" />
                            Password Protected
                          </>
                        )
                      ) : (
                        <>
                          <FiUnlock className="w-4 h-4" />
                          No Password
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="glass" padding="lg" className="backdrop-blur-sm">
              <CardHeader title="Quick Actions" className="mb-3" />
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleDownload}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiDownload className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Download</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiShare2 className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Share</span>
                  </button>
                  <button 
                    onClick={() => setShowQR(true)}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiCode className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">QR Code</span>
                  </button>
                  <button 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiStar className={`w-5 h-5 ${isBookmarked ? 'text-yellow-600 fill-current' : 'text-gray-500'}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Bookmark</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Document" size="md">
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Share via link</p>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg text-sm border border-gray-200 dark:border-gray-700 truncate">
                {file?.shareableLink}
              </code>
              <Button size="sm" variant="outline" onClick={() => handleCopy(file?.shareableLink)}>
                <FiCopy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Scan with your phone</p>
            <div className="inline-block bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <QRCodeSVG value={file?.shareableLink} size={180} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => handleCopy(file?.shareableLink)}>
              <FiCopy className="mr-2" /> Copy Link
            </Button>
            <Button variant="primary" className="flex-1">
              <FiExternalLink className="mr-2" /> Open Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="QR Code" size="sm">
        <div className="text-center">
          <div className="inline-block bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <QRCodeSVG value={file?.shareableLink} size={200} />
          </div>
          <p className="mt-4 text-sm text-gray-500">Scan to view this document</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-4"
            onClick={() => handleCopy(file?.shareableLink)}
          >
            <FiCopy className="mr-2" /> Copy Link
          </Button>
        </div>
      </Modal>
    </div>
  );
}