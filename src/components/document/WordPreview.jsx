import React, { useState, useEffect, useRef } from 'react';
import {
  FiDownload, FiAlertCircle, FiFileText, FiMaximize2, FiX, FiRefreshCw, FiInfo,
} from 'react-icons/fi';
import { convertFileToPdf } from '../../services/api';
import { base64ToBlob } from '../../utils/blob';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import ImageLoader from '../common/ImageLoader';
import Button from '../common/Button';

// ==================== Helpers ====================

// Decode a Base64 string into an ArrayBuffer without corrupting binary bytes.
const base64ToArrayBuffer = (base64) => {
  const clean = String(base64).replace(/\s+/g, '');
  if (!clean) throw new Error('Document data is empty.');
  try {
    const binaryString = atob(clean);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
  } catch (err) {
    throw new Error('Failed to decode document contents. The file data may be corrupted or mis-encoded.');
  }
};

// Resolve a file source (Cloudinary URL, data: URI, or base64) to an ArrayBuffer.
// The Cloudinary URL path fetches the raw binary directly via .arrayBuffer(),
// which is what prevents the ZIP bytes from being rendered as garbled text.
const resolveArrayBuffer = async (src) => {
  if (!src) throw new Error('No document source available');
  if (src instanceof ArrayBuffer) return src;
  if (src instanceof Uint8Array) return src.buffer;
  if (src.startsWith('data:')) {
    return base64ToArrayBuffer(src.split(',')[1] || '');
  }
  // Plain URL (e.g. Cloudinary secure_url): fetch the binary stream as-is.
  if (/^https?:\/\//.test(src)) {
    const resp = await fetch(src);
    if (!resp.ok) throw new Error('Failed to fetch document');
    console.log('DOCX fetch status:', resp.status);
    console.log('DOCX fetch content-type:', resp.headers.get('content-type'));
    return await resp.arrayBuffer();
  }
  // Bare Base64 string.
  return base64ToArrayBuffer(src);
};

const getExtension = (file) => {
  const name = file?.originalName || file?.name || '';
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
};

// .docx is rendered faithfully in the browser. Legacy .doc, .rtf and .odt need
// server-side conversion (LibreOffice -> PDF) which may not be installed.
const isClientRenderable = (ext) => ext === 'docx';

// ==================== Word Preview ====================

const WordPreview = ({ file, onDownload, isPasswordProtected, onUnlock }) => {
  const [content, setContent] = useState(null); // 'docx' | 'pdf' | null
  const [docxBuffer, setDocxBuffer] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  const renderRef = useRef(null);
  const modalRenderRef = useRef(null);
  const pdfUrlRef = useRef(null);

  const ext = getExtension(file);

  // Render a .docx document client-side with docx-preview (high fidelity).
  const renderDocx = async (buffer) => {
    if (!renderRef.current) return;
    renderRef.current.innerHTML = '';
    const { renderAsync } = await import('docx-preview');
    await renderAsync(buffer, renderRef.current, null, {
      className: 'docx-content',
      inWrapper: true,
      breakPages: true,
      ignoreFonts: false,
    });
  };

  const loadClient = async (src) => {
    const buffer = await resolveArrayBuffer(src);
    // Store the buffer and switch the viewer into DOCX mode. The actual DOM
    // render is performed by the dedicated effect below: the render container
    // only mounts once content === 'docx', so calling renderAsync here (while
    // renderRef.current is still null) would silently no-op and leave a blank
    // page. Setting state first lets the container mount, then the effect
    // renders into the now-available ref.
    console.log('DOCX buffer byteLength:', buffer.byteLength);
    setDocxBuffer(buffer);
    setContent('docx');
  };

  const loadViaServer = async (fileId, pwd) => {
    const result = await convertFileToPdf(fileId, pwd);
    const data = result.data || {};
    if (!data.fileData) throw new Error('Conversion returned no data');
    const blob = base64ToBlob(data.fileData, 'application/pdf');
    const url = URL.createObjectURL(blob);
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    pdfUrlRef.current = url;
    setPdfUrl(url);
    setContent('pdf');
  };

  // Decide the best viewing strategy for the file's format.
  const load = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const src = file?.url || file?.filePath || (file?.fileData ? `data:${file.type};base64,${file.fileData}` : null);

      if (isClientRenderable(ext)) {
        try {
          await loadClient(src);
          return;
        } catch (clientErr) {
          // Fall through to server conversion if the browser render fails.
          console.warn('Client .docx render failed, trying server conversion:', clientErr);
        }
      }

      // Legacy formats (.doc/.rtf/.odt) or client-render fallback.
      if (file?.id || file?._id) {
        try {
          await loadViaServer(file.id || file._id, undefined);
          if (ext && ext !== 'docx') {
            setNotice('This document was converted to PDF for viewing. Formatting is preserved as faithfully as possible.');
          }
          return;
        } catch (serverErr) {
          if (serverErr.message?.includes('LibreOffice')) {
            setNotice('Server-side document conversion is not available. Download the original file to view it.');
          } else {
            throw serverErr;
          }
        }
      }

      // No conversion path: show a friendly download fallback.
      setError('Preview is not available for this file type in your browser.');
    } catch (err) {
      console.error('Word preview error:', err);
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPasswordProtected && !isUnlocked) return;
    load();
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isUnlocked, isPasswordProtected]);

  // Render the stored .docx buffer into the main viewer once its container is
  // mounted. This depends on `content` so it re-runs *after* the container
  // appears (it only exists when content === 'docx'). Rendering is deferred
  // here rather than inside loadClient because renderRef.current is null at
  // the initial mount, which would otherwise silently no-op and show a blank
  // page.
  useEffect(() => {
    if (content !== 'docx' || isFullscreen || !docxBuffer || !renderRef.current) return;
    renderDocx(docxBuffer).catch((e) => {
      console.error('DOCX render failed:', e);
      setError(e.message || 'Failed to render document');
    });
  }, [content, docxBuffer, isFullscreen]);

  // Re-render the .docx into the fullscreen modal container when opened.
  useEffect(() => {
    if (isFullscreen && content === 'docx' && docxBuffer && modalRenderRef.current) {
      modalRenderRef.current.innerHTML = '';
      import('docx-preview').then(({ renderAsync }) =>
        renderAsync(docxBuffer, modalRenderRef.current, null, {
          className: 'docx-content',
          inWrapper: true,
          breakPages: true,
          ignoreFonts: false,
        })
      ).catch((e) => console.error('Modal docx render failed:', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen, content, docxBuffer]);

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const unlockedSource = data.filePath || data.fileData;
      if (unlockedSource) {
        setLoading(true);
        setError(null);
        try {
          if (isClientRenderable(ext)) {
            await loadClient(unlockedSource);
          } else {
            await loadViaServer(file.id || file._id, password);
          }
        } catch (e) {
          setError(e.message || 'Failed to load document');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleRetry = () => {
    if (isClientRenderable(ext)) {
      if (docxBuffer) {
        renderDocx(docxBuffer).catch(() => setError('Failed to re-render document'));
      }
    } else {
      load();
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

  if (error && !content) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <FiAlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <div className="mt-4 flex gap-3 justify-center">
          <Button size="sm" variant="outline" onClick={handleRetry}>
            <FiRefreshCw className="mr-2" /> Retry
          </Button>
          <Button size="sm" onClick={onDownload}>
            <FiDownload className="mr-2" /> Download
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {notice && (
          <div className="flex items-start gap-2 p-3 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <FiInfo className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {content === 'docx' ? (
          <div className="max-h-[70vh] overflow-auto bg-white p-4">
            <div ref={renderRef} className="docx-viewer mx-auto shadow-sm" />
          </div>
        ) : content === 'pdf' && pdfUrl ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-2">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-[70vh] rounded-lg border-0 bg-white"
              title="Document Preview"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
              <FiFileText className="text-indigo-600" size={48} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{file?.name}</h3>
            <p className="text-sm text-gray-400 mt-2">{file?.size ? `${Math.round(file.size / 1024)} KB` : ''}</p>
            <Button size="sm" className="mt-4" onClick={onDownload}>
              <FiDownload className="mr-2" /> Download
            </Button>
          </div>
        )}
      </div>

      {content && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open fullscreen"
          >
            <FiMaximize2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      <FullscreenModal isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} title={file?.name}>
        {content === 'docx' ? (
          <div ref={modalRenderRef} className="bg-white p-4 min-h-[60vh]" />
        ) : content === 'pdf' && pdfUrl ? (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-[80vh] rounded-lg border-0 bg-white"
            title="Document Fullscreen"
            allowFullScreen
          />
        ) : null}
      </FullscreenModal>
    </div>
  );
};

// Fullscreen modal that reuses the shared Modal when available, with a
// graceful fallback so the preview still works if the import is delayed.
const FullscreenModal = ({ isOpen, onClose, title, children }) => {
  const [Modal, setModal] = useState(null);
  useEffect(() => {
    let active = true;
    import('../../components/common/Modal').then((m) => {
      if (active) setModal(() => m.Modal);
    });
    return () => { active = false; };
  }, []);
  if (!isOpen) return null;
  if (Modal) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
        {children}
      </Modal>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-800 z-10" onClick={onClose}>
          <FiX className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default WordPreview;
