import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_AUDIO_SETTINGS = {
  micVolume: 100,
  speakerVolume: 100,
  inputSensitivity: 15,
  autoSensitivity: true,
  noiseSuppression: 'standard',
  echoCancellation: true,
  inputDeviceId: '',
  outputDeviceId: '',
};

export const useAudioSettings = () => {
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('aelo_audio_settings');
    if (saved) {
      return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_AUDIO_SETTINGS;
  });

  const [micTestActive, setMicTestActive] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });

  const micTestStream = useRef(null);
  const micTestInterval = useRef(null);
  const micTestContext = useRef(null);
  const loopbackAudio = useRef(null);
  const micGainNode = useRef(null);
  const loopbackGainNode = useRef(null);
  const loopbackDest = useRef(null);

  useEffect(() => {
    localStorage.setItem('aelo_audio_settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  const updateSetting = useCallback((key, value) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Live-update gain nodes when volumes change during active mic test
  useEffect(() => {
    if (micGainNode.current) {
      micGainNode.current.gain.value = audioSettings.micVolume / 100;
    }
  }, [audioSettings.micVolume]);

  useEffect(() => {
    if (loopbackGainNode.current) {
      loopbackGainNode.current.gain.value = (audioSettings.speakerVolume / 100) * 0.8;
    }
  }, [audioSettings.speakerVolume]);

  // Live-update output device when changed during active mic test
  useEffect(() => {
    if (loopbackAudio.current && audioSettings.outputDeviceId && loopbackAudio.current.setSinkId) {
      loopbackAudio.current.setSinkId(audioSettings.outputDeviceId).catch(() => {});
    }
  }, [audioSettings.outputDeviceId]);

  // Restart mic test when input device changes during active test
  useEffect(() => {
    if (micTestActive) {
      stopMicTestInternal();
      // small delay to let cleanup finish
      const t = setTimeout(() => startMicTestInternal(), 150);
      return () => clearTimeout(t);
    }
  }, [audioSettings.inputDeviceId]);

  // Enumerate audio devices
  const refreshDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop()));
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(d => d.kind === 'audioinput');
      const outputs = devices.filter(d => d.kind === 'audiooutput');
      setAudioDevices({ inputs, outputs });
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
  }, [refreshDevices]);

  const stopMicTestInternal = () => {
    if (micTestStream.current) {
      micTestStream.current.getTracks().forEach(t => t.stop());
      micTestStream.current = null;
    }
    if (micTestInterval.current) {
      clearInterval(micTestInterval.current);
      micTestInterval.current = null;
    }
    if (micTestContext.current) {
      micTestContext.current.close().catch(() => {});
      micTestContext.current = null;
    }
    if (loopbackAudio.current) {
      loopbackAudio.current.pause();
      loopbackAudio.current.srcObject = null;
      loopbackAudio.current = null;
    }
    micGainNode.current = null;
    loopbackGainNode.current = null;
    loopbackDest.current = null;
  };

  const startMicTestInternal = async () => {
    try {
      const currentSettings = JSON.parse(localStorage.getItem('aelo_audio_settings') || '{}');
      const settings = { ...DEFAULT_AUDIO_SETTINGS, ...currentSettings };

      const constraints = {
        audio: {
          echoCancellation: settings.echoCancellation,
          noiseSuppression: settings.noiseSuppression !== 'off',
          autoGainControl: false,
          ...(settings.inputDeviceId ? { deviceId: { exact: settings.inputDeviceId } } : {}),
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micTestStream.current = stream;

      const audioContext = new AudioContext();
      micTestContext.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      // Mic gain
      const gainNode = audioContext.createGain();
      gainNode.gain.value = settings.micVolume / 100;
      micGainNode.current = gainNode;
      source.connect(gainNode);
      gainNode.connect(analyser);

      // Loopback gain
      const lbGain = audioContext.createGain();
      lbGain.gain.value = (settings.speakerVolume / 100) * 0.8;
      loopbackGainNode.current = lbGain;
      gainNode.connect(lbGain);

      // Route through output device
      if (settings.outputDeviceId) {
        const dest = audioContext.createMediaStreamDestination();
        loopbackDest.current = dest;
        lbGain.connect(dest);
        const audio = new Audio();
        audio.srcObject = dest.stream;
        if (audio.setSinkId) {
          await audio.setSinkId(settings.outputDeviceId).catch(() => {});
        }
        audio.play();
        loopbackAudio.current = audio;
      } else {
        lbGain.connect(audioContext.destination);
      }

      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      setMicTestActive(true);
      micTestInterval.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const currentMicVol = micGainNode.current ? micGainNode.current.gain.value : 1;
        setMicTestLevel(Math.min(100, (avg / 128) * 100 * currentMicVol));
      }, 50);
    } catch (err) {
      console.error('Mic test failed:', err);
    }
  };

  const startMicTest = useCallback(async () => {
    await startMicTestInternal();
  }, []);

  const stopMicTest = useCallback(() => {
    stopMicTestInternal();
    setMicTestActive(false);
    setMicTestLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicTestInternal();
    };
  }, []);

  return {
    audioSettings, updateSetting,
    micTestActive, micTestLevel,
    startMicTest, stopMicTest,
    audioDevices, refreshDevices
  };
};
