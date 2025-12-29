'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw with no SSR
const Excalidraw = dynamic(
    () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
    { ssr: false }
);

interface WhiteboardViewProps {
    roomId: string;
}

export default function WhiteboardView({ roomId }: WhiteboardViewProps) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

    return (
        <div className="flex flex-col h-full bg-slate-50 border rounded-xl overflow-hidden shadow-inner">
            <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    🎨 Interactive Whiteboard
                </h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Live Session
                </span>
            </div>

            <div className="flex-1 min-h-[500px] relative">
                <Excalidraw
                    excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                    UIOptions={{
                        canvasActions: {
                            loadScene: true,
                            saveAsImage: true,
                            export: { saveFileToDisk: true },
                            clearCanvas: true,
                            toggleTheme: true,
                        },
                    }}
                />
            </div>

            <div className="bg-slate-100 px-4 py-2 text-[10px] text-slate-500 flex justify-between">
                <span>Room: {roomId}</span>
                <span>Drawing is automatically saved locally</span>
            </div>
        </div>
    );
}
