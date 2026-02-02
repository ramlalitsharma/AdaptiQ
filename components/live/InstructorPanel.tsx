'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ParticipantManagement } from './ParticipantManagement';
import Image from 'next/image';

interface InstructorPanelProps {
  roomId: string;
  jitsiApi: any;
}

export function InstructorPanel({ roomId, jitsiApi }: InstructorPanelProps) {
  const [activeTab, setActiveTab] = useState<'participants' | 'qna' | 'polls' | 'chat' | 'breakouts'>('participants');
  const [qnaQueue, setQnaQueue] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''], type: 'single' });
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatState, setChatState] = useState<{ locked: boolean; mutes: Array<{ userId: string; until?: string }> }>({ locked: false, mutes: [] });
  const [breakoutRooms, setBreakoutRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [participants, setParticipants] = useState<Array<{ userId: string; userName: string }>>([]);

  const fetchQnaQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/qna?roomId=${roomId}`);
      const data = await res.json();
      if (data.success) {
        setQnaQueue(data.data?.pending || []);
      }
    } catch (error) {
      console.error('Failed to fetch Q&A queue:', error);
    }
  }, [roomId]);

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/student/polls?roomId=${roomId}`);
      const data = await res.json();
      if (data.success) {
        setPolls(data.data?.active || []);
      }
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    }
  }, [roomId]);

  useEffect(() => {
    if (activeTab === 'qna') {
      setTimeout(() => fetchQnaQueue(), 0);
      const interval = setInterval(fetchQnaQueue, 3000);
      return () => clearInterval(interval);
    } else if (activeTab === 'polls') {
      setTimeout(() => fetchPolls(), 0);
      const interval = setInterval(fetchPolls, 3000);
      return () => clearInterval(interval);
    } else if (activeTab === 'chat') {
      fetch(`/api/live/chat?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setChatMessages(data.data?.messages || []))
        .catch(() => {});
      fetch(`/api/live/chat/moderate?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => setChatState({ locked: Boolean(data.data?.locked), mutes: data.data?.mutes || [] }))
        .catch(() => {});
      const interval = setInterval(() => {
        fetch(`/api/live/chat?roomId=${roomId}`)
          .then((res) => res.json())
          .then((data) => setChatMessages(data.data?.messages || []))
          .catch(() => {});
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, roomId, fetchQnaQueue, fetchPolls]);

  useEffect(() => {
    if (activeTab === 'breakouts') {
      fetch(`/api/live/participants?roomId=${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          const list = (data.data?.participants || []).map((p: any) => ({ userId: p.userId, userName: p.userName }));
          setParticipants(list);
        })
        .catch(() => {});
    }
  }, [activeTab, roomId]);

  const handleCreateBreakoutRoom = () => {
    const name = `Room ${breakoutRooms.length + 1}`;
    const id = `br_${Date.now()}`;
    setBreakoutRooms((prev) => [...prev, { id, name }]);
    try {
      jitsiApi?.executeCommand?.('createBreakoutRoom', { name });
    } catch {}
  };

  const handleDeleteBreakoutRoom = (id: string) => {
    setBreakoutRooms((prev) => prev.filter((r) => r.id !== id));
    try {
      jitsiApi?.executeCommand?.('closeBreakoutRoom', { breakoutRoomId: id });
    } catch {}
  };

  const handleAssignParticipants = async (id: string) => {
    const selected = participants.slice(0, Math.max(1, Math.floor(participants.length / Math.max(1, breakoutRooms.length))));
    for (const p of selected) {
      try {
        jitsiApi?.executeCommand?.('sendParticipantToRoom', { participantId: p.userId, breakoutRoomId: id });
      } catch {}
    }
  };

  const handleCloseBreakoutRoom = (id: string) => {
    try {
      jitsiApi?.executeCommand?.('closeBreakoutRoom', { breakoutRoomId: id });
    } catch {}
  };

  const handleAcknowledge = async (handRaiseId: string) => {
    try {
      await fetch('/api/live/qna', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handRaiseId,
          action: 'acknowledge',
        }),
      });
      fetchQnaQueue();
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const handleResolve = async (handRaiseId: string) => {
    try {
      await fetch('/api/live/qna', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handRaiseId,
          action: 'resolve',
        }),
      });
      fetchQnaQueue();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.filter((o) => o.trim()).length < 2) {
      alert('Please provide a question and at least 2 options');
      return;
    }

    try {
      await fetch('/api/live/student/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomId,
          question: newPoll.question,
          options: newPoll.options.filter((o) => o.trim()),
          type: newPoll.type,
        }),
      });
      setNewPoll({ question: '', options: ['', ''], type: 'single' });
      fetchPolls();
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await fetch('/api/live/student/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          roomId,
          pollId,
        }),
      });
      fetchPolls();
    } catch (error) {
      console.error('Failed to close poll:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'participants' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('participants')}
          >
            Participants
          </Button>
          <Button
            variant={activeTab === 'qna' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('qna')}
          >
            Q&A Queue
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
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Button>
          <Button
            variant={activeTab === 'breakouts' ? 'inverse' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('breakouts')}
          >
            Breakout Rooms
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'participants' && (
          <ParticipantManagement roomId={roomId} jitsiApi={jitsiApi} />
        )}

        {activeTab === 'qna' && (
          <div className="space-y-3">
            {qnaQueue.map((item) => (
              <div key={item._id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.userName}</p>
                    {item.question && (
                      <p className="text-sm text-slate-600 mt-1">{item.question}</p>
                    )}
                  </div>
                  <Badge variant="info">#{item.priority}</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="inverse"
                    size="sm"
                    onClick={() => handleAcknowledge(item._id)}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(item._id)}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
            {qnaQueue.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No questions in queue</p>
            )}
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-semibold mb-3">Create New Poll</p>
              <input
                type="text"
                placeholder="Poll question..."
                value={newPoll.question}
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 mb-2"
              />
              <div className="space-y-2 mb-3">
                {newPoll.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[idx] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })
                  }
                >
                  + Add Option
                </Button>
              </div>
              <div className="flex gap-2 mb-3">
                <Button
                  variant={newPoll.type === 'single' ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={() => setNewPoll({ ...newPoll, type: 'single' })}
                >
                  Single Choice
                </Button>
                <Button
                  variant={newPoll.type === 'multiple' ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={() => setNewPoll({ ...newPoll, type: 'multiple' })}
                >
                  Multiple Choice
                </Button>
              </div>
              <Button variant="inverse" size="sm" onClick={handleCreatePoll} className="w-full">
                Create Poll
              </Button>
            </div>

            {polls.map((poll) => (
              <div key={poll._id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-slate-900">{poll.question}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClosePoll(poll._id)}
                  >
                    Close
                  </Button>
                </div>
                <div className="space-y-2">
                  {poll.options.map((option: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">{option}</span>
                      <Badge variant="info">
                        {poll.votes?.filter((v: any) => v.selectedOptions?.includes(idx)).length || 0} votes
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total: {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant={chatState.locked ? 'inverse' : 'outline'}
                size="sm"
                onClick={async () => {
                  await fetch('/api/live/chat/moderate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, action: chatState.locked ? 'unlockChat' : 'lockChat' }),
                  });
                  const res = await fetch(`/api/live/chat/moderate?roomId=${roomId}`).then((r) => r.json());
                  setChatState({ locked: Boolean(res.data?.locked), mutes: res.data?.mutes || [] });
                }}
              >
                {chatState.locked ? 'Unlock Chat' : 'Lock Chat'}
              </Button>
            </div>
            <div className="text-sm text-slate-600">Muted users: {chatState.mutes.map((m) => m.userId).join(', ') || 'None'}</div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg._id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-900">{msg.userName}</div>
                    <div className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                  {msg.isPinned && <p className="text-[10px] text-amber-600">Pinned</p>}
                  <p className="text-sm text-slate-700 mt-1 break-words">{msg.content}</p>
                  {msg.imageUrl && (
                    <Image
                      src={msg.imageUrl}
                      alt=""
                      width={640}
                      height={360}
                      unoptimized
                      className="mt-2 rounded-lg max-h-40 object-cover"
                    />
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={async () => {
                        await fetch('/api/live/chat/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId, action: 'pinMessage', messageId: msg._id }),
                        });
                        setChatMessages((prev) => prev.map((m) => (String(m._id) === String(msg._id) ? { ...m, isPinned: true } : m)));
                      }}
                    >
                      Pin
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={async () => {
                        await fetch('/api/live/chat/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId, action: 'unpinMessage', messageId: msg._id }),
                        });
                        setChatMessages((prev) => prev.map((m) => (String(m._id) === String(msg._id) ? { ...m, isPinned: false } : m)));
                      }}
                    >
                      Unpin
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={async () => {
                        await fetch('/api/live/chat/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId, action: 'deleteMessage', messageId: msg._id }),
                        });
                        setChatMessages((prev) => prev.filter((m) => String(m._id) !== String(msg._id)));
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={async () => {
                        await fetch('/api/live/chat/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId, action: 'muteUser', targetUserId: msg.userId }),
                        });
                        const res = await fetch(`/api/live/chat/moderate?roomId=${roomId}`).then((r) => r.json());
                        setChatState({ locked: Boolean(res.data?.locked), mutes: res.data?.mutes || [] });
                      }}
                    >
                      Mute
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={async () => {
                        await fetch('/api/live/chat/moderate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ roomId, action: 'unmuteUser', targetUserId: msg.userId }),
                        });
                        const res = await fetch(`/api/live/chat/moderate?roomId=${roomId}`).then((r) => r.json());
                        setChatState({ locked: Boolean(res.data?.locked), mutes: res.data?.mutes || [] });
                      }}
                    >
                      Unmute
                    </Button>
                  </div>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No messages</p>
              )}
            </div>
          </div>
        )}
        {activeTab === 'breakouts' && (
          <div className="space-y-3">
            <Button variant="inverse" size="sm" onClick={handleCreateBreakoutRoom}>
              Create Breakout Room
            </Button>
            {breakoutRooms.map((room) => (
              <div key={room.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-slate-900">{room.name}</p>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteBreakoutRoom(room.id)}>
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="inverse" size="sm" onClick={() => handleAssignParticipants(room.id)}>
                    Assign Participants
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCloseBreakoutRoom(room.id)}>
                    Close
                  </Button>
                </div>
              </div>
            ))}
            {breakoutRooms.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No breakout rooms</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

