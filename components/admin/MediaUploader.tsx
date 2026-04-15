'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MediaService } from '@/lib/media-service';
import { toast } from 'react-hot-toast';

interface MediaUploaderProps {
    onUploadComplete: (url: string) => void;
    currentValue?: string;
    label?: string;
    className?: string;
}

export function MediaUploader({
    onUploadComplete,
    currentValue,
    label = "Upload Image",
    className = ""
}: MediaUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Check size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Uploading to Supabase...');

        try {
            const url = await MediaService.uploadFile(file);
            onUploadComplete(url);
            toast.success('Upload successful!', { id: toastId });
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(`Upload failed: ${error.message}`, { id: toastId });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">{label}</label>}

            <div className="relative group">
                <div
                    className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 group-hover:border-blue-300 group-hover:text-blue-300 transition-all cursor-pointer overflow-hidden relative"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {currentValue ? (
                        <div className="relative w-full h-full group">
                            <img src={currentValue} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="text-white" size={24} />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest ml-2">Change Image</span>
                            </div>
                        </div>
                    ) : isUploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Click to Upload</span>
                            <span className="text-[8px] text-slate-400 font-bold mt-1">MAX 5MB (JPG, PNG)</span>
                        </>
                    )}
                </div>

                {currentValue && !isUploading && (
                    <Button
                        size="xs"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-100 text-red-600 hover:bg-red-200 shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onUploadComplete('');
                        }}
                    >
                        <X size={14} />
                    </Button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            </div>
        </div>
    );
}
