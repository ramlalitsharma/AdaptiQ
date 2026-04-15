'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/ScrollArea'; // Wait, need to check if ScrollArea exists
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AITutor({ context }: { context?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI learning companion. How can I help you with today\'s lesson?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMsg = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    assistantMsg += chunk;
                    setMessages(prev => {
                        const next = [...prev];
                        next[next.length - 1].content = assistantMsg;
                        return next;
                    });
                }
            }
        } catch (error) {
            console.error('AI Tutor Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.button
                        layoutId="tutor-toggle"
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                    >
                        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                    </motion.button>
                ) : (
                    <motion.div
                        layoutId="tutor-toggle"
                        className="w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Learning Tutor</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Always Active</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                        >
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                                        }`}>
                                        {msg.content}
                                        {msg.content === '' && isLoading && (
                                            <div className="flex gap-1.5 py-1">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="relative">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything about the lesson..."
                                    className="pr-12 rounded-2xl border-slate-200 dark:border-slate-700 h-12 focus:ring-indigo-500"
                                />
                                <button
                                    disabled={!input.trim() || isLoading}
                                    onClick={handleSend}
                                    className="absolute right-1 top-1 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">Powered by AdaptiQ AI Engines</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
