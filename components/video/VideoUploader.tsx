'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

interface VideoUploaderProps {
  onUploadComplete?: (uploadId: string, assetId?: string) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function VideoUploader({
  onUploadComplete,
  onError,
  maxSizeMB = 1000,
  acceptedFormats = ['video/mp4', 'video/webm', 'video/quicktime'],
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      onError?.(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      onError?.(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setCurrentFile(file);
    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);
      setProgress(0);

      const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const uploadRes = await fetch('/api/video/upload-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: file.name,
          videoId,
          provider: 'self-hosted',
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to create video record');

      const formData = new FormData();
      formData.append('video', file);
      formData.append('videoId', videoId);

      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploading(false);
            setProgress(100);
            setCurrentFile(null);
            onUploadComplete?.(videoId);
            resolve();
          } else {
            const error = `Upload failed: ${xhr.statusText}`;
            setUploading(false);
            onError?.(error);
            reject(new Error(error));
          }
        });

        xhr.addEventListener('error', () => {
          setUploading(false);
          onError?.('Upload failed. Connection interrupted.');
          reject(new Error('Connection error'));
        });

        xhr.open('POST', '/api/video/upload-file');
        xhr.send(formData);
      });
    } catch (error: any) {
      setUploading(false);
      onError?.(error.message || 'Upload failed');
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-[2.5rem] transition-all duration-300 ${dragActive
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center transform group-hover:scale-110 transition-transform">
            {uploading ? (
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-black text-slate-900">
              {uploading ? 'Processing Asset...' : 'Drag & Drop Masterpiece'}
            </h4>
            <p className="text-slate-500 font-medium">
              {currentFile ? `Uploading: ${currentFile.name}` : `Upload 4K, HD, or standard video up to ${maxSizeMB}MB`}
            </p>
          </div>

          {!uploading && (
            <Button variant="outline" className="rounded-2xl px-8 py-6 font-bold bg-white shadow-sm border-slate-200">
              Browse Files
            </Button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3 text-sm font-bold text-slate-900">
            <span className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Uploading Content
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </Progress>
          <p className="text-xs text-slate-400 mt-4 text-center font-medium">
            Keep this window open until your asset is successfully registered.
          </p>
        </div>
      )}
    </div>
  );
}
