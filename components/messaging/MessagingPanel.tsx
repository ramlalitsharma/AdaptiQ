'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
}

export function MessagingPanel() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const withUserId = searchParams.get('with');

  useEffect(() => {
    loadConversations().then((loadedConvs) => {
      if (withUserId && loadedConvs) {
        // Try to find if we already have a conversation with this person
        const existing = loadedConvs.find((c: Conversation) => c.participants.includes(withUserId));
        if (existing) {
          setSelectedConversation(existing.id);
        } else {
          // If not found, create it
          startNewConversation(withUserId);
        }
      }
    });
  }, [withUserId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      const interval = setInterval(() => {
        loadMessages(selectedConversation);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/messaging/conversations');
      const data = await res.json();
      if (res.ok) {
        const convs = data.conversations || [];
        setConversations(convs);
        return convs;
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    return null;
  };

  const startNewConversation = async (recipientId: string) => {
    try {
      const res = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        loadConversations();
        setSelectedConversation(data.conversation._id || data.conversation.id);
      }
    } catch (error) {
      console.error('Failed to start new conversation:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messaging/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        loadMessages(selectedConversation);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex dark:bg-slate-800 dark:border-slate-700">
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedConversation === conv.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                    }`}
                >
                  <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{conv.participants.length} participants</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{conv.lastMessage}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="flex-shrink-0 border-b border-slate-100 dark:border-slate-700">
              <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${message.senderId === 'current-user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                disabled={loading}
              />
              <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()} variant="inverse">
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </Card>
  );
}

