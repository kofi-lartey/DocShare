// Shared binary / download / file-category helpers used by the document
// preview components. Centralising these removes the ~15 duplicated base64
// decode loops and the scattered MIME-type checks that previously lived in
// every preview.

// Decode a Base64 string (whitespace/newline tolerant) into a Uint8Array
// without corrupting binary bytes.
export function base64ToBytes(base64) {
  const clean = String(base64).replace(/\s+/g, '');
  const binaryString = atob(clean);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function base64ToBlob(base64, type) {
  return new Blob([base64ToBytes(base64)], { type: type || 'application/octet-stream' });
}

export function base64ToObjectURL(base64, type) {
  return URL.createObjectURL(base64ToBlob(base64, type));
}

// Build a short-lived object URL from a URL, data: URI, or inline base64.
// Returns null when the source cannot be resolved. The caller is responsible
// for revoking the URL (prefer the useObjectUrl hook).
export async function resolveObjectURL(src, type) {
  if (!src) return null;
  if (src.startsWith('data:')) return base64ToObjectURL(src.split(',')[1] || '', type);
  if (/^https?:\/\//.test(src)) {
    const resp = await fetch(src);
    if (!resp.ok) throw new Error('Failed to fetch file');
    return URL.createObjectURL(await resp.blob());
  }
  // Bare base64
  return base64ToObjectURL(src, type);
}

// Trigger a browser download for an in-memory blob.
export function triggerDownload(blob, filename = 'document') {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Categorise a file into a stable key used by the preview registry. Office
// formats are detected by extension FIRST because a DOCX/XLSX is a ZIP of XML
// and many backends mislabel it as text/xml or application/octet-stream.
export function getFileCategory(file) {
  const type = (file?.type || '').toLowerCase();
  const name = (file?.name || '').toLowerCase();

  if (
    name.endsWith('.docx') || name.endsWith('.doc') || name.endsWith('.rtf') ||
    name.endsWith('.odt') ||
    type.includes('word') || type.includes('officedocument')
  ) {
    return 'word';
  }
  if (
    name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') ||
    name.endsWith('.ods') ||
    type.includes('spreadsheet') || type.includes('excel') || type.includes('sheet')
  ) {
    return 'excel';
  }
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('image')) return 'image';
  if (type.includes('video')) return 'video';
  if (type.includes('audio')) return 'audio';
  if (
    type.startsWith('text/') || type.includes('json') || type.includes('javascript') ||
    type.includes('css') || type.includes('html') || type.includes('xml')
  ) {
    return 'text';
  }
  return 'other';
}
