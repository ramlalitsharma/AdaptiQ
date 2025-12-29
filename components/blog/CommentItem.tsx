'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, ThumbsUp, MoreVertical, Trash2 } from 'lucide-react';
import { CommentForm } from './CommentForm';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';

const MarkdownPreview = dynamic(
    () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
    { ssr: false }
);

interface Comment {
    _id: string;
    userId: string;
    userName: string;
    userImage?: string;
    content: string;
    createdAt: string;
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    onReply: (parentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    currentUserId: string | null;
    depth?: number;
}

export function CommentItem({
    comment,
    onReply,
    onDelete,
    currentUserId,
    depth = 0
}: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const handleReplySubmit = async (content: string) => {
        setIsSubmittingReply(true);
        try {
            await onReply(comment._id, content);
            setIsReplying(false);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            setIsDeleting(true);
            try {
                await onDelete(comment._id);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const isAuthor = currentUserId === comment.userId;
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })
        .replace('about ', '')
        .replace('less than a minute', 'Just now')
        .replace('minute', 'm')
        .replace('minutes', 'm')
        .replace('hour', 'h')
        .replace('hours', 'h')
        .replace('day', 'd')
        .replace('days', 'd');

    return (
        <div className={`group relative ${depth > 0 ? 'ml-8 md:ml-12 mt-4' : 'mt-6 ml-0'}`}>
            {/* Child's Horizontal Branch: Connects this reply to its parent's trunk */}
            {depth > 0 && (
                <>
                    <div
                        style={{ left: '-17px', width: '17px' }}
                        className="absolute top-5 h-[2px] bg-slate-700/50 md:hidden"
                    />
                    <div
                        style={{ left: '-31px', width: '31px' }}
                        className="absolute top-5 h-[2px] bg-slate-700/50 hidden md:block"
                    />
                </>
            )}

            <div className="flex gap-2 items-start">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700/50 shadow-sm z-10">
                    {comment.userImage ? (
                        <img src={comment.userImage} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                            {comment.userName.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-start max-w-[calc(100%-2.5rem)] md:max-w-[calc(100%-3rem)]">
                    {/* The Bubble */}
                    <div className="bg-slate-800/80 dark:bg-[#242526] px-4 py-2 rounded-[1.2rem] group/bubble relative shadow-sm border border-white/5">
                        <div className="flex flex-col">
                            <h4 className="font-bold text-slate-100 text-[13px] hover:underline cursor-pointer leading-tight mb-0.5">
                                {comment.userName}
                            </h4>
                            <div className="text-[14.5px] text-slate-200 leading-[1.35] remark-markdown prose-invert prose-sm max-w-none">
                                <MarkdownPreview
                                    source={comment.content}
                                    wrapperElement={{ "data-color-mode": "dark" }}
                                    style={{ backgroundColor: 'transparent', fontSize: 'inherit', color: 'inherit' }}
                                />
                            </div>
                        </div>

                        {/* Reaction Count Placeholder */}
                        {isLiked && (
                            <div className="absolute -bottom-1 -right-4 bg-[#3E4042] rounded-full px-1.5 py-0.5 border border-[#18191A] flex items-center gap-1 shadow-lg scale-90">
                                <div className="bg-blue-500 rounded-full p-0.5 flex items-center justify-center">
                                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                                </div>
                                <span className="text-[10px] text-slate-300 font-medium">1</span>
                            </div>
                        )}
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-3 px-2 mt-1 select-none">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`text-[12px] font-bold transition-colors ${isLiked ? 'text-blue-500' : 'text-slate-400 hover:underline'}`}
                        >
                            Like
                        </button>
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className={`text-[12px] font-bold transition-colors ${isReplying ? 'text-indigo-400' : 'text-slate-400 hover:underline'}`}
                        >
                            Reply
                        </button>
                        <span className="text-[12px] text-slate-500 font-medium lowercase">
                            {timeAgo}
                        </span>

                        {isAuthor && (
                            <button
                                onClick={handleDelete}
                                className="text-[12px] font-bold text-slate-500 hover:text-rose-400 transition-colors hover:underline"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isReplying && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-10 mt-2 overflow-hidden"
                    >
                        <CommentForm
                            isReply
                            autoFocus
                            placeholder={`Write a reply...`}
                            onCancel={() => setIsReplying(false)}
                            onSubmit={handleReplySubmit}
                            isSubmitting={isSubmittingReply}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Render nested replies with a local Trunk Line */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="relative mt-1">
                    {/* Local Trunk Line: Connects this parent to its children */}
                    <div className="absolute left-[15px] md:left-[17px] -top-4 bottom-5 w-[2px] bg-slate-700/50 rounded-full" />

                    <div className="space-y-1">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                onReply={onReply}
                                onDelete={onDelete}
                                currentUserId={currentUserId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
