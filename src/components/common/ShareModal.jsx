import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import Button from './Button';
import { SOCIAL_PLATFORMS } from '../../utils/socialMedia';
import { QRCodeSVG } from 'qrcode.react';
import { getOgPreview } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function ShareModal({ isOpen, onClose, url, documentName, qrCode }) {
  const qrRef = useRef(null);
  const [shareableImage, setShareableImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachedLink, setAttachedLink] = useState('');
  const [ogPreview, setOgPreview] = useState(null);
  const [ogLoading, setOgLoading] = useState(false);
  const [ogError, setOgError] = useState('');
  const { error: notifyError } = useNotification();

  // Load an image element from the provided QR data URL (preferred) or the rendered SVG
  const loadQRImage = async () => {
    if (qrCode) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = qrCode;
      });
    }
    if (!qrRef.current) return null;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const urlObj = URL.createObjectURL(svgBlob);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = urlObj;
      });
      return img;
    } finally {
      URL.revokeObjectURL(urlObj);
    }
  };

  // Generate a shareable image with QR code and URL text
  const generateShareableImage = async () => {
    try {
      setIsGenerating(true);
      const img = await loadQRImage();
      if (!img) return null;

      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const size = 500;
        canvas.width = size;
        canvas.height = size + 60; // Extra space for text
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(img, 50, 20, 400, 400);

        // Draw URL text below QR code
        ctx.fillStyle = '#1a202c';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Truncate URL if too long
        let displayUrl = url;
        if (displayUrl.length > 50) {
          displayUrl = displayUrl.substring(0, 47) + '...';
        }
        ctx.fillText(displayUrl, size / 2, size + 40);

        resolve(canvas.toDataURL('image/png'));
      });
    } catch (error) {
      console.error('Error generating shareable image:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert the QR code data URL into a File so it can be shared as an attachment
  const qrCodeToFile = async () => {
    if (!qrCode) return null;
    try {
      const res = await fetch(qrCode);
      const blob = await res.blob();
      return new File([blob], `${documentName || 'document'}-qrcode.png`, { type: 'image/png' });
    } catch (error) {
      console.error('Error building QR file:', error);
      return null;
    }
  };

  // Share the document link together with the QR code as an image attachment
  const shareWithQRFile = async (text) => {
    const file = await qrCodeToFile();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: documentName || 'Document',
          text,
          url,
        });
        return true;
      } catch (error) {
        // User cancelled or sharing failed – fall back to URL sharer
        console.error('Native share failed:', error);
      }
    }
    return false;
  };

  const handleShare = async (platform) => {
    let shareUrl = platform.getShareUrl(url);
    let shareText = `📄 ${documentName || 'Document'}\n\n🔗 ${url}`;

    // For WhatsApp
    if (platform.name === 'WhatsApp') {
      shareText = `📄 ${documentName || 'Document'}\n\n🔗 ${url}\n\n📱 Scan the QR code to view on mobile`;
      shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    }
    // For Telegram
    else if (platform.name === 'Telegram') {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`📄 ${documentName || 'Document'}\n\n📱 Scan the QR code to view on mobile`)}`;
    }
    // For Email - attach QR code as an image document
    else if (platform.name === 'Email') {
      const subject = encodeURIComponent(`📄 ${documentName || 'Document'} Shared with You`);
      const body = encodeURIComponent(
        `Hello,\n\nI'd like to share this document with you:\n\n📄 ${documentName || 'Document'}\n🔗 ${url}\n\n📱 You can scan the QR code to view it on your mobile device.\n\nThe QR code image is attached below.\n\nBest regards.`
      );
      shareUrl = `mailto:?subject=${subject}&body=${body}`;
    }
    // For Twitter
    else if (platform.name === 'Twitter') {
      shareText = `📄 ${documentName || 'Document'} - Check it out! ${url}`;
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    }
    // For Facebook
    else if (platform.name === 'Facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`📄 ${documentName || 'Document'} - Check this out!`)}`;
    }
    // For LinkedIn
    else if (platform.name === 'LinkedIn') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    // For Copy Link
    else if (platform.name === 'Copy Link') {
      await navigator.clipboard.writeText(url);
      return;
    }

    // Prefer sharing the QR code as an actual image document when supported
    const shared = await shareWithQRFile(shareText);
    if (shared) return;

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleDownloadQR = async () => {
    if (!qrCode && !qrRef.current) return;

    // If the file already provides a QR code data URL, download it directly
    if (qrCode) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = qrCode;
      link.click();
      return;
    }

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const urlObj = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = pngUrl;
      link.click();
      URL.revokeObjectURL(urlObj);
    };
    img.src = urlObj;
  };

  const handleCopyQRImage = async () => {
    if (!qrCode && !qrRef.current) return;

    try {
      const img = await loadQRImage();
      if (!img) return;

      const canvas = document.createElement('canvas');
      const size = 400;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          // Show success notification
        } catch (err) {
          console.error('Failed to copy QR image:', err);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error copying QR image:', error);
    }
  };

  const handleDownloadShareableImage = async () => {
    const imageData = await generateShareableImage();
    if (imageData) {
      const link = document.createElement('a');
      link.download = `${documentName || 'document'}-qrcode.png`;
      link.href = imageData;
      link.click();
    }
  };

  const handleFetchOgPreview = async () => {
    if (!attachedLink.trim()) return;
    setOgLoading(true);
    setOgError('');
    try {
      const res = await getOgPreview(attachedLink.trim());
      setOgPreview(res.data);
    } catch (err) {
      setOgError(err.message || 'Could not fetch link preview');
      setOgPreview(null);
    } finally {
      setOgLoading(false);
    }
  };

  const clearOgPreview = () => {
    setAttachedLink('');
    setOgPreview(null);
    setOgError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Document">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {SOCIAL_PLATFORMS.map((platform, index) => (
          <motion.button
            key={platform.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare(platform)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-full ${platform.bgColor} text-white`}>
              <platform.Icon size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {platform.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Attach an external link with Open Graph preview */}
      <div className="mb-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attach a link (optional)
        </p>
        {ogPreview ? (
          <a
            href={ogPreview.url || attachedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow transition-shadow"
          >
            {ogPreview.image ? (
              <img
                src={ogPreview.image}
                alt=""
                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {ogPreview.title || 'Link preview'}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {ogPreview.description || attachedLink}
              </p>
            </div>
          </a>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              value={attachedLink}
              onChange={(e) => setAttachedLink(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" variant="outline" onClick={handleFetchOgPreview} loading={ogLoading}>
              Preview
            </Button>
          </div>
        )}
        {ogError && <p className="mt-2 text-xs text-red-600">{ogError}</p>}
        {ogPreview && (
          <button
            type="button"
            onClick={clearOgPreview}
            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Remove link
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="w-44 h-44 mx-auto" />
          ) : (
            <QRCodeSVG ref={qrRef} value={url} size={180} className="mx-auto" />
          )}
        </div> */}
        <p className="text-xs text-gray-500 dark:text-gray-400">Scan to view document</p>
        <div className="flex flex-wrap w-full gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 min-w-[120px]"
          />
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(url)}>
            Copy Link
          </Button>
          <Button size="sm" variant="secondary" onClick={handleCopyQRImage}>
            Copy QR
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDownloadQR}>
            Download QR
          </Button>
        </div>
        <div className="flex gap-2 w-full">
          <Button 
            size="sm" 
            variant="primary" 
            className="flex-1"
            onClick={handleDownloadShareableImage}
            loading={isGenerating}
          >
            Download with QR
          </Button>
        </div>
      </div>
    </Modal>
  );
}