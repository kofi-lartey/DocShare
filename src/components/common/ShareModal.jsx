import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import Button from './Button';
import { SOCIAL_PLATFORMS } from '../../utils/socialMedia';
import { QRCodeSVG } from 'qrcode.react';

export default function ShareModal({ isOpen, onClose, url, documentName }) {
  const qrRef = useRef(null);
  const [shareableImage, setShareableImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a shareable image with QR code and URL text
  const generateShareableImage = async () => {
    if (!qrRef.current) return null;
    
    try {
      setIsGenerating(true);
      const svg = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const urlObj = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
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
          
          const pngUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(urlObj);
          resolve(pngUrl);
        };
        img.src = urlObj;
      });
    } catch (error) {
      console.error('Error generating shareable image:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform) => {
    let shareUrl = platform.getShareUrl(url);
    
    // For WhatsApp - can include image as base64
    if (platform.name === 'WhatsApp') {
      const qrImage = await generateShareableImage();
      if (qrImage) {
        // WhatsApp Web doesn't support image sharing via URL,
        // but we can include the QR code as a link with preview
        const message = encodeURIComponent(
          `📄 ${documentName || 'Document'}\n\n🔗 ${url}\n\n📱 Scan QR code to view on mobile`
        );
        shareUrl = `https://wa.me/?text=${message}`;
      } else {
        const message = encodeURIComponent(`📄 ${documentName || 'Document'}\n\n🔗 ${url}`);
        shareUrl = `https://wa.me/?text=${message}`;
      }
    } 
    // For Telegram
    else if (platform.name === 'Telegram') {
      const message = encodeURIComponent(
        `📄 ${documentName || 'Document'}\n\n🔗 ${url}\n\n📱 Scan QR code to view on mobile`
      );
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`📄 ${documentName || 'Document'}`)}`;
    }
    // For Email - include QR code as attachment suggestion
    else if (platform.name === 'Email') {
      const subject = encodeURIComponent(`📄 ${documentName || 'Document'} Shared with You`);
      const body = encodeURIComponent(
        `Hello,\n\nI'd like to share this document with you:\n\n📄 ${documentName || 'Document'}\n🔗 ${url}\n\n📱 You can scan the QR code to view it on your mobile device.\n\nThe QR code image is attached below.\n\nBest regards.`
      );
      shareUrl = `mailto:?subject=${subject}&body=${body}`;
    }
    // For Twitter
    else if (platform.name === 'Twitter') {
      const message = encodeURIComponent(`📄 ${documentName || 'Document'} - Check it out! ${url}`);
      shareUrl = `https://twitter.com/intent/tweet?text=${message}`;
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
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
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
    if (!qrRef.current) return;
    
    try {
      const svg = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const urlObj = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = async () => {
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
        
        URL.revokeObjectURL(urlObj);
      };
      img.src = urlObj;
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

      <div className="flex flex-col items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <QRCodeSVG ref={qrRef} value={url} size={180} className="mx-auto" />
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