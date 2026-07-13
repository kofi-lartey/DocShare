import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiDownload, FiShare2, FiEye, FiCalendar, FiUser,
  FiCode, FiCopy, FiFileText, FiImage, FiVideo, FiMusic,
  FiLock, FiArrowLeft, FiMaximize2,
  FiInfo, FiAlertCircle, FiCheckCircle,
  FiFile, FiPrinter, FiBookmark, FiStar,
  FiExternalLink, FiLink, FiEyeOff, FiUnlock,
  FiX, FiShield,
} from 'react-icons/fi';
import { getFile, trackDownload } from '../services/api';
import { formatFileSize, formatDate, cn } from '../utils/helpers';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import ImageLoader from '../components/common/ImageLoader';
import BrandLogo from '../components/common/BrandLogo';
import { QRCodeSVG } from 'qrcode.react';
import { base64ToBlob, triggerDownload } from '../utils/blob';
import { getPreviewComponent } from '../components/document/previewRegistry';

// ==================== File Helper ====================

const getFileIcon = (type) => {
  const iconClass = 'w-5 h-5';
  if (type?.includes('pdf')) return <FiFileText className={`${iconClass} text-red-500`} />;
  if (type?.includes('image')) return <FiImage className={`${iconClass} text-blue-500`} />;
  if (type?.includes('video')) return <FiVideo className={`${iconClass} text-purple-500`} />;
  if (type?.includes('audio')) return <FiMusic className={`${iconClass} text-green-500`} />;
  return <FiFile className={`${iconClass} text-gray-400`} />;
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
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const result = await getFile(fileId);
        const data = result.data || {};
        const normalized = {
          ...data,
          id: data.id || data._id,
          // NOTE: `content` is the decoded file bytes as text and must NOT be
          // used as a `url`. It is only consumed by TextPreview. Otherwise a
          // DOCX/XLSX would end up with `url` = "PK..." (raw ZIP text).
          url: data.filePath || data.url || (data.fileData ? `data:${data.type};base64,${data.fileData}` : undefined),
          uploadDate: data.uploadDate || data.createdAt,
        };
        // Debug: inspect what the backend actually returns.
        console.log('getFile data:', data);
        console.log('normalized:', normalized);
        console.log('type:', normalized.type);
        console.log('name:', normalized.name);
        console.log('filePath:', normalized.filePath);
        console.log('url:', normalized.url);
        setFile(normalized);
        if (normalized.qrCode) {
          setQrCodeUrl(normalized.qrCode);
        }
        if (!normalized.requirePassword) {
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

  const handleDownload = async () => {
    try {
      // Best-effort analytics ping (respects owner privacy consent server-side).
      try {
        await trackDownload(file.id || file._id || fileId);
      } catch { /* analytics is non-blocking */ }

      if (file?.url) {
        const response = await fetch(file.url);
        const blob = await response.blob();
        triggerDownload(blob, file?.name || 'document');
        success('Download started!');
      } else if (file?.fileData || file?.content) {
        const blob = base64ToBlob(file.fileData || file.content, file?.type);
        triggerDownload(blob, file?.name || 'document');
        success('Download started!');
      } else {
        error('Unable to download file - no data available');
      }
    } catch (err) {
      error('Failed to download file');
      console.error('Download error:', err);
    }
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
        <ImageLoader size="lg" />
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

  const PreviewComponent = getPreviewComponent(file);

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
                 <BrandLogo size="xs" />
                 <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                   DocShare Pro
                 </span>
               </Link>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors relative"
                aria-label="Toggle sidebar"
              >
                <div className="w-5 h-5 flex flex-col items-center justify-center gap-1">
                  <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`} />
                  <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-400 transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <FiStar className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
              <Button size="sm" variant="outline" onClick={handleShare} className="hidden sm:inline-flex">
                <FiShare2 className="mr-2" /> Share
              </Button>
              <Button size="sm" onClick={handleDownload} className="hidden sm:inline-flex">
                <FiDownload className="mr-2" /> Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Document Preview - Using conditional classes properly */}
            <div className={`lg:col-span-4 transition-all duration-300 ${!isSidebarOpen ? 'lg:col-span-5' : ''}`}>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
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
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
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
                  <Badge variant={file?.status === 'active' ? 'success' : 'error'} className="px-3 py-1 text-xs self-start">
                    {file?.status || 'Active'}
                  </Badge>
                </div>

                {/* File Preview */}
                <div className="rounded-xl overflow-hidden min-h-[400px] sm:min-h-[500px]">
                  <PreviewComponent
                    file={file}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    isPasswordProtected={isPasswordProtected}
                    onUnlock={handleUnlock}
                  />
                </div>

                {/* File Actions */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <Button size="sm" variant="outline" onClick={() => handleCopy(file?.shareableUrl || file?.shareableLink)}>
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

            {/* Sidebar - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                {/* Desktop Sidebar Toggle Handle */}
                <div
                  className="flex items-center justify-center py-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{isSidebarOpen ? 'Hide' : 'Show'} Details</span>
                    <FiArrowLeft className={`w-3 h-3 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Sidebar Content - Only show when open */}
                {isSidebarOpen && (
                  <div className="space-y-3">
                    {/* Share Card */}
                    <Card variant="glass" padding="sm" className="backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FiShare2 className="w-3.5 h-3.5 text-blue-600" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Share</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                          <code className="flex-1 px-1.5 py-0.5 text-[10px] font-mono text-gray-700 dark:text-gray-300 truncate">
                            {file?.shareableUrl || file?.shareableLink}
                          </code>
                          <button
                            onClick={() => handleCopy(file?.shareableUrl || file?.shareableLink)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <FiCopy className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        <Button variant="primary" size="sm" className="w-full text-xs" onClick={handleShare}>
                          Share Document
                        </Button>
                      </div>
                    </Card>

                    {/* File Details */}
                    <Card variant="glass" padding="sm" className="backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FiInfo className="w-3.5 h-3.5 text-purple-600" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Details</h3>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                          <span className="text-gray-500">Status</span>
                          <Badge variant={file?.status === 'active' ? 'success' : 'error'} size="sm">
                            {file?.status || 'Active'}
                          </Badge>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                          <span className="text-gray-500">Size</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatFileSize(file?.size)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                          <span className="text-gray-500">Views</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {file?.views || 0}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                          <span className="text-gray-500">Uploaded</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatDate(file?.uploadDate)}
                          </span>
                        </div>
                        {file?.expiresAt && (
                          <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-gray-700/50">
                            <span className="text-gray-500">Expires</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatDate(file?.expiresAt)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">Protected</span>
                          <span className={cn(
                            'flex items-center gap-1 font-medium text-xs',
                            file?.requirePassword ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                          )}>
                            {file?.requirePassword ? (
                              isUnlocked ? (
                                <>
                                  <FiUnlock className="w-3 h-3" />
                                  Unlocked
                                </>
                              ) : (
                                <>
                                  <FiLock className="w-3 h-3" />
                                  Protected
                                </>
                              )
                            ) : (
                              <>
                                <FiUnlock className="w-3 h-3" />
                                Open
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card variant="glass" padding="sm" className="backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FiShield className="w-3.5 h-3.5 text-green-600" />
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Actions</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleDownload}
                          className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiDownload className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">Download</span>
                        </button>
                        <button
                          onClick={handleShare}
                          className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiShare2 className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">Share</span>
                        </button>
                        <button
                          onClick={() => setShowQR(true)}
                          className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiCode className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">QR Code</span>
                        </button>
                        <button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <FiStar className={`w-3.5 h-3.5 ${isBookmarked ? 'text-yellow-600 fill-current' : 'text-gray-500'}`} />
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">Bookmark</span>
                        </button>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
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
                {file?.shareableUrl || file?.shareableLink}
              </code>
              <Button size="sm" variant="outline" onClick={() => handleCopy(file?.shareableUrl || file?.shareableLink)}>
                <FiCopy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Scan with your phone</p>
            <div className="inline-block bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44" />
              ) : (
                <QRCodeSVG value={file?.shareableUrl || file?.shareableLink} size={180} />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => handleCopy(file?.shareableUrl || file?.shareableLink)}>
              <FiCopy className="mr-2" /> Copy Link
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => window.open(file?.shareableUrl || file?.shareableLink, '_blank')}>
              <FiExternalLink className="mr-2" /> Open Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="QR Code" size="sm">
        <div className="text-center">
          <div className="inline-block bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <QRCodeSVG value={file?.shareableUrl || file?.shareableLink} size={180} />
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">Scan to view this document</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => handleCopy(file?.shareableUrl || file?.shareableLink)}
          >
            <FiCopy className="mr-2" /> Copy Link
          </Button>
        </div>
      </Modal>
    </div>
  );
}
