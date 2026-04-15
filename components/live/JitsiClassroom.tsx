'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StudentSidebar } from './StudentSidebar';
import { InstructorPanel } from './InstructorPanel';

interface JitsiClassroomProps {
  roomUrl: string;
  roomName: string;
  isModerator?: boolean;
  onLeave?: () => void;
  onEnd?: () => void;
  domain?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiClassroom({
  roomUrl,
  roomName,
  isModerator = false,
  onLeave,
  onEnd,
  domain = 'meet.jit.si',
}: JitsiClassroomProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good');
  const [showSidebar, setShowSidebar] = useState(false);
  const [perfMode, setPerfMode] = useState(false);
  const [joinStalled, setJoinStalled] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    // Load Jitsi Meet external API
    const script = document.createElement('script');
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
        const options = {
          roomName,
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false, // Disabling prejoin usually helps getting stuck
            disableDeepLinking: true, // Prevents mobile app prompts
            enableWelcomePage: false,
            enableClosePage: false,
            disableAudioLevels: true,
            enableLayerSuspension: true,
            channelLastN: 2,
            disableThirdPartyRequests: true,
            analytics: { disabled: true },
            constraints: {
              video: {
                height: {
                  ideal: 480,
                  max: 480,
                  min: 240,
                },
              },
              audio: true,
            },
            p2p: {
              enabled: false,
            },
          },
          interfaceConfigOverwrite: {
            // Note: Many of these are deprecated in newer Jitsi versions but keeping safe ones
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'participants-pane'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
          userInfo: {
            displayName: 'User',
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Event listeners
        apiRef.current.addEventListener('participantJoined', () => {
          setParticipants((prev) => prev + 1);
        });

        apiRef.current.addEventListener('participantLeft', () => {
          setParticipants((prev) => Math.max(0, prev - 1));
        });

        // Track connection quality
        apiRef.current.addEventListener('connectionQualityChanged', (event: any) => {
          if (event.participantId === apiRef.current.getMyUserId()) {
            const quality = event.connectionQuality;
            if (quality <= 2) {
              setConnectionQuality('poor');
            } else if (quality <= 4) {
              setConnectionQuality('medium');
            } else {
              setConnectionQuality('good');
            }
          }
        });

        apiRef.current.addEventListener('videoConferenceJoined', () => {
          setIsJoined(true);
          joinedRef.current = true;
          setJoinStalled(false);
          // Track attendance - user joined
          fetch('/api/live/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId: roomName,
              action: 'join',
              userName: 'User', // TODO: Get from user profile
            }),
          }).catch((err) => console.error('Failed to track join:', err));
        });

        apiRef.current.addEventListener('readyToClose', () => {
          if (onLeave) {
            onLeave();
          }
        });
      }
    };
    document.body.appendChild(script);

    const t = setTimeout(() => {
      if (!joinedRef.current) setJoinStalled(true);
    }, 8000);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      clearTimeout(t);
    };
  }, [roomName, domain, onLeave]);

  const handleLeave = () => {
    // Track attendance - user left
    if (isJoined) {
      fetch('/api/live/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: roomName,
          action: 'leave',
        }),
      }).catch((err) => console.error('Failed to track leave:', err));
    }

    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setIsJoined(false);
    if (onLeave) {
      onLeave();
    }
  };
  const togglePerformanceMode = () => {
    setPerfMode((p) => !p);
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('setVideoQuality', perfMode ? 720 : 240);
      }
    } catch {}
  };
  const handleToggleAudio = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleAudio');
      }
    } catch {}
  };
  const handleToggleVideo = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleVideo');
      }
    } catch {}
  };
  const handleShareScreen = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleShareScreen');
      }
    } catch {}
  };
  const handleToggleChat = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleChat');
      }
    } catch {}
  };
  const handleToggleTileView = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleTileView');
      }
    } catch {}
  };
  const handleHangup = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('hangup');
      }
    } catch {}
  };
  const handleToggleParticipants = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleParticipantsPane');
      }
    } catch {}
  };
  const handleToggleRaiseHand = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleRaiseHand');
      }
    } catch {}
  };
  const handleOpenBreakouts = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleParticipantsPane');
      }
    } catch {}
  };
  const handleEnableLobby = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('toggleLobby', true);
      }
    } catch {}
  };
  const handleMuteAll = () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('muteEveryone', {});
      }
    } catch {}
  };
  const handleStartRecording = async () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('startRecording');
        await fetch('/api/live/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: roomName,
            recordingId: `rec_${Date.now()}`,
            recordingType: 'jibri',
          }),
        });
      }
    } catch {}
  };
  const handleStopRecording = async () => {
    try {
      if (apiRef.current) {
        apiRef.current.executeCommand('stopRecording');
      }
    } catch {}
  };

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Live Classroom (Jitsi Meet)</CardTitle>
                {isModerator && (
                  <Badge className="bg-blue-600 text-white">Instructor</Badge>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {participants} {participants === 1 ? 'participant' : 'participants'}
                  </span>
                  <Badge
                    variant={
                      connectionQuality === 'good'
                        ? 'success'
                        : connectionQuality === 'medium'
                          ? 'warning'
                          : 'error'
                    }
                    className="text-xs"
                  >
                    {connectionQuality === 'good' ? '●' : connectionQuality === 'medium' ? '●' : '●'} {connectionQuality}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showSidebar ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? 'Hide' : 'Show'} Tools
                </Button>
                <Button
                  variant={perfMode ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={togglePerformanceMode}
                >
                  {perfMode ? 'Quality: High' : 'Quality: Low'}
                </Button>

                {isModerator ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to end this class for everyone? Recording will be saved.')) {
                        // Close Jitsi
                        if (apiRef.current) {
                          apiRef.current.executeCommand('hangup');
                          apiRef.current.dispose();
                        }
                        setIsJoined(false);
                        // Trigger end callback
                        if (onEnd) onEnd();
                      }
                    }}
                  >
                    End Class
                  </Button>
                ) : null}
                {isModerator ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(roomUrl || `https://${domain}/${roomName}`, '_blank')}
                  >
                    Open Moderator View
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleLeave}>
                    Leave Room
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
              <div
                ref={jitsiContainerRef}
                className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
                style={{ minHeight: '500px' }}
              />
              {isModerator && isJoined && (
                <div className="absolute bottom-4 left-4 z-[1000]">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-md">
                    Instructor
                  </span>
                </div>
              )}
              {!isJoined && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Joining classroom...</p>
                    {joinStalled && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => apiRef.current && apiRef.current.executeCommand('hangup')}>Retry</Button>
                        <Button size="sm" onClick={() => window.open(roomUrl || `https://${domain}/${roomName}`, '_blank')}>Open in new tab</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showSidebar && (
        <div className="w-80">
          {isModerator ? (
             jitsiApiInstance && <InstructorPanel roomId={roomName} jitsiApi={jitsiApiInstance} />
          ) : (
            <StudentSidebar roomId={roomName} isInstructor={false} />
          )}
        </div>
      )}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1001]">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 shadow-2xl border border-slate-800">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleAudio}>🎤</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleVideo}>📷</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleShareScreen}>🖥️</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleChat}>💬</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleTileView}>🧩</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleParticipants}>👥</Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleToggleRaiseHand}>✋</Button>
          {isModerator && (
            <>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleMuteAll}>🔇 All</Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleStartRecording}>⏺ Start Rec</Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleStopRecording}>⏹ Stop Rec</Button>
            </>
          )}
          {isModerator && (
            <>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleOpenBreakouts}>🧭</Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleEnableLobby}>🔒</Button>
            </>
          )}
          {isModerator ? (
            <Button variant="destructive" size="sm" onClick={handleHangup}>End</Button>
          ) : (
            <Button variant="outline" size="sm" className="text-white border-red-500 hover:bg-red-600 hover:text-white" onClick={handleHangup}>Leave</Button>
          )}
        </div>
      </div>
    </div>
  );
}


