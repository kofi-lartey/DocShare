import { formatDate } from '../../utils/helpers';
import { FiFile, FiTrash2, FiEye, FiShare2, FiMoreVertical, FiFileText, FiImage, FiVideo } from 'react-icons/fi';
import { useState } from 'react';
import { Badge } from '../common/Badge';
import Button from '../common/Button';
import { cn } from '../../utils/helpers';

const getFileIcon = (type) => {
  if (type.includes('pdf')) return <FiFileText className="text-red-500" size={20} />;
  if (type.includes('image')) return <FiImage className="text-blue-500" size={20} />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FiFile className="text-green-500" size={20} />;
  if (type.includes('video')) return <FiVideo className="text-purple-500" size={20} />;
  return <FiFile className="text-gray-500" size={20} />;
};

export default function RecentActivity({ data }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">File</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Views</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.map((file) => (
              <tr key={file._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{file.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(file.createdAt)}</td>
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{file.views}</td>
                <td className="py-3 px-4"><Badge variant={file.status === 'active' ? 'success' : 'error'}>{file.status}</Badge></td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"><FiEye className="text-gray-500" size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"><FiShare2 className="text-gray-500" size={16} /></button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-red-600"><FiTrash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
