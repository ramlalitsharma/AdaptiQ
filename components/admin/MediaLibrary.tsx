'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Loader2, Trash2, CheckCircle2, FileText, Image as ImageIcon, Video, File } from 'lucide-react';

interface MediaItem {
    _id: string;
    url: string;
    filename: string;
    type: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

interface MediaLibraryProps {
    onSelect?: (url: string) => void;
    allowSelection?: boolean;
}

export function MediaLibrary({ onSelect, allowSelection = false }: MediaLibraryProps) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        loadMedia();
    }, [filter, search]);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/media?type=${filter}&search=${search}`);
            const data = await res.json();
            setMedia(data.media || []);
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMedia(media.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const getIcon = (mime: string) => {
        if (mime.startsWith('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
        if (mime.startsWith('video')) return <Video className="w-8 h-8 text-purple-500" />;
        if (mime.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        return <File className="w-8 h-8 text-slate-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search assets..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'thumbnail', 'avatar', 'document', 'lesson-material'].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? 'inverse' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className="capitalize whitespace-nowrap"
                        >
                            {f.replace('-', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p>Loading your library...</p>
                </div>
            ) : media.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No assets found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => setSelectedId(item._id)}
                            className={`group relative aspect-square rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${selectedId === item._id
                                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                                    : 'border-slate-100 hover:border-blue-200 bg-white'
                                }`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                {item.mimeType.startsWith('image') ? (
                                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                                ) : (
                                    getIcon(item.mimeType)
                                )}
                            </div>

                            {/* Overlay for actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end">
                                    <button
                                        onClick={(e) => handleDelete(item._id, e)}
                                        className="p-1.5 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors border border-white/20"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {allowSelection && (
                                    <Button
                                        size="sm"
                                        className="w-full text-[10px] h-7 bg-blue-500 hover:bg-blue-600"
                                        onClick={() => onSelect?.(item.url)}
                                    >
                                        Select Asset
                                    </Button>
                                )}
                            </div>

                            {/* Info Bar */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-2 border-t border-slate-100">
                                <div className="text-[10px] font-bold text-slate-800 truncate mb-0.5">{item.filename}</div>
                                <div className="text-[9px] text-slate-500 flex justify-between uppercase">
                                    <span>{item.mimeType.split('/')[1]}</span>
                                    <span>{formatSize(item.size)}</span>
                                </div>
                            </div>

                            {selectedId === item._id && (
                                <div className="absolute top-2 left-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 fill-white" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
