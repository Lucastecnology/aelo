import React, { useState, useEffect } from 'react';
import { Zap, Users, DownloadCloud } from 'lucide-react';

// Hooks
import { useProfile } from './hooks/useProfile';
import { useVoice } from './hooks/useVoice';
import { useChat } from './hooks/useChat';
import { useAudioSettings } from './hooks/useAudioSettings';
import { useChannels } from './hooks/useChannels';

// Components
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MemberBar from './components/MemberBar';
import SettingsModal from './components/SettingsModal';
import UserPopoutModal from './components/UserPopoutModal';
import CloseModal from './components/CloseModal';

const App = () => {
  // UI States
  const [activeTextChannelId, setActiveTextChannelId] = React.useState(null);
  const [isMemberBarOpen, setIsMemberBarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedUserForPopout, setSelectedUserForPopout] = useState(null);

  // Custom Hooks
  const { profile, setProfile } = useProfile();
  const channelsApi = useChannels();
  const voice = useVoice(profile);
  const chat = useChat(profile, activeTextChannelId);
  const { audioSettings, updateSetting: updateAudioSetting, micTestActive, micTestLevel, startMicTest, stopMicTest, audioDevices, refreshDevices } = useAudioSettings();

  // Set initial text channel
  React.useEffect(() => {
    if (!activeTextChannelId && channelsApi.channels.length > 0) {
      const defaultText = channelsApi.channels.find(c => c.type === 'text');
      if (defaultText) setActiveTextChannelId(defaultText.id);
    }
  }, [channelsApi.channels, activeTextChannelId]);

  const activeChannelName = channelsApi.channels.find(c => c.id === activeTextChannelId)?.name || 'geral';

  // Updater logic
  const [updateStatus, setUpdateStatus] = useState(null); // 'available', 'downloaded'

  useEffect(() => {
    if (window.electronAPI?.onUpdateAvailable) {
      window.electronAPI.onUpdateAvailable(() => setUpdateStatus('available'));
    }
    if (window.electronAPI?.onUpdateDownloaded) {
      window.electronAPI.onUpdateDownloaded(() => setUpdateStatus('downloaded'));
    }
  }, []);

  const handleUpdateClick = () => {
    if (updateStatus === 'downloaded' && window.electronAPI?.restartApp) {
      window.electronAPI.restartApp();
    }
  };

  return (
    <div className="app-container" style={{ background: 'var(--bg-deep)', height: '100vh', width: '100vw', paddingTop: '36px', overflow: 'hidden', position: 'fixed', inset: 0 }}>

      {/* Title Bar */}
      <TitleBar onClose={() => setShowCloseModal(true)} />

      {/* Update Banner */}
      {updateStatus && (
        <div 
          onClick={handleUpdateClick}
          style={{ 
            background: updateStatus === 'downloaded' ? '#36d391' : '#0060df', 
            color: 'white', padding: '6px 20px', fontSize: '12px', fontWeight: 'bold', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
            cursor: updateStatus === 'downloaded' ? 'pointer' : 'default',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 50
          }}
        >
          <DownloadCloud size={16} />
          {updateStatus === 'downloaded' 
            ? 'Atualização Pronta! Clique aqui para reiniciar e instalar.' 
            : 'Baixando uma nova atualização em segundo plano...'}
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display: 'flex', height: '100%', width: '100%' }}>

        {/* Server icon rail */}
        <div style={{ width: '72px', flexShrink: 0, background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 96, 223, 0.4)' }}>
            <Zap size={26} />
          </div>
          <div style={{ width: '30px', height: '2px', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Users size={22} color="var(--text-secondary)" />
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          profile={profile}
          inVoice={voice.inVoice}
          activeVoiceChannelId={voice.activeVoiceChannelId}
          allParticipants={voice.allParticipants}
          isMuted={voice.isMuted}
          setIsMuted={voice.setIsMuted}
          isDeafened={voice.isDeafened}
          setIsDeafened={voice.setIsDeafened}
          joinVoiceChannel={voice.joinVoiceChannel}
          stopVoice={voice.stopVoice}
          getGlowStyles={voice.getGlowStyles}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectUser={setSelectedUserForPopout}
          channelsApi={channelsApi}
          activeTextChannelId={activeTextChannelId}
          setActiveTextChannelId={setActiveTextChannelId}
        />

        {/* Chat Area */}
        <ChatArea
          activeChannel={activeChannelName}
          messages={chat.messages}
          inputText={chat.inputText}
          setInputText={chat.setInputText}
          handleSendMessage={chat.handleSendMessage}
          isMemberBarOpen={isMemberBarOpen}
          setIsMemberBarOpen={setIsMemberBarOpen}
          profile={profile}
          onSelectUser={setSelectedUserForPopout}
        />

        {/* Member Bar */}
        <MemberBar
          isOpen={isMemberBarOpen}
          allParticipants={voice.allParticipants}
          profile={profile}
          onSelectUser={setSelectedUserForPopout}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        setProfile={setProfile}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        audioSettings={audioSettings}
        updateAudioSetting={updateAudioSetting}
        micTestActive={micTestActive}
        micTestLevel={micTestLevel}
        startMicTest={startMicTest}
        stopMicTest={stopMicTest}
        audioDevices={audioDevices}
        refreshDevices={refreshDevices}
      />

      <UserPopoutModal
        selectedUser={selectedUserForPopout}
        onClose={() => setSelectedUserForPopout(null)}
      />

      <CloseModal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} />
    </div>
  );
};

export default App;
