'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MediaLibrary } from './MediaLibrary';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function ImageUploader({ value, onChange, label = 'Upload Image', accept = 'image/*' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'thumbnail');

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {value && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 mb-2">
          <img
            src={value}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            asChild
          >
            <span>{uploading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}</span>
          </Button>
        </label>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLibrary(true)}
          className="gap-2"
        >
          📂 Library
        </Button>

        {value && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter image URL"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        )}
      </div>

      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Select Media</h3>
                <p className="text-sm text-slate-500">Pick an existing asset or upload a new one.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowLibrary(false)}>✕ Close</Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <MediaLibrary
                allowSelection
                onSelect={(url) => {
                  onChange(url);
                  setShowLibrary(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!value && (
        <p className="text-xs text-slate-500">
          Upload a thumbnail image (max 5MB) or enter an image URL
        </p>
      )}
    </div>
  );
}

