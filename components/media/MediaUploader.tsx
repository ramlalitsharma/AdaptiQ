'use client';

import { useMediaUpload } from '@/hooks/use-media-upload';
import { Button } from '@/components/ui/Button';
import { useRef } from 'react';

interface MediaUploaderProps {
    onUploadComplete: (url: string, filename: string) => void;
    label?: string;
    accept?: string;
    variant?: 'button' | 'dropzone';
    className?: string;
}

export function MediaUploader({ onUploadComplete, label = 'Upload', accept = 'image/*', variant = 'button', className }: MediaUploaderProps) {
    const { upload, uploading, error } = useMediaUpload();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { url, filename } = await upload(file, accept.includes('pdf') ? 'file' : 'image');
            onUploadComplete(url, filename);
        } catch (e) {
            console.error(e);
        }
        // Reset input
        if (inputRef.current) inputRef.current.value = '';
    };

    if (variant === 'dropzone') {
        return (
            <div className={`rounded-lg border-2 border-dashed border-slate-300 p-4 text-center hover:bg-slate-50 transition-colors ${className}`}>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                {uploading ? (
                    <p className="text-sm text-slate-500">Uploading...</p>
                ) : (
                    <div onClick={() => inputRef.current?.click()} className="cursor-pointer space-y-2">
                        <div className="text-2xl">☁️</div>
                        <p className="text-sm font-medium text-slate-600">{label}</p>
                        <p className="text-xs text-slate-400">Click to select file</p>
                    </div>
                )}
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
        )
    }

    return (
        <div className={`inline-block ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />
            <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : label}
            </Button>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
