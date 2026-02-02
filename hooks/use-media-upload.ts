import { useState } from 'react';

interface UseMediaUploadReturn {
    upload: (file: File, type?: string) => Promise<{ url: string, filename: string }>;
    uploading: boolean;
    error: string | null;
}

export function useMediaUpload(): UseMediaUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File, type: string = 'media') => {
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const res = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await res.json();
            return data;
        } catch (err: any) {
            console.error('Upload hook error:', err);
            const msg = err.message || 'Upload failed';
            // User-friendly mapping
            if (msg.includes('File size')) {
                setError('File is too large (Max 50MB).');
            } else {
                setError(`Upload Error: ${msg}`);
            }
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return { upload, uploading, error };
}
