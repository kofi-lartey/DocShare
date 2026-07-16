import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (!isFinite(bytes)) return 'Unlimited';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isValidDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === 'string' || typeof value === 'number') {
    return !Number.isNaN(new Date(value).getTime());
  }
  return false;
}

export function formatDateTime(dateString) {
  if (!isValidDate(dateString)) return 'Invalid Date';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileIcon(type) {
  if (type.includes('pdf')) return 'FilePdf';
  if (type.includes('image')) return 'FileImage';
  if (type.includes('word') || type.includes('document')) return 'FileDoc';
  if (type.includes('excel') || type.includes('spreadsheet')) return 'FileXls';
  if (type.includes('video')) return 'FileVideo';
  if (type.includes('audio')) return 'FileAudio';
  if (type.includes('zip') || type.includes('compressed')) return 'FileZip';
  return 'File';
}

export function generateMockId() {
  return 'file_' + Math.random().toString(36).substr(2, 9);
}
