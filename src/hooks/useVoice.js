import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { supabase } from '../lib/supabase';

export const useVoice = (profile) => {
  const [inVoice, setInVoice] = useState(false);
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [myMicLevel, setMyMicLevel] = useState(0);
  const [myStream, setMyStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [peer, setPeer] = useState(null);

  const globalPresenceChannel = useRef(null);
  const speakingInterval = useRef(null);

  // Presence subscription
  useEffect(() => {
    const channel = supabase.channel('global_voice_presence');
    globalPresenceChannel.current = channel;

    const handleSync = () => {
      const state = channel.presenceState();
      const list = Object.values(state).flat();
      const uniqueMap = {};
      list.forEach(p => { if (p.user) uniqueMap[p.user] = p; });
      setAllParticipants(Object.values(uniqueMap));
    };

    channel.on('presence', { event: 'sync' }, handleSync).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: profile.displayName, avatar: profile.avatarUrl, channelId: activeVoiceChannelId,
          fullProfile: profile, isMuted, isOnline: true
        });
      }
    });

    return () => { channel.unsubscribe(); };
  }, []);

  // Mic level analysis
  useEffect(() => {
    if (inVoice && myStream && !isMuted) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(myStream);
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
  }, [inVoice, myStream, isMuted]);

  // Re-track on profile/voice changes
  useEffect(() => {
    const trackUser = async () => {
      if (globalPresenceChannel.current) {
        await globalPresenceChannel.current.untrack();
        globalPresenceChannel.current.track({
          user: profile.displayName, avatar: profile.avatarUrl, channelId: activeVoiceChannelId,
          fullProfile: profile, isMuted, isOnline: true
        });
      }
    };
    trackUser();
  }, [JSON.stringify(profile), inVoice, activeVoiceChannelId, isMuted]);

  const joinVoiceChannel = async (id) => {
    if (inVoice && activeVoiceChannelId === id) { stopVoice(); return; }
    if (inVoice) stopVoice();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMyStream(stream);
      const newPeer = new Peer();
      newPeer.on('open', () => { setInVoice(true); setActiveVoiceChannelId(id); });
      newPeer.on('call', (c) => {
        c.answer(stream);
        c.on('stream', s => {
          if (!isDeafened) { const a = new Audio(); a.srcObject = s; a.play(); }
        });
      });
      setPeer(newPeer);
    } catch (err) {
      alert('Mic access denied');
    }
  };

  const stopVoice = () => {
    if (myStream) myStream.getTracks().forEach(t => t.stop());
    if (peer) peer.destroy();
    setInVoice(false);
    setActiveVoiceChannelId(null);
    setPeer(null);
  };

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
    inVoice, activeVoiceChannelId, allParticipants, myMicLevel,
    isMuted, setIsMuted, isDeafened, setIsDeafened,
    joinVoiceChannel, stopVoice, getGlowStyles
  };
};
