import { useEffect, useState } from "react";

export function useImgUrl(imgBlob: Blob | undefined) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!imgBlob) return;
    const url = URL.createObjectURL(imgBlob);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imgBlob]);
  return previewUrl;
}
