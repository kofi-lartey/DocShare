import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { FiAlertCircle, FiUnlock } from 'react-icons/fi';
import { base64ToBytes } from '../../utils/blob';
import { usePasswordUnlock } from '../../hooks/usePasswordUnlock';
import PasswordGate from './PasswordGate';
import ImageLoader from '../common/ImageLoader';
import Button from '../common/Button';

// Resolve the spreadsheet source (Cloudinary URL, data: URI, or inline
// base64) to a Uint8Array. XLSX files are stored on Cloudinary as a URL, so
// the preview must fetch the binary over HTTP — it cannot rely on inline
// base64/fileData alone (fileData is null for Cloudinary uploads).
const resolveBytes = async (src) => {
  if (!src) throw new Error('No spreadsheet data available');
  if (src.startsWith('data:')) return base64ToBytes(src.split(',')[1] || '');
  if (/^https?:\/\//.test(src)) {
    const resp = await fetch(src);
    if (!resp.ok) throw new Error('Failed to fetch spreadsheet');
    return new Uint8Array(await resp.arrayBuffer());
  }
  return base64ToBytes(src);
};

const ExcelPreview = ({ file, isPasswordProtected, onUnlock }) => {
  const [html, setHtml] = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bytes, setBytes] = useState(null);
  const { password, setPassword, unlock, unlockError, isUnlocked, isUnlocking } =
    usePasswordUnlock(file, onUnlock);

  useEffect(() => {
    if (isUnlocked || !isPasswordProtected) {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const src = file?.fileData || file?.content || file?.url || file?.filePath;
          if (!src) {
            setError('No file data available');
            return;
          }
          const b = await resolveBytes(src);
          setBytes(b);
        } catch (err) {
          console.error('Error parsing Excel:', err);
          setError(err.message || 'Failed to parse Excel file');
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isUnlocked, isPasswordProtected]);

  // Parse the workbook once per unique binary instead of re-decoding on every
  // sheet switch.
  const workbook = useMemo(() => {
    if (!bytes) return null;
    try {
      return XLSX.read(bytes, { type: 'array' });
    } catch (e) {
      console.error('Error parsing Excel workbook:', e);
      return null;
    }
  }, [bytes]);

  // Render the active sheet to HTML whenever the workbook or selected sheet
  // changes. SheetJS does not emit column widths, so inject a <colgroup> from
  // the sheet's !cols so columns match the original document.
  useEffect(() => {
    if (!workbook) return;
    const names = workbook.SheetNames;
    setSheetNames(names);
    const sheet = workbook.Sheets[names[currentSheet]];
    if (!sheet) return;

    const raw = XLSX.utils.sheet_to_html(sheet, { editable: false });
    const themed = raw.replace(/<table/g, '<table class="xlsx-table"');
    const cols = sheet['!cols'];
    let out = themed;
    if (cols && cols.length) {
      const colEls = cols
        .map((c) => {
          const w = c ? (c.wpx || (c.wch ? Math.round(c.wch * 7 + 5) : 80)) : 80;
          return `<col style="width:${w}px" />`;
        })
        .join('');
      const tableMatch = themed.match(/<table[^>]*>/);
      if (tableMatch) {
        const insertAt = tableMatch.index + tableMatch[0].length;
        out = themed.slice(0, insertAt) + `<colgroup>${colEls}</colgroup>` + themed.slice(insertAt);
      }
    }
    setHtml(`<div class="xlsx-render">${out}</div>`);
  }, [workbook, currentSheet]);

  const handleUnlock = async () => {
    const data = await unlock();
    if (data) {
      const unlockedSource = data.filePath || data.fileData;
      if (unlockedSource) {
        setLoading(true);
        try {
          setBytes(await resolveBytes(unlockedSource));
        } catch (e) {
          console.error('Error parsing unlocked Excel:', e);
          setError(e.message || 'Failed to parse Excel file');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (isPasswordProtected && !isUnlocked) {
    return (
      <PasswordGate
        title="Password Protected"
        description="This spreadsheet is password protected"
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

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <FiAlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button size="sm" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sheetNames.length > 1 && (
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sheet:</span>
            <select
              value={currentSheet}
              onChange={(e) => setCurrentSheet(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {sheetNames.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>
            <span className="text-xs text-gray-500 ml-auto">
              {sheetNames.length} sheet{sheetNames.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;
