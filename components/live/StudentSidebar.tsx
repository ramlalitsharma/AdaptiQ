'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import WhiteboardView from './WhiteboardView';

interface StudentSidebarProps {
  roomId: string;
  isInstructor: boolean;
}

export function StudentSidebar({ roomId, isInstructor }: StudentSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'qna' | 'polls' | 'resources' | 'whiteboard'>('chat');
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [qnaQueue, setQnaQueue] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLocked, setChatLocked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    if (activeTab === 'chat') {
      fetch(`/api/live/chat?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setChatMessages(data.data?.messages || []))
        .catch(console.error);
    } else if (activeTab === 'notes') {
      fetch(`/api/live/student/notes?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setNotes(data.data?.notes || []))
        .catch(console.error);
    } else if (activeTab === 'qna') {
      fetch(`/api/live/qna?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setQnaQueue(data.data?.pending || []))
        .catch(console.error);
    } else if (activeTab === 'polls') {
      fetch(`/api/live/student/polls?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setPolls(data.data?.active || []))
        .catch(console.error);
    } else if (activeTab === 'resources') {
      fetch(`/api/live/student/resources?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setResources(data.data?.resources || []))
        .catch(console.error);
    }
  }, [activeTab, roomId]);

  // Live updates via SSE
  useEffect(() => {
    if (activeTab !== 'chat') return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/live/chat/stream?roomId=${roomId}`);
      es.addEventListener('message', (evt: MessageEvent) => {
        try {
          const { type, payload } = JSON.parse(evt.data);
          if (type === 'chat.message') {
            setChatMessages((prev) => [...prev, payload]);
          } else if (type === 'chat.delete') {
            setChatMessages((prev) => prev.filter((m) => String(m._id) !== String(payload.messageId)));
          } else if (type === 'chat.pin') {
            setChatMessages((prev) => prev.map((m) => (String(m._id) === String(payload.messageId) ? { ...m, isPinned: true } : m)));
          } else if (type === 'chat.unpin') {
            setChatMessages((prev) => prev.map((m) => (String(m._id) === String(payload.messageId) ? { ...m, isPinned: false } : m)));
          } else if (type === 'chat.lock') {
            setChatLocked(Boolean(payload.locked));
          }
        } catch {}
      });
    } catch {}
    return () => {
      if (es) es.close();
    };
  }, [activeTab, roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'chat') {
        fetch(`/api/live/chat?roomId=${roomId}`)
          .then((res) => res.json())
          .then((data) => setChatMessages(data.data?.messages || []))
          .catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, roomId]);

  const handleSaveNote = () => {
    if (!newNote.trim()) return;

    fetch('/api/live/student/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        content: newNote,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setNewNote('');
        // Reload notes
        fetch(`/api/live/student/notes?roomId=${roomId}`)
          .then((res) => res.json())
          .then((data) => setNotes(data.data?.notes || []))
          .catch(console.error);
      })
      .catch(console.error);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    try {
      const res = await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, content: chatInput, type: attachmentUrl ? 'image' : 'text', imageUrl: attachmentUrl || null }),
      });
      if (res.ok) {
        setChatInput('');
        setAttachmentUrl(null);
        const data = await fetch(`/api/live/chat?roomId=${roomId}`).then((r) => r.json());
        setChatMessages(data.data?.messages || []);
      }
    } catch (e) {}
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('roomId', roomId);
      const res = await fetch('/api/live/chat/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setAttachmentUrl(data.url);
      }
    } catch (e) {
    } finally {
      setUploading(false);
    }
  };

  const handleRaiseHand = () => {
    fetch('/api/live/qna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: handRaised ? 'lower' : 'raise',
        roomId,
        question: question || undefined,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setHandRaised(!handRaised);
        setQuestion('');
        // Reload queue
        fetch(`/api/live/qna?roomId=${roomId}`)
          .then((res) => res.json())
          .then((data) => setQnaQueue(data.data?.pending || []))
          .catch(console.error);
      })
      .catch(console.error);
  };

  const handleVote = (pollId: string, selectedOptions: number[]) => {
    fetch('/api/live/student/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vote',
        roomId,
        pollId,
        selectedOptions,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        // Reload polls
        fetch(`/api/live/student/polls?roomId=${roomId}`)
          .then((res) => res.json())
          .then((data) => setPolls(data.data?.active || []))
          .catch(console.error);
      })
      .catch(console.error);
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'chat' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Button>
          <Button
            variant={activeTab === 'notes' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </Button>
          <Button
            variant={activeTab === 'qna' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('qna')}
          >
            Q&A
            {qnaQueue.length > 0 && (
              <Badge variant="info" className="ml-1">
                {qnaQueue.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'polls' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('polls')}
          >
            Polls
            {polls.length > 0 && (
              <Badge variant="info" className="ml-1">
                {polls.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'resources' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </Button>
          <Button
            variant={activeTab === 'whiteboard' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('whiteboard')}
          >
            Whiteboard
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg._id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{msg.userName || 'Student'}</p>
                    {msg.createdAt && (
                      <p className="text-xs text-slate-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {msg.isPinned && <p className="text-[10px] text-amber-600">Pinned</p>}
                  <p className="text-sm text-slate-700 mt-1 break-words">{msg.content}</p>
                  {msg.url && (
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Open Attachment →
                    </a>
                  )}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="attachment"
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No messages yet</p>
              )}
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && e.target.files[0] && handleUpload(e.target.files[0])}
                />
                {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
                {attachmentUrl && <span className="text-xs text-teal-600">Attachment ready</span>}
              </div>
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[60px]"
              />
              <Button onClick={handleSendChat} variant="inverse" size="sm" className="mt-2">
                Send
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Take notes during class..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[100px]"
              />
              <Button onClick={handleSaveNote} variant="inverse" size="sm" className="mt-2">
                Save Note
              </Button>
            </div>
            <div className="space-y-2">
              {notes.map((note, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <p className="text-slate-700">{note.content}</p>
                  {note.timestamp && (
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.floor(note.timestamp / 60)}:{(note.timestamp % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qna' && (
          <div className="space-y-4">
            <div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question (optional)..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 min-h-[80px]"
              />
              <Button
                onClick={handleRaiseHand}
                variant={handRaised ? 'outline' : 'inverse'}
                size="sm"
                className="mt-2 w-full"
              >
                {handRaised ? '✋ Lower Hand' : '✋ Raise Hand'}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Questions Queue</p>
              {qnaQueue.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{item.userName}</p>
                      {item.question && (
                        <p className="text-slate-600 mt-1">{item.question}</p>
                      )}
                    </div>
                    <Badge variant="info">#{item.priority}</Badge>
                  </div>
                </div>
              ))}
              {qnaQueue.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No questions yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll._id} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900 mb-3">{poll.question}</p>
                <div className="space-y-2">
                  {poll.options.map((option: string, idx: number) => (
                    <Button
                      key={idx}
                      variant={poll.hasVoted ? 'outline' : 'inverse'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => !poll.hasVoted && handleVote(poll._id, [idx])}
                      disabled={poll.hasVoted}
                    >
                      {option}
                      {poll.hasVoted && poll.votes?.some((v: any) => v.selectedOptions?.includes(idx)) && ' ✓'}
                    </Button>
                  ))}
                </div>
                {poll.hasVoted && (
                  <p className="text-xs text-slate-500 mt-2">
                    {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                  </p>
                )}
              </div>
            ))}
            {polls.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No active polls</p>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource._id} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{resource.title}</p>
                    {resource.description && (
                      <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                    )}
                  </div>
                  <Badge variant="info">{resource.type}</Badge>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  Open Resource →
                </a>
              </div>
            ))}
            {resources.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No resources available</p>
            )}
          </div>
        )}
        {activeTab === 'whiteboard' && (
          <div className="h-full min-h-[500px]">
            <WhiteboardView roomId={roomId} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

