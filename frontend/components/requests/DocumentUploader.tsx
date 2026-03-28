'use client';

import { useState, useRef } from 'react';

interface DocumentUploaderProps {
  requiredDocuments: string[];
  uploadedDocuments: string[];
  onDocumentsChange: (documents: string[]) => void;
  maxFileSizeMB?: number;
}

interface UploadedFile {
  name: string;
  size: number;
  url?: string;
  file?: File;
}

export function DocumentUploader({
  requiredDocuments,
  uploadedDocuments,
  onDocumentsChange,
  maxFileSizeMB = 2,
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert to bytes

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
    if (file.size > maxFileSize) {
      return `File size must not exceed ${maxFileSizeMB}MB`;
    }
    return null;
  };

  const handleFiles = async (newFiles: File[]) => {
    setError('');
    const newUploadedFiles: UploadedFile[] = [];

    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        continue;
      }

      newUploadedFiles.push({
        name: file.name,
        size: file.size,
        file,
      });
    }

    if (newUploadedFiles.length > 0) {
      setUploading(true);
      // Simulate upload - in real implementation, upload to server here
      const updatedFiles = [...files, ...newUploadedFiles];
      setFiles(updatedFiles);
      onDocumentsChange(updatedFiles.map((f) => f.name));
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onDocumentsChange(updatedFiles.map((f) => f.name));
  };

  const getDocumentStatus = (docName: string) => {
    const uploadedFile = files.find((f) => f.name === docName);
    if (uploadedFile) {
      return 'uploaded';
    }
    return 'pending';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Required Documents</h3>

      {/* Required documents checklist */}
      <div className="mb-4 space-y-2">
        {requiredDocuments.map((doc, index) => {
          const status = getDocumentStatus(doc);
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                status === 'uploaded'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    status === 'uploaded'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {status === 'uploaded' ? '✓' : index + 1}
                </span>
                <span
                  className={`text-sm ${
                    status === 'uploaded' ? 'text-green-700' : 'text-gray-700'
                  }`}
                >
                  {doc}
                </span>
              </div>
              {status === 'uploaded' && (
                <button
                  onClick={() => {
                    const fileIndex = files.findIndex((f) => f.name === doc);
                    if (fileIndex >= 0) removeFile(fileIndex);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PDF files only, maximum {maxFileSizeMB}MB each
        </p>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Uploading documents...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Uploaded Files</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
