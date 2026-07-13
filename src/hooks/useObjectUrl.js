import { useEffect, useState } from 'react';
import { base64ToBlob } from '../utils/blob';

// Creates a memory-safe object URL from a URL/data: URI/base64 source and
// automatically revokes it on unmount or when the source changes, preventing
// the object-URL memory leaks that previously accumulated across previews.
export function useObjectUrl(src, type) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let revoked = false;
    const cleanup = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    if (!src) {
      setUrl(null);
      return cleanup;
    }

    if (/^https?:\/\//.test(src) || src.startsWith('data:')) {
      if (/^https?:\/\//.test(src)) {
        fetch(src)
          .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('Fetch failed'))))
          .then((blob) => {
            if (!revoked) {
              objectUrl = URL.createObjectURL(blob);
              setUrl(objectUrl);
            }
          })
          .catch(() => !revoked && setUrl(null));
      } else {
        try {
          objectUrl = URL.createObjectURL(base64ToBlob(src.split(',')[1] || '', type));
          setUrl(objectUrl);
        } catch {
          setUrl(null);
        }
      }
      return () => {
        revoked = true;
        cleanup();
      };
    }

    // Bare base64
    try {
      objectUrl = URL.createObjectURL(base64ToBlob(src, type));
      setUrl(objectUrl);
    } catch {
      setUrl(null);
    }
    return () => {
      revoked = true;
      cleanup();
    };
  }, [src, type]);

  return url;
}
