import React, { useCallback, useState, Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value: File | undefined;
  valueOnChange: Dispatch<SetStateAction<File | undefined>>;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({
  value,
  valueOnChange,
  accept = "*",
  maxSize = 5 * 1024 * 1024,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList) => {
      const file = files[0];
      if (file.size > maxSize) {
        setError(`File size should not exceed ${maxSize / 1024 / 1024}MB`);
        return;
      }
      setError(null);
      valueOnChange(file);
    },
    [maxSize, valueOnChange],
  );

  const removeFile = useCallback(() => {
    valueOnChange(undefined);
    setError(null);
  }, [valueOnChange]);

  return (
    <div className="w-full mx-auto pt-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6",
          dragActive ? "border-primary" : "border-gray-300",
          error ? "border-red-500" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Buraya sürükle bırak, ya da tıklayıp seç
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {`Maksimum dosya büyüklüğü: ${maxSize / 1024 / 1024}MB`}
          </p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {value && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileIcon className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium truncate">{value.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
