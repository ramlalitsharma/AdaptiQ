import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const MediaService = {
    /**
     * Upload a file to Supabase Storage
     * @param file The file object to upload
     * @param bucket The bucket name (defaults to 'media')
     * @returns The public URL of the uploaded file
     */
    async uploadFile(file: File, bucket: string = 'media'): Promise<string> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            console.error('Error uploading file:', error.message);
            throw error;
        }
    },

    /**
     * Delete a file from Supabase Storage
     * @param url Public URL of the file
     * @param bucket Bucket name
     */
    async deleteFile(url: string, bucket: string = 'media') {
        try {
            // Extract file path from public URL
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage
                .from(bucket)
                .remove([fileName]);

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error('Error deleting file:', error.message);
            throw error;
        }
    }
};
