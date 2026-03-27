import React, { useState, useEffect } from 'react';
import { Search, Volume2, Hash, MicOff, Mic, Headphones, Settings, Waves, PhoneOff, Zap, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { MOD_USER_NUMBER } from '../constants';

const Sidebar = ({
  profile,
  inVoice,
  activeVoiceChannelId,
  allParticipants,
  isMuted, setIsMuted,
  isDeafened, setIsDeafened,
  joinVoiceChannel,
  stopVoice,
  getGlowStyles,
  onOpenSettings,
  onSelectUser,
  channelsApi,
  activeTextChannelId,
  setActiveTextChannelId
}) => {
  const isMod = profile.userNumber === MOD_USER_NUMBER;
  
  const serverTextChannels = channelsApi.channels.filter(c => c.type === 'text');
  const serverVoiceChannels = channelsApi.channels.filter(c => c.type === 'voice');

  const [creatingType, setCreatingType] = useState(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Local state for smooth reordering without stuttering from server lag
  const [localTextChannels, setLocalTextChannels] = useState(serverTextChannels);
  const [localVoiceChannels, setLocalVoiceChannels] = useState(serverVoiceChannels);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with server ONLY if we aren't dragging, to prevent rollback stutter
  useEffect(() => {
    if (!isDragging) {
      setLocalTextChannels(serverTextChannels);
    }
  }, [serverTextChannels, isDragging]);

  useEffect(() => {
    if (!isDragging) {
      setLocalVoiceChannels(serverVoiceChannels);
    }
  }, [serverVoiceChannels, isDragging]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      setCreatingType(null);
      return;
    }
    await channelsApi.createChannel(newChannelName, creatingType);
    setNewChannelName('');
    setCreatingType(null);
  };

  const handleSaveEdit = async () => {
    if (editingName.trim()) {
      await channelsApi.updateChannelName(editingId, editingName);
    }
    setEditingId(null);
    setEditingName('');
  };

  const syncOrder = async (channelsArray) => {
    const ids = channelsArray.map(c => c.id);
    await channelsApi.updateChannelOrder(ids);
  };

  const renderChannelControls = (ch) => {
    if (!isMod) return null;
    return (
      <div className="channel-controls" style={{ display: 'flex', gap: '6px', opacity: 0 }}>
        <div onClick={(e) => { e.stopPropagation(); setEditingId(ch.id); setEditingName(ch.name); }}>
          <Edit2 size={14} color="var(--text-secondary)" className="hover-white" />
        </div>
        <div onClick={(e) => { e.stopPropagation(); channelsApi.deleteChannel(ch.id); }}>
          <Trash2 size={14} color="#ff5252" className="hover-white" />
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '260px', flexShrink: 0, background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,0,0,0.2)' }}>
      {/* Search */}
      <div style={{ padding: '20px 20px 10px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--primary-color)', opacity: 0.6 }} size={16} />
          <input className="input-search" placeholder="Search..." style={{ paddingLeft: '38px', height: '40px' }} />
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* TEXT CHANNELS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 4px' }}>
            <h3 style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: 'bold' }}>CANAIS DE TEXTO</h3>
            {isMod && (
              <Plus size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} className="hover-white" onClick={() => setCreatingType('text')} />
            )}
          </div>
          
          {creatingType === 'text' && (
            <div style={{ padding: '4px 10px' }}>
              <input 
                autoFocus
                className="input-base"
                style={{ width: '100%', height: '32px', fontSize: '14px', marginBottom: '8px' }}
                placeholder="Nome do canal..."
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? handleCreateChannel() : e.key === 'Escape' && setCreatingType(null)}
                onBlur={handleCreateChannel}
              />
            </div>
          )}

          <Reorder.Group axis="y" values={localTextChannels} onReorder={setLocalTextChannels} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {localTextChannels.map(ch => (
              <Reorder.Item 
                key={ch.id} 
                value={ch}
                drag={isMod ? 'y' : false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => { setIsDragging(false); syncOrder(localTextChannels); }}
                style={{ position: 'relative' }}
              >
                <div 
                  className="channel-item hover-bg" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: activeTextChannelId === ch.id ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTextChannelId === ch.id ? '#fff' : 'var(--text-secondary)' }} 
                  onClick={() => setActiveTextChannelId(ch.id)}
                >
                  {editingId === ch.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <Hash size={18} />
                      <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} onBlur={handleSaveEdit} className="input-base" style={{ height: '24px', flexGrow: 1, padding: '0 8px' }} onClick={e => e.stopPropagation()} />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <Hash size={18} /> <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{ch.name}</span>
                      </div>
                      {renderChannelControls(ch)}
                    </>
                  )}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* VOICE CHANNELS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 4px' }}>
            <h3 style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: 'bold' }}>CANAIS DE VOZ</h3>
            {isMod && (
              <Plus size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} className="hover-white" onClick={() => setCreatingType('voice')} />
            )}
          </div>

          {creatingType === 'voice' && (
            <div style={{ padding: '4px 10px' }}>
              <input 
                autoFocus
                className="input-base"
                style={{ width: '100%', height: '32px', fontSize: '14px', marginBottom: '8px' }}
                placeholder="Nome do canal..."
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' ? handleCreateChannel() : e.key === 'Escape' && setCreatingType(null)}
                onBlur={handleCreateChannel}
              />
            </div>
          )}

          <Reorder.Group axis="y" values={localVoiceChannels} onReorder={setLocalVoiceChannels} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {localVoiceChannels.map(ch => (
              <Reorder.Item 
                key={ch.id} 
                value={ch}
                drag={isMod ? 'y' : false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => { setIsDragging(false); syncOrder(localVoiceChannels); }}
                style={{ position: 'relative', marginBottom: '2px' }}
              >
                <div onClick={() => joinVoiceChannel(ch.id)} className="channel-item hover-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', background: activeVoiceChannelId === ch.id ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeVoiceChannelId === ch.id ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                  {editingId === ch.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <Volume2 size={18} />
                      <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} onBlur={handleSaveEdit} className="input-base" style={{ height: '24px', flexGrow: 1, padding: '0 8px' }} onClick={e => e.stopPropagation()} />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <Volume2 size={18} /> <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{ch.name}</span>
                      </div>
                      {renderChannelControls(ch)}
                    </>
                  )}
                </div>
                
                {/* Voice Participants */}
                {allParticipants.filter(p => p.channelId === ch.id).map((p, ix) => {
                  const styles = getGlowStyles(p);
                  return (
                    <div key={ix} onClick={(e) => { e.stopPropagation(); onSelectUser(p); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px 4px 34px', cursor: 'pointer', marginTop: '4px', marginBottom: '4px' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={p.avatar} style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', ...styles }} />
                        {p.isMuted && <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#ff5252', borderRadius: '50%', padding: '2px' }}><MicOff size={8} color="white" /></div>}
                      </div>
                      <span style={{ fontSize: '13px', color: styles.boxShadow !== 'none' ? '#fff' : 'var(--text-secondary)' }}>{p.user}</span>
                    </div>
                  );
                })}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Voice status + user panel */}
      <div style={{ background: '#0e1014', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <AnimatePresence>
          {inVoice && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(to right, rgba(0, 96, 223, 0.1), transparent)', padding: '14px 18px', borderBottom: '1px solid rgba(0, 96, 223, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Waves size={18} color="var(--primary-color)" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, background: 'var(--primary-color)', borderRadius: '50%', zIndex: -1 }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'var(--primary-color)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>VOICE CONNECTED</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {serverVoiceChannels.find(v => v.id === activeVoiceChannelId)?.name}
                    </p>
                  </div>
                </div>
                <div onClick={stopVoice} className="hover-bg-red" style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,82,82,0.05)', flexShrink: 0 }}>
                  <PhoneOff size={16} color="#ff5252" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px' }}>
          <div style={{ position: 'relative' }} onClick={() => onSelectUser({ user: profile.displayName, avatar: profile.avatarUrl, fullProfile: profile })}>
            <img src={profile.avatarUrl} style={{ width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: '12px', height: '12px', background: '#36d391', borderRadius: '50%', border: '2px solid #0e1014' }} />
          </div>
          <div style={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelectUser({ user: profile.displayName, avatar: profile.avatarUrl, fullProfile: profile })}>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.displayName}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>#{profile.tag}</p>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <div onClick={() => setIsMuted(!isMuted)} className="hover-icon-bg" style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: isMuted ? 'rgba(255,82,82,0.1)' : 'transparent' }}>
              {isMuted ? <MicOff size={19} color="#ff5252" /> : <Mic size={19} color="var(--text-secondary)" />}
            </div>
            <div onClick={() => setIsDeafened(!isDeafened)} className="hover-icon-bg" style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', background: isDeafened ? 'rgba(255,82,82,0.1)' : 'transparent' }}>
              {isDeafened ? <Volume2 size={19} color="#ff5252" /> : <Headphones size={19} color="var(--text-secondary)" />}
            </div>
            <div onClick={onOpenSettings} className="hover-icon-bg" style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
              <Settings size={19} color="var(--text-secondary)" />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .channel-item:hover .channel-controls { opacity: 1 !important; }
        .hover-white:hover { color: #fff !important; }
      `}</style>
    </div>
  );
};

export default Sidebar;
