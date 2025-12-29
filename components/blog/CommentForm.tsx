'use client';

import React, { useState } from 'react';
import { Send, Smile, Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
    isReply?: boolean;
    isSubmitting?: boolean;
}

const COMMON_EMOJIS = ['😀', '😂', '😍', '🚀', '👍', '🙏', '🔥', '👏', '💡', '🎉', '💯', '✨'];

export function CommentForm({
    onSubmit,
    placeholder = "Write a comment...",
    autoFocus = false,
    onCancel,
    isReply = false,
    isSubmitting = false
}: CommentFormProps) {
    const { user } = useUser();
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!content.trim() && !attachment) || isSubmitting) return;

        const finalContent = attachment ? `${content}\n\n![Image](${attachment})` : content;
        await onSubmit(finalContent);
        setContent('');
        setAttachment(null);
    };

    const handleEmojiClick = (emoji: string) => {
        setContent(prev => prev + emoji);
        // Keep picker open as FB does, or close? I'll close for better mobile UX
        setShowEmojiPicker(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'comment');

        try {
            const res = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setAttachment(data.url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`flex gap-2 ${isReply ? 'mt-2' : 'mt-6'}`}>
            {/* Current User Avatar */}
            <div className={`flex-shrink-0 ${isReply ? 'w-7 h-7' : 'w-8 h-8 md:w-9 md:h-9'} rounded-full bg-slate-800 overflow-hidden border border-slate-700/50`}>
                {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                        Me
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-w-0">
                <div className="relative flex flex-col gap-2">
                    <div className="relative group/input flex items-center bg-[#3A3B3C]/50 hover:bg-[#3A3B3C]/80 focus-within:bg-[#3A3B3C]/80 rounded-[1.5rem] transition-colors border border-transparent focus-within:border-white/10">
                        <textarea
                            autoFocus={autoFocus}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder={placeholder}
                            rows={1}
                            className="flex-1 bg-transparent py-2.5 px-4 text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all resize-none min-h-[36px] max-h-[150px] overflow-y-auto text-sm"
                        />

                        {/* Icons Area */}
                        <div className="pr-2 flex items-center gap-1">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${showEmojiPicker ? 'text-indigo-400' : 'text-slate-400'}`}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>

                                <AnimatePresence>
                                    {showEmojiPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute bottom-full mb-4 right-0 p-3 bg-[#242526] border border-[#3E4042] rounded-2xl shadow-2xl z-50 flex flex-wrap gap-2 w-48 backdrop-blur-xl"
                                        >
                                            {COMMON_EMOJIS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => handleEmojiClick(emoji)}
                                                    className="p-1 text-xl hover:scale-125 transition-transform"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!!attachment || isUploading}
                                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 transition-colors disabled:opacity-30"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>

                            {(content.trim() || attachment) && (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-all disabled:opacity-30"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Attachment Preview Below Input */}
                    <AnimatePresence>
                        {attachment && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="pl-2"
                            >
                                <div className="relative group/img inline-block">
                                    <img src={attachment} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-white/10 shadow-lg" />
                                    <button
                                        type="button"
                                        onClick={() => setAttachment(null)}
                                        className="absolute -top-1 -right-1 bg-[#3E4042] text-white p-1 rounded-full shadow-lg border border-white/10 hover:bg-[#4E4F50] transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="self-start text-[11px] text-slate-500 hover:text-slate-300 font-bold ml-2 -mt-1"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
