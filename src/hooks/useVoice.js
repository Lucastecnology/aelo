import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { supabase } from '../lib/supabase';

export const useVoice = (profile) => {
  const [inVoice, setInVoice] = useState(false);
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [myMicLevel, setMyMicLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [ping, setPing] = useState(0);

  const peerRef = useRef(null);
  const myStreamRef = useRef(null);
  const globalPresenceChannel = useRef(null);
  const speakingInterval = useRef(null);
  const pingInterval = useRef(null);
  const activeCallsRef = useRef({}); // { peerId: { call, audio, dataConn } }
  const myPeerIdRef = useRef(null);
  const activeChannelRef = useRef(null);
  const isMutedRef = useRef(false);
  const isDeafenedRef = useRef(false);

  // Keep refs up to date for use inside callbacks
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isDeafenedRef.current = isDeafened; }, [isDeafened]);
  useEffect(() => { activeChannelRef.current = activeVoiceChannelId; }, [activeVoiceChannelId]);

  // Toggle mute on the actual stream tracks
  useEffect(() => {
    if (myStreamRef.current) {
      myStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !isMuted; });
    }
  }, [isMuted]);

  // Toggle deafen on all remote audio elements
  useEffect(() => {
    Object.values(activeCallsRef.current).forEach(({ audio }) => {
      if (audio) audio.muted = isDeafened;
    });
  }, [isDeafened]);

  // ─── Presence Subscription ───
  useEffect(() => {
    const channel = supabase.channel('global_voice_presence');
    globalPresenceChannel.current = channel;

    const handleSync = () => {
      const state = channel.presenceState();
      const list = Object.values(state).flat();
      const uniqueMap = {};
      list.forEach(p => { if (p.user) uniqueMap[p.user] = p; });
      const participants = Object.values(uniqueMap);
      setAllParticipants(participants);

      // If we're in voice, check for new peers in our channel and call them
      if (peerRef.current && activeChannelRef.current) {
        const peersInMyChannel = participants.filter(
          p => p.channelId === activeChannelRef.current && p.peerId && p.peerId !== myPeerIdRef.current
        );
        
        peersInMyChannel.forEach(p => {
          if (!activeCallsRef.current[p.peerId] && myStreamRef.current) {
            callPeer(p.peerId);
          }
        });
      }
    };

    channel.on('presence', { event: 'sync' }, handleSync).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: profile.displayName, avatar: profile.avatarUrl, channelId: null,
          fullProfile: profile, isMuted: false, isOnline: true, peerId: null
        });
      }
    });

    return () => { channel.unsubscribe(); };
  }, []);

  // Re-track on profile/voice changes
  useEffect(() => {
    const trackUser = async () => {
      if (globalPresenceChannel.current) {
        await globalPresenceChannel.current.untrack();
        globalPresenceChannel.current.track({
          user: profile.displayName, avatar: profile.avatarUrl, channelId: activeVoiceChannelId,
          fullProfile: profile, isMuted, isOnline: true, peerId: myPeerIdRef.current
        });
      }
    };
    trackUser();
  }, [JSON.stringify(profile), inVoice, activeVoiceChannelId, isMuted]);

  // ─── Mic Level Analyser ───
  useEffect(() => {
    if (inVoice && myStreamRef.current && !isMuted) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(myStreamRef.current);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      speakingInterval.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMyMicLevel(average);
      }, 50);
      return () => { clearInterval(speakingInterval.current); audioContext.close(); };
    } else {
      setMyMicLevel(0);
    }
  }, [inVoice, isMuted]);

  // ─── Ping Measurement via DataChannel ───
  const startPingMeasurement = useCallback(() => {
    if (pingInterval.current) clearInterval(pingInterval.current);
    pingInterval.current = setInterval(() => {
      const conns = Object.values(activeCallsRef.current);
      if (conns.length === 0) { setPing(0); return; }
      
      // Use data channels for ping measurement
      let totalPing = 0;
      let count = 0;
      conns.forEach(({ dataConn }) => {
        if (dataConn && dataConn.open) {
          const start = Date.now();
          dataConn.send({ type: 'ping', ts: start });
          // The pong handler will update ping
        }
      });

      // Fallback: estimate from WebRTC stats
      conns.forEach(({ call }) => {
        if (call?.peerConnection) {
          call.peerConnection.getStats().then(stats => {
            stats.forEach(report => {
              if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.currentRoundTripTime) {
                totalPing += report.currentRoundTripTime * 1000;
                count++;
              }
            });
            if (count > 0) setPing(Math.round(totalPing / count));
          }).catch(() => {});
        }
      });
    }, 2000);
  }, []);

  // ─── Handle Incoming Remote Stream ───
  const handleRemoteStream = useCallback((remoteStream, peerId) => {
    // Check if we already have audio for this peer
    if (activeCallsRef.current[peerId]?.audio) {
      activeCallsRef.current[peerId].audio.srcObject = remoteStream;
      return;
    }

    const audio = new Audio();
    audio.srcObject = remoteStream;
    audio.muted = isDeafenedRef.current;
    audio.play().catch(() => {});

    if (activeCallsRef.current[peerId]) {
      activeCallsRef.current[peerId].audio = audio;
    }
  }, []);

  // ─── Call a Remote Peer ───
  const callPeer = useCallback((remotePeerId) => {
    if (!peerRef.current || !myStreamRef.current) return;
    if (activeCallsRef.current[remotePeerId]) return; // Already connected

    console.log(`[Aelo Voice] Calling peer: ${remotePeerId}`);

    // Media call
    const call = peerRef.current.call(remotePeerId, myStreamRef.current);
    if (!call) return;

    activeCallsRef.current[remotePeerId] = { call, audio: null, dataConn: null };

    call.on('stream', (remoteStream) => {
      handleRemoteStream(remoteStream, remotePeerId);
    });

    call.on('close', () => {
      cleanupPeerConnection(remotePeerId);
    });

    call.on('error', () => {
      cleanupPeerConnection(remotePeerId);
    });

    // Data channel for ping
    const dataConn = peerRef.current.connect(remotePeerId, { reliable: false });
    if (dataConn) {
      dataConn.on('open', () => {
        if (activeCallsRef.current[remotePeerId]) {
          activeCallsRef.current[remotePeerId].dataConn = dataConn;
        }
      });
      dataConn.on('data', (data) => {
        if (data?.type === 'ping') {
          dataConn.send({ type: 'pong', ts: data.ts });
        }
        if (data?.type === 'pong') {
          const rtt = Date.now() - data.ts;
          setPing(rtt);
        }
      });
    }
  }, [handleRemoteStream]);

  // ─── Cleanup Single Peer ───
  const cleanupPeerConnection = useCallback((peerId) => {
    const conn = activeCallsRef.current[peerId];
    if (conn) {
      if (conn.audio) { conn.audio.pause(); conn.audio.srcObject = null; }
      if (conn.call) conn.call.close();
      if (conn.dataConn) conn.dataConn.close();
      delete activeCallsRef.current[peerId];
    }
  }, []);

  // ─── Join Voice Channel ───
  const joinVoiceChannel = async (id) => {
    if (inVoice && activeVoiceChannelId === id) { stopVoice(); return; }
    if (inVoice) stopVoice();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      myStreamRef.current = stream;

      const newPeer = new Peer(undefined, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ]
        }
      });

      newPeer.on('open', async (myId) => {
        console.log(`[Aelo Voice] My Peer ID: ${myId}`);
        myPeerIdRef.current = myId;
        peerRef.current = newPeer;
        
        setInVoice(true);
        setActiveVoiceChannelId(id);

        // Track presence with our peer ID so others can find us
        if (globalPresenceChannel.current) {
          await globalPresenceChannel.current.untrack();
          await globalPresenceChannel.current.track({
            user: profile.displayName, avatar: profile.avatarUrl, channelId: id,
            fullProfile: profile, isMuted, isOnline: true, peerId: myId
          });
        }

        // Call all peers already in this channel
        const state = globalPresenceChannel.current?.presenceState();
        if (state) {
          const existingPeers = Object.values(state).flat().filter(
            p => p.channelId === id && p.peerId && p.peerId !== myId
          );
          existingPeers.forEach(p => {
            setTimeout(() => callPeer(p.peerId), 500); // Small delay for stability
          });
        }

        startPingMeasurement();
      });

      // Handle incoming calls from other peers
      newPeer.on('call', (incomingCall) => {
        console.log(`[Aelo Voice] Incoming call from: ${incomingCall.peer}`);
        incomingCall.answer(myStreamRef.current);

        if (!activeCallsRef.current[incomingCall.peer]) {
          activeCallsRef.current[incomingCall.peer] = { call: incomingCall, audio: null, dataConn: null };
        } else {
          activeCallsRef.current[incomingCall.peer].call = incomingCall;
        }

        incomingCall.on('stream', (remoteStream) => {
          handleRemoteStream(remoteStream, incomingCall.peer);
        });

        incomingCall.on('close', () => {
          cleanupPeerConnection(incomingCall.peer);
        });
      });

      // Handle incoming data connections (for ping)
      newPeer.on('connection', (dataConn) => {
        dataConn.on('data', (data) => {
          if (data?.type === 'ping') {
            dataConn.send({ type: 'pong', ts: data.ts });
          }
          if (data?.type === 'pong') {
            const rtt = Date.now() - data.ts;
            setPing(rtt);
          }
        });

        dataConn.on('open', () => {
          if (activeCallsRef.current[dataConn.peer]) {
            activeCallsRef.current[dataConn.peer].dataConn = dataConn;
          }
        });
      });

      newPeer.on('error', (err) => {
        console.error('[Aelo Voice] Peer error:', err);
      });

    } catch (err) {
      console.error('[Aelo Voice] Mic access error:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  // ─── Stop Voice ───
  const stopVoice = async () => {
    // Close all active connections
    Object.keys(activeCallsRef.current).forEach(peerId => {
      cleanupPeerConnection(peerId);
    });
    activeCallsRef.current = {};

    // Stop mic stream
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach(t => t.stop());
      myStreamRef.current = null;
    }

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Clear ping measurement
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }

    myPeerIdRef.current = null;
    setPing(0);
    setInVoice(false);
    setActiveVoiceChannelId(null);
    setMyMicLevel(0);

    // Update presence
    if (globalPresenceChannel.current) {
      await globalPresenceChannel.current.untrack();
      await globalPresenceChannel.current.track({
        user: profile.displayName, avatar: profile.avatarUrl, channelId: null,
        fullProfile: profile, isMuted: false, isOnline: true, peerId: null
      });
    }
  };

  // ─── Glow Styles ───
  const getGlowStyles = (p) => {
    if (p.isMuted) return { border: '1px solid rgba(255,100,100,0.1)', boxShadow: 'none' };
    const isMe = p.user === profile.displayName;
    const level = isMe ? Math.max(0, (myMicLevel - 10)) : 0;
    return {
      border: level > 1 ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.05)',
      boxShadow: level > 1 ? `0 0 ${level / 2}px 0 var(--primary-color)` : 'none',
      transition: '0.1s linear'
    };
  };

  return {
    inVoice, activeVoiceChannelId, allParticipants, myMicLevel, ping,
    isMuted, setIsMuted, isDeafened, setIsDeafened,
    joinVoiceChannel, stopVoice, getGlowStyles
  };
};
