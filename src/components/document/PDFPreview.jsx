import React, { useState, useEffect } from 'react';
import {
  FiDownload, FiEye,
  FiArrowLeft, FiMaximize2, FiX, FiPrinter, FiInfo,
  FiAlertCircle, FiUnlock, FiFileText, FiLock,
} from 'react-icons/fi';
import { formatFileSize, formatDate } from '../../utils/helpers';
import { base64ToBlob } from '../../utils/blob';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import ImageLoader from '../common/ImageLoader';
import { Modal } from '../common/Modal';
import Button from '../common/Button';

const PDFPreview = ({ file, onDownload, onShare, isPasswordProtected, onUnlock }) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(file?.pages > 0 ? file.pages : 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    let createdUrl = null;
    // Try to create PDF URL from file data
    if (file?.fileData || file?.content) {
      try {
        const blob = base64ToBlob(file.fileData || file.content, 'application/pdf');
        createdUrl = URL.createObjectURL(blob);
        setPdfUrl(createdUrl);
        getPDFPageCount(createdUrl);
      } catch (e) {
        console.error('Error creating PDF URL:', e);
      }
    } else if (file?.url) {
      setPdfUrl(file.url);
      getPDFPageCount(file.url);
    }
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Function to get actual PDF page count.
  // The backend now stores an accurate `pages` value at upload time, so we
  // trust that when available. For older files that were stored before this
  // fix (e.g. pages === 1), we fall back to reading the whole PDF and counting
  // the page objects. We scan the ENTIRE file, not just the first 10 KB, since
  // the /Count entry often appears near the end of the document.
  const getPDFPageCount = async (url) => {
    // Prefer the value stored in the database when it looks valid.
    if (file?.pages > 1) {
      setTotalPages(file.pages);
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const text = new TextDecoder('latin1').decode(arrayBuffer);

      // Method 1: the /Count in the root Pages tree is the authoritative
      // total. Take the largest /Count found (nested page trees have smaller
      // counts than the root node).
      const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)].map((m) => parseInt(m[1], 10));
      const maxCount = countMatches.length ? Math.max(...countMatches) : 0;

      // Method 2: count individual page objects as a cross-check.
      const pageObjectCount = (text.match(/\/Type\s*\/Page(?![sV])/g) || []).length;

      const detected = Math.max(maxCount, pageObjectCount);

      if (detected > 0) {
        setTotalPages(detected);
      } else {
        setTotalPages(file?.pages || 1);
      }
    } catch (e) {
      console.error('Error getting PDF page count:', e);
      setTotalPages(file?.pages || 1);
    }
  };

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const unlockedSource = data.filePath || data.fileData;
      if (unlockedSource) {
        const setUnlockedUrl = (url) => {
          setPdfUrl(url);
          setShowPdfViewer(true);
        };
        try {
          const blob = base64ToBlob(unlockedSource, 'application/pdf');
          setUnlockedUrl(URL.createObjectURL(blob));
        } catch {
          setUnlockedUrl(unlockedSource);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPage((p) => Math.min(totalPages, p + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setPage((p) => Math.max(1, p - 1));
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

  return (
    <>
      <div className="w-full" tabIndex={0} onKeyDown={handleKeyDown}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[500px]">
        {pdfUrl && showPdfViewer ? (
          <iframe
            key={page}
            id="pdf-viewer"
            src={`${pdfUrl}#page=${page}&toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
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
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <FiArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <FiArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 mr-2 hidden sm:inline">
                Use arrow keys to navigate
              </span>
              <button
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsFullscreen(true)}
              >
                <FiMaximize2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => window.print()}
              >
                <FiPrinter className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
              key={page}
              src={`${pdfUrl}#page=${page}&toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
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

export default PDFPreview;
