import { useState, useEffect, useRef, useCallback } from "react";
import { useGetPayablePresignedUrlMutation } from "@/redux/api/payableApi";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

interface PayableFileUploaderProps {
  token: string;
  onUploadSuccess: (url: string, name: string) => void;
  onClear: () => void;
  onUploadingChange?: (isUploading: boolean) => void;
  initialFileName?: string | null;
  initialFileUrl?: string | null;
}

export default function PayableFileUploader({
  token,
  onUploadSuccess,
  onClear,
  onUploadingChange,
  initialFileName,
  initialFileUrl,
}: PayableFileUploaderProps) {
  const [getPresignedUrl] = useGetPayablePresignedUrlMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(initialFileName || null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(initialFileUrl || null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragCounter = useRef<number>(0);

  // Notify parent of uploading state changes
  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const uploadFileToS3 = useCallback(
    async (file: File) => {
      if (!token) return;
      setIsUploading(true);
      setUploadProgress(10);
      setUploadError(null);

      try {
        const fileExt = file.name.split(".").pop() || "pdf";
        const fileType = file.type || (fileExt.toLowerCase() === "pdf" ? "application/pdf" : "application/octet-stream");

        const presigned = await getPresignedUrl({
          token,
          fileName: file.name,
          fileType,
          folder: "payable-invoices",
        }).unwrap();

        if (!presigned || !presigned.uploadUrl) {
          throw new Error("Unable to obtain secure upload URL.");
        }

        setUploadProgress(35);

        // Track upload progress via XHR
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presigned.uploadUrl);
        xhr.setRequestHeader("Content-Type", fileType);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = 35 + Math.round((event.loaded / event.total) * 60);
            setUploadProgress(percentComplete);
          }
        };

        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Storage server returned error status ${xhr.status}.`));
            }
          };
          xhr.onerror = () => reject(new Error("Network connection error during file upload."));
        });

        xhr.send(file);
        await uploadPromise;

        setUploadProgress(100);
        setUploadedFileName(file.name);
        setUploadedFileUrl(presigned.fileUrl);
        onUploadSuccess(presigned.fileUrl, file.name);
      } catch (err) {
        console.error("Payable upload error:", err);
        const errorResponse = err as { data?: { message?: string }; message?: string };
        setUploadError(errorResponse.data?.message || errorResponse.message || "Failed to upload invoice document.");
        setSelectedFile(null);
        setUploadedFileName(null);
        setUploadedFileUrl(null);
        onClear();
      } finally {
        setIsUploading(false);
      }
    },
    [token, getPresignedUrl, onUploadSuccess, onClear],
  );

  // Handle drag and drop on window
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.types.includes("Files")) {
        dragCounter.current++;
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragging(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          setUploadError("Only PDF files are allowed for invoice upload.");
          setSelectedFile(null);
          onClear();
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          setUploadError("File size exceeds 25MB limit.");
          setSelectedFile(null);
          onClear();
          return;
        }
        setSelectedFile(file);
        setUploadError(null);
        uploadFileToS3(file);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [uploadFileToS3, onClear]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Only PDF files are allowed for invoice upload.");
        setSelectedFile(null);
        onClear();
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setUploadError("File size exceeds 25MB limit.");
        setSelectedFile(null);
        onClear();
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      uploadFileToS3(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadedFileName(null);
    setUploadedFileUrl(null);
    setUploadProgress(0);
    setUploadError(null);
    onClear();
  };

  return (
    <div>
      {/* Full screen drag backdrop */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 transition-all duration-300 animate-in fade-in">
          <div className="bg-white/95 max-w-md w-full border-4 border-dashed border-blue-500 rounded-3xl p-10 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
              <Upload className="h-12 w-12 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Drop your invoice PDF here</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Drop your payable invoice PDF document to upload it. Only PDF format is accepted.
            </p>
          </div>
        </div>
      )}

      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Invoice Document (PDF) <span className="text-red-500">*</span>
      </label>

      {/* Upload Box */}
      {!uploadedFileUrl && !isUploading && (
        <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-blue-400 transition-colors bg-slate-50/50">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex text-sm text-slate-600 justify-center items-center gap-1">
              <label className="relative cursor-pointer font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                <span>Browse file</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                />
              </label>
              <span>or drag and drop here</span>
            </div>
            <p className="text-xs text-slate-400">Official invoice PDF up to 25MB</p>
          </div>
        </div>
      )}

      {/* File Uploading Progress */}
      {isUploading && (
        <div className="mt-2 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600 animate-pulse" />
              Uploading {selectedFile?.name || "invoice"}...
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-100/70 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Successfully Uploaded File Display */}
      {uploadedFileUrl && !isUploading && (
        <div className="mt-2 flex items-center justify-between p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">
                {uploadedFileName || selectedFile?.name || "Invoice Document.pdf"}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium mt-0.5">
                <span>Upload ready</span>
                {selectedFile && (
                  <>
                    <span>•</span>
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
            title="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-xs text-red-600 font-medium animate-in fade-in">
          {uploadError}
        </p>
      )}
    </div>
  );
}
