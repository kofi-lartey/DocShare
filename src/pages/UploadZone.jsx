import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FiUploadCloud, FiFile, FiX, FiCheck, FiCopy, 
  FiShare2, FiDownload, FiClock, FiCalendar,
  FiLock, FiUnlock, FiRefreshCw, FiInfo, FiEye,
  FiImage, FiFileText, FiVideo, FiMusic, FiShield,
  FiAlertCircle, FiCheckCircle, FiEyeOff, FiChevronDown,
  FiArrowRight, FiZap, FiGlobe, FiMaximize2, FiMinimize2,
  FiSettings, FiFolder, FiExternalLink
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { cn, formatFileSize } from '../utils/helpers';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';

const uploadSchema = z.object({
  fileName: z.string().optional(),
  generateQR: z.boolean().default(true),
  setExpiry: z.boolean().default(false),
  expiresAt: z.string().optional(),
  password: z.string().optional(),
  requirePassword: z.boolean().default(false),
  notifyOnView: z.boolean().default(false),
}).refine((data) => {
  if (data.requirePassword && !data.password) {
    return false;
  }
  return true;
}, {
  message: "Password is required when password protection is enabled",
  path: ['password'],
}).refine((data) => {
  if (data.requirePassword && data.password && data.password.length < 6) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 6 characters",
  path: ['password'],
});

const getFileIcon = (file) => {
  const type = file?.type || '';
  if (type.includes('pdf')) return <FiFileText className="text-red-500" size={32} />;
  if (type.includes('image')) return <FiImage className="text-blue-500" size={32} />;
  if (type.includes('video')) return <FiVideo className="text-purple-500" size={32} />;
  if (type.includes('audio')) return <FiMusic className="text-green-500" size={32} />;
  return <FiFile className="text-gray-500" size={32} />;
};

const getFileColor = (file) => {
  const type = file?.type || '';
  if (type.includes('pdf')) return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
  if (type.includes('image')) return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
  if (type.includes('video')) return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
  if (type.includes('audio')) return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
  return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700';
};

// Enhanced File Preview Component with Embedded Viewer
const FilePreview = ({ file, onRemove, uploading }) => {
  const [preview, setPreview] = useState(null);
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  
  const isImage = file?.type?.startsWith('image/');
  const isPDF = file?.type === 'application/pdf';
  const isText = file?.type?.startsWith('text/');
  const isJSON = file?.type === 'application/json';
  const isWord = file?.type?.includes('word') || file?.type?.includes('document');
  const isExcel = file?.type?.includes('sheet') || file?.type?.includes('excel');
  
  useEffect(() => {
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
    
    if (isText || isJSON) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setContent(text);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setContent('Unable to read file content');
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
    
    if (isPDF) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
    
    if (isWord || isExcel) {
      setContent(`${isWord ? 'Word' : 'Excel'} Document`);
    }
  }, [file, isImage, isText, isJSON, isPDF, isWord, isExcel]);

  const renderContentPreview = () => {
    // Image Preview
    if (isImage && preview) {
      return (
        <div className="relative group">
          <img 
            src={preview} 
            alt={file.name} 
            className="w-full h-64 object-contain bg-white dark:bg-gray-900 rounded-xl transition-all group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <FiMaximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      );
    }

    // Text/JSON Preview with actual content
    if (isText || isJSON) {
      if (isLoading) {
        return (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        );
      }
      
      const displayContent = showContent ? content : content.slice(0, 500);
      const hasMore = content.length > 500;
      
      return (
        <div className="space-y-3">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
              {displayContent || 'No content to preview'}
            </pre>
          </div>
          {hasMore && (
            <button
              onClick={() => setShowContent(!showContent)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {showContent ? 'Show less' : `Show more (${content.length - 500} more characters)`}
            </button>
          )}
        </div>
      );
    }

    // PDF Preview with Embedded Viewer
    if (isPDF) {
      return (
        <div className="space-y-4">
          {!showPdfViewer ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
              <div className="flex flex-col items-center">
                <FiFileText className="w-16 h-16 text-red-500 mb-3" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">PDF Document</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => setShowPdfViewer(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    Preview PDF
                  </button>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(file);
                      link.download = file.name;
                      link.click();
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-400">Click Preview PDF to view the document</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Open
                  </button>
                  <button
                    onClick={() => setShowPdfViewer(false)}
                    className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[500px] border-0"
                  title="PDF Viewer"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Word/Excel Preview
    if (isWord || isExcel) {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center">
            {isWord ? (
              <FiFileText className="w-16 h-16 text-blue-500 mb-3" />
            ) : (
              <FiFile className="w-16 h-16 text-green-500 mb-3" />
            )}
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {isWord ? 'Word' : 'Excel'} Document
            </p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            <div className="mt-4">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(file);
                  link.download = file.name;
                  link.click();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                Download {isWord ? 'Word' : 'Excel'} Document
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">Download to view the full document</p>
          </div>
        </div>
      );
    }

    // Default preview for other file types
    return (
      <div className={`p-6 rounded-xl border-2 ${getFileColor(file)}`}>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
            {getFileIcon(file)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(file.size)} • {file.type || 'Unknown type'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {/* File Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getFileColor(file)}`}>
              {getFileIcon(file)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          {!uploading && (
            <button 
              onClick={onRemove}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content Preview */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiEye className="w-4 h-4 text-blue-500" />
              Content Preview
            </span>
            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
              {file.type || 'Unknown'}
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900">
            {renderContentPreview()}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <Modal 
        isOpen={isFullscreen} 
        onClose={() => setIsFullscreen(false)} 
        title={file.name}
        size="lg"
      >
        <div className="flex justify-center items-center min-h-[300px]">
          <img 
            src={preview} 
            alt={file.name} 
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      </Modal>
    </>
  );
};

export default function UploadZone() {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: { 
      generateQR: true, 
      setExpiry: false,
      requirePassword: false,
      notifyOnView: false,
      password: '',
    }
  });
  
  const generateQR = watch('generateQR');
  const setExpiry = watch('setExpiry');
  const requirePassword = watch('requirePassword');
  const fileName = watch('fileName');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setValue('fileName', acceptedFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({ 
    onDrop, 
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
    }
  });

  const handleUpload = async (data) => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', data.fileName || selectedFile.name);
      formData.append('generateQR', data.generateQR);
      formData.append('setExpiry', data.setExpiry);
      if (data.setExpiry && data.expiresAt) {
        formData.append('expiresAt', data.expiresAt);
      }
      formData.append('requirePassword', data.requirePassword);
      if (data.requirePassword && data.password) {
        formData.append('password', data.password);
      }
      formData.append('notifyOnView', data.notifyOnView);
      formData.append('fileSize', selectedFile.size);
      
      const result = await uploadFile(formData);
      setSuccessData(result.data);
      success('File uploaded successfully! 🎉');
    } catch (err) {
      error(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setEstimatedTime(0);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    success('Link copied to clipboard!');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSpeed(0);
    setEstimatedTime(0);
  };

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card variant="elevated" padding="xl" className="text-center border-2 border-green-200 dark:border-green-800">
          <div className="py-12">
            <div className="relative inline-block">
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                <FiCheck className="w-14 h-14 text-white" />
              </div>
              <motion.div 
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <h2 className="mt-8 text-4xl font-bold text-gray-900 dark:text-white">
              Upload Successful! 🎉
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Your document has been uploaded and is ready to share
            </p>

            <div className="mt-10 max-w-2xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 text-left space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${getFileColor({ type: successData.type })}`}>
                    {getFileIcon({ type: successData.type })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {successData.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(successData.size)} • {successData.views || 0} views
                    </p>
                  </div>
                </div>

                {successData.requirePassword && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl">
                    <FiLock className="w-5 h-5" />
                    <span>Password protected document</span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Shareable Link</p>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <code className="flex-1 px-3 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                      {successData.shareableUrl || successData.shareableLink}
                    </code>
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleCopyLink(successData.shareableUrl || successData.shareableLink)}
                      className="flex-shrink-0"
                    >
                      <FiCopy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {generateQR && (
                  <div className="flex justify-center pt-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                      <QRCodeSVG value={successData.shareableUrl || successData.shareableLink} size={180} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={() => navigate(`/view/${successData.shareableLink}`)}
                  className="px-8 py-3 text-base"
                >
                  <FiEye className="w-5 h-5 mr-2" />
                  View Document
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setSuccessData(null); 
                    setSelectedFile(null);
                    setValue('fileName', '');
                  }}
                  className="px-8 py-3 text-base"
                >
                  <FiRefreshCw className="w-5 h-5 mr-2" />
                  Upload Another
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/dashboard/my-uploads')}
                  className="px-8 py-3 text-base"
                >
                  <FiFolder className="w-5 h-5 mr-2" />
                  My Uploads
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Upload Your Document
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Share your documents instantly with smart, secure links
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card variant="glass" padding="xl" className="backdrop-blur-sm shadow-2xl border-white/30 dark:border-gray-700/50">
          {!selectedFile ? (
            <div>
              <div 
                {...getRootProps()} 
                className={cn(
                  'relative border-3 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500',
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <motion.div 
                    className="relative"
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                      <FiUploadCloud className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <span className="text-white text-lg font-bold">+</span>
                    </div>
                  </motion.div>
                  
                  <p className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop your file here...' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    or click to browse from your computer
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    {['PDF', 'Images', 'DOC/DOCX', 'Excel', 'TXT', 'JSON'].map((format) => (
                      <span key={format} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                        {format}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-gray-400">Max file size: 50MB</p>
                </div>
              </div>

              {fileRejections.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
                >
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5" />
                    {fileRejections[0]?.errors[0]?.message || 'Invalid file type'}
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* File Preview with Content */}
                <FilePreview 
                  file={selectedFile} 
                  onRemove={handleRemoveFile}
                  uploading={uploading}
                />

                {/* Upload Progress */}
                {uploading && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Uploading...</span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiZap className="w-3 h-3" />
                        {uploadSpeed > 0 ? `${uploadSpeed} KB/s` : 'Starting...'}
                      </span>
                      <span>{estimatedTime > 0 ? `~${estimatedTime}s remaining` : 'Processing...'}</span>
                    </div>
                  </motion.div>
                )}

                {/* Upload Settings */}
                {!uploading && (
                  <form onSubmit={handleSubmit(handleUpload)} className="space-y-6">
                    {/* File Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        File Name <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        {...register('fileName')}
                        className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none text-lg"
                        placeholder="Enter a custom name for your file"
                      />
                    </div>

                    {/* Settings Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <FiSettings className="w-5 h-5" />
                      {showSettings ? 'Hide advanced settings' : 'Show advanced settings'}
                      <FiChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Advanced Settings */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-5 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                {...register('generateQR')}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Generate QR Code
                              </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                {...register('notifyOnView')}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Notify on view
                              </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                {...register('setExpiry')}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                <FiClock className="inline w-4 h-4 mr-1" />
                                Set expiration date
                              </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                {...register('requirePassword')}
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                <FiLock className="inline w-4 h-4 mr-1" />
                                Password protect
                              </span>
                            </label>
                          </div>

                          {setExpiry && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FiCalendar className="inline w-4 h-4 mr-2" />
                                Expiration Date
                              </label>
                              <input
                                type="datetime-local"
                                {...register('expiresAt')}
                                className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
                              />
                            </div>
                          )}

                          {requirePassword && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FiShield className="inline w-4 h-4 mr-2" />
                                Password Protection
                              </label>
                              <div className="relative">
                                <input
                                  type={passwordVisible ? 'text' : 'password'}
                                  {...register('password')}
                                  className="w-full px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none pr-14"
                                  placeholder="Enter a password (min 6 characters)"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPasswordVisible(!passwordVisible)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {passwordVisible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                              </div>
                              <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <FiInfo className="w-4 h-4" />
                                Recipients will need this password to view the document
                              </p>
                              {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                  <FiAlertCircle className="w-4 h-4" />
                                  {errors.password.message}
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Upload Button */}
                    <Button
                      type="submit"
                      disabled={uploading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                    >
                      <FiUploadCloud className="w-6 h-6 mr-3" />
                      Upload File
                      <FiArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </motion.div>

      {/* Footer */}
      {!selectedFile && !successData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure, encrypted uploads • <FiShield className="inline w-4 h-4 mr-1" />
            End-to-end encryption • <FiGlobe className="inline w-4 h-4 mx-1" />
            Available worldwide
          </p>
        </motion.div>
      )}
    </div>
  );
}