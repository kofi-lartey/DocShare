import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFiles, deleteFile } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { formatFileSize, formatDate } from '../utils/helpers';
import { STATUS_OPTIONS, SORT_OPTIONS } from '../utils/constants';
import { 
  FiFile, FiTrash2, FiEye, FiShare2, FiCode, FiDownload, 
  FiSearch, FiFilter, FiFileText, FiImage, FiVideo, FiCopy,
  FiMoreVertical, FiClock, FiTrendingUp, FiGrid, FiList,
  FiChevronLeft, FiChevronRight, FiUpload, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/common/Badge';
import Button from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';

const getFileIcon = (type) => {
  if (type?.includes('pdf')) return <FiFileText className="text-red-500" size={24} />;
  if (type?.includes('image')) return <FiImage className="text-blue-500" size={24} />;
  if (type?.includes('spreadsheet') || type?.includes('excel')) return <FiFile className="text-green-500" size={24} />;
  if (type?.includes('video')) return <FiVideo className="text-purple-500" size={24} />;
  if (type?.includes('word') || type?.includes('document')) return <FiFile className="text-blue-400" size={24} />;
  return <FiFile className="text-gray-500" size={24} />;
};

const getFileColor = (type) => {
  if (type?.includes('pdf')) return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
  if (type?.includes('image')) return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
  if (type?.includes('spreadsheet') || type?.includes('excel')) return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
  if (type?.includes('video')) return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
  if (type?.includes('word') || type?.includes('document')) return 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800';
  return 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700';
};

export default function MyUploads() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const [qrFile, setQrFile] = useState(null);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const { success, error: notifyError } = useNotification();
  const navigate = useNavigate();

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFiles({ page, limit: 10, search, filter, sort });
      setFiles(result.data);
    } catch (err) {
      notifyError(err.message || 'Failed to load files');
      if (err.message?.includes('complete your subscription')) {
        navigate('/dashboard/subscription');
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, sort, notifyError, navigate]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId);
      success('File deleted successfully');
      setFileToDelete(null);
      loadFiles();
    } catch (err) {
      notifyError(err.message || 'Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedFiles.map(id => deleteFile(id)));
      success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      setIsBulkDelete(false);
      loadFiles();
    } catch (err) {
      notifyError(err.message || 'Failed to delete files');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    success('Link copied to clipboard!');
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleAllFiles = () => {
    if (selectedFiles.length === fileList.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(fileList.map(f => f.id));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your files...</p>
      </div>
    );
  }

  const fileList = files.files || [];
  const hasPrev = page > 1;
  const hasNext = page < (files.totalPages || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Uploads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {files.totalItems || 0} files • {formatFileSize(files.totalSize || 0)} used
          </p>
        </div>
        <Link to="/dashboard/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
          <FiUpload className="w-4 h-4" />
          Upload New
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" padding="sm" className="border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{files.totalItems || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="sm" className="border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiEye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{files.totalViews || 0}</p>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="sm" className="border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileList.filter(f => f.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="glass" padding="sm" className="border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FiClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {fileList.filter(f => f.status === 'expired').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search files by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
          >
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                onClick={() => setIsBulkDelete(true)}
              >
                Delete Selected
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* File List/Grid */}
      {fileList.length === 0 ? (
        <Card variant="glass" padding="xl" className="text-center">
          <div className="py-12">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiFile className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No files found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search ? 'Try adjusting your search or filters' : 'Upload your first document to get started'}
            </p>
            {!search && (
              <Link to="/dashboard/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <FiUpload className="w-4 h-4" />
                Upload Document
              </Link>
            )}
          </div>
        </Card>
      ) : viewMode === 'list' ? (
        // List View
        <Card variant="glass" padding="md">
          <div className="space-y-2">
            {/* List Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === fileList.length && fileList.length > 0}
                  onChange={toggleAllFiles}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Uploaded</div>
              <div className="col-span-1">Views</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {fileList.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl transition-all duration-200 ${
                  selectedFiles.includes(file.id) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-2 border-transparent'
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border ${getFileColor(file.type)}`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.type || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </div>
                
                <div className="col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(file.uploadDate)}
                </div>
                
                <div className="col-span-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  {file.views || 0}
                </div>
                
                <div className="col-span-1 flex items-center">
                  <Badge variant={file.status === 'active' ? 'success' : 'error'}>
                    {file.status}
                  </Badge>
                </div>
                
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button 
                    onClick={() => handleCopyLink(file.shareableUrl || file.shareableLink)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Copy link"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setQrFile(file)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="QR Code"
                  >
                    <FiCode className="w-4 h-4" />
                  </button>
<button 
                     onClick={() => setFileToDelete(file)} 
                     className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors"
                     title="Delete"
                   >
                     <FiTrash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fileList.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className={`relative group bg-white dark:bg-gray-800 rounded-2xl border-2 p-4 transition-all duration-200 ${
                selectedFiles.includes(file.id) 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-col items-center text-center pt-6">
                <div className={`p-4 rounded-2xl border-2 ${getFileColor(file.type)}`}>
                  {getFileIcon(file.type)}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <div className="mt-2">
                  <Badge variant={file.status === 'active' ? 'success' : 'error'}>
                    {file.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">{formatDate(file.uploadDate)}</p>
                <p className="text-xs text-gray-500">{file.views || 0} views</p>
              </div>
              
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => handleCopyLink(file.shareableUrl || file.shareableLink)} 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy link"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setQrFile(file)} 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 transition-colors"
                  title="QR Code"
                >
                  <FiCode className="w-4 h-4" />
                </button>
<button 
                   onClick={() => setFileToDelete(file)} 
                   className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors"
                   title="Delete"
                 >
                   <FiTrash2 className="w-4 h-4" />
                 </button>
               </div>
             </motion.div>
           ))}
         </div>
       )}

       {/* Pagination */}
       <Card variant="glass" padding="md">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-sm text-gray-500 dark:text-gray-400">
             Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, files.totalItems || 0)} of {files.totalItems || 0} files
           </p>
           <div className="flex items-center gap-2">
             <Button
               size="sm"
               variant="outline"
               disabled={!hasPrev}
               onClick={() => setPage(p => p - 1)}
               className="flex items-center gap-1"
             >
               <FiChevronLeft className="w-4 h-4" />
               Previous
             </Button>
             <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">
               {page} / {files.totalPages || 1}
             </span>
             <Button
               size="sm"
               variant="outline"
               disabled={!hasNext}
               onClick={() => setPage(p => p + 1)}
               className="flex items-center gap-1"
             >
               Next
               <FiChevronRight className="w-4 h-4" />
             </Button>
           </div>
         </div>
       </Card>

        {/* QR Code Modal */}
        <Modal isOpen={!!qrFile} onClose={() => setQrFile(null)} title="QR Code">
          {qrFile && (
            <div className="text-center">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl inline-block">
                <QRCodeSVG value={qrFile.shareableUrl || qrFile.shareableLink} size={200} className="mx-auto" />
              </div>
              <p className="mt-4 font-medium text-gray-900 dark:text-white">{qrFile.name}</p>
              <p className="text-sm text-gray-500">Scan to view document</p>
              <button 
                onClick={() => handleCopyLink(qrFile.shareableUrl || qrFile.shareableLink)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiCopy className="w-4 h-4" />
                Copy link
              </button>
            </div>
          )}
        </Modal>

       {/* Delete Confirmation Modal */}
       <Modal 
         isOpen={!!fileToDelete || isBulkDelete} 
         onClose={() => {
           setFileToDelete(null);
           setIsBulkDelete(false);
         }} 
         title="Delete Files"
       >
         <div className="text-center">
           <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
             <FiTrash2 className="w-8 h-8 text-red-600" />
           </div>
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
             Are you sure?
           </h3>
           <p className="text-gray-500 dark:text-gray-400">
             {isBulkDelete 
               ? `This will permanently delete ${selectedFiles.length} files. This action cannot be undone.`
               : `This will permanently delete "${fileToDelete?.name}". This action cannot be undone.`
             }
           </p>
           <div className="flex gap-3 mt-6 justify-center">
             <Button 
               variant="outline" 
               onClick={() => {
                 setFileToDelete(null);
                 setIsBulkDelete(false);
               }}
             >
               Cancel
             </Button>
             <Button 
               variant="danger" 
               onClick={() => {
                 if (isBulkDelete) {
                   handleBulkDelete();
                 } else if (fileToDelete) {
                   handleDelete(fileToDelete.id);
                 }
               }}
             >
               Delete
             </Button>
           </div>
         </div>
       </Modal>
     </div>
   );
}