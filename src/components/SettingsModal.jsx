import React, { useRef, useState } from 'react';
import { X, Upload, Trash2, ImageIcon, Mic, Volume2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileCard from './UserProfileCard';
import { AVATAR_FRAMES, ACCENT_COLORS, BADGES, MOD_USER_NUMBER } from '../constants';
import AeloBearIcon from './AeloBearIcon';

const SettingsModal = ({ isOpen, onClose, profile, setProfile, settingsTab, setSettingsTab, audioSettings, updateAudioSetting, micTestActive, micTestLevel, startMicTest, stopMicTest, audioDevices, refreshDevices }) => {
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [previewTab, setPreviewTab] = useState('preview');

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfile({ ...profile, [field]: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const updateField = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg-deep)',
            zIndex: 10000, display: 'flex'
          }}
        >
          {/* Hidden file inputs */}
          <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*,.gif" onChange={handleFileUpload('avatarUrl')} />
          <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*,.gif" onChange={handleFileUpload('bannerUrl')} />

          {/* Settings Sidebar */}
          <div style={{
            width: '260px', background: 'var(--bg-sidebar)',
            padding: '24px 12px', borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '12px 16px', marginBottom: '8px' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.5px' }}>
                CONFIGURAÇÕES
              </h3>
            </div>

            {['profile', 'frames', 'appearance', 'audio'].map(tab => (
              <div
                key={tab}
                onClick={() => setSettingsTab(tab)}
                style={{
                  padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: settingsTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: settingsTab === tab ? '#fff' : 'var(--text-secondary)',
                  fontWeight: settingsTab === tab ? '600' : '400',
                  fontSize: '14px', marginBottom: '2px',
                  transition: 'all 0.15s'
                }}
              >
                {tab === 'profile' && 'Perfil'}
                {tab === 'frames' && 'Decoração de Avatar'}
                {tab === 'appearance' && 'Aparência'}
                {tab === 'audio' && '🎙 Voz e Áudio'}
              </div>
            ))}

            <div style={{ flexGrow: 1 }} />

            <div
              onClick={onClose}
              style={{
                padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                color: '#ff5252', fontSize: '14px',
                transition: 'background 0.15s'
              }}
              className="hover-bg"
            >
              Voltar
            </div>
          </div>

          {/* Settings Content */}
          <div style={{ flexGrow: 1, display: 'flex', background: '#1a1d26', overflow: 'hidden' }}>
            {/* Form Area */}
            <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: '660px' }}>
              {/* Close button */}
              <div onClick={onClose} style={{
                position: 'absolute', right: '24px', top: '24px',
                cursor: 'pointer', padding: '8px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                transition: 'background 0.15s'
              }} className="hover-bg">
                <X size={24} />
              </div>

              {settingsTab === 'profile' && (
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Perfil</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Personalize como os outros te veem na Aelo
                  </p>

                  {/* Display Name */}
                  <div className="settings-section">
                    <div className="settings-input-group">
                      <label className="settings-label">Nome exibido</label>
                      <input
                        className="settings-input"
                        value={profile.displayName}
                        onChange={e => updateField('displayName', e.target.value)}
                        maxLength={32}
                      />
                    </div>
                  </div>

                  {/* Pronouns */}
                  <div className="settings-section">
                    <div className="settings-input-group">
                      <label className="settings-label">Pronomes</label>
                      <input
                        className="settings-input"
                        value={profile.pronouns || ''}
                        onChange={e => updateField('pronouns', e.target.value)}
                        placeholder="Adicione seus pronomes"
                        maxLength={40}
                      />
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="settings-section">
                    <div className="settings-input-group">
                      <label className="settings-label">Sobre mim</label>
                      <textarea
                        className="settings-textarea"
                        value={profile.aboutMe || ''}
                        onChange={e => updateField('aboutMe', e.target.value)}
                        placeholder="Conte algo sobre você..."
                        maxLength={190}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                        {(profile.aboutMe || '').length}/190
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="settings-section">
                    <div className="settings-input-group">
                      <label className="settings-label">Status</label>
                      <input
                        className="settings-input"
                        value={profile.status || ''}
                        onChange={e => updateField('status', e.target.value)}
                        placeholder="O que você está fazendo?"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Avatar</h3>
                    <p className="settings-section-desc">Suporta JPG, PNG e GIF. Recomendado 512x512.</p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={profile.avatarUrl}
                          style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => avatarInputRef.current.click()}
                          className="button-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                        >
                          <Upload size={16} /> Mudar avatar
                        </button>
                        <button
                          onClick={() => updateField('avatarUrl', `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)}
                          className="button-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                        >
                          <Trash2 size={16} /> Remover avatar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Banner</h3>
                    <p className="settings-section-desc">Suporta JPG, PNG e GIF. Recomendado 960x540.</p>
                    <div style={{
                      width: '100%', height: '120px', borderRadius: '12px',
                      background: profile.bannerUrl
                        ? `url(${profile.bannerUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${profile.accentColor || '#0060df'}, ${profile.accentColor || '#0060df'}88)`,
                      border: '2px dashed rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '12px', overflow: 'hidden', position: 'relative'
                    }}>
                      {!profile.bannerUrl && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)' }}>
                          <ImageIcon size={24} />
                          <span style={{ fontSize: '12px' }}>Nenhum banner definido</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => bannerInputRef.current.click()}
                        className="button-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                      >
                        <Upload size={16} /> Mudar banner
                      </button>
                      {profile.bannerUrl && (
                        <button
                          onClick={() => updateField('bannerUrl', '')}
                          className="button-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                        >
                          <Trash2 size={16} /> Remover banner
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Cor de Destaque</h3>
                    <p className="settings-section-desc">Define a cor do seu perfil quando não há banner.</p>
                    <div className="color-picker-grid">
                      {ACCENT_COLORS.map(color => (
                        <div
                          key={color}
                          className={`color-swatch ${profile.accentColor === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => updateField('accentColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'frames' && (
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Decoração de Avatar</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Adicione uma moldura animada ao redor da sua foto de perfil
                  </p>

                  <div className="frame-picker-grid">
                    {AVATAR_FRAMES.map(frame => (
                      <div
                        key={frame.id}
                        className={`frame-picker-item ${profile.avatarFrame === frame.id ? 'active' : ''}`}
                        onClick={() => updateField('avatarFrame', frame.id)}
                      >
                        <div style={{ position: 'relative' }}>
                          <img
                            src={profile.avatarUrl}
                            className={frame.css !== 'none' ? frame.css : undefined}
                            style={{
                              width: '56px', height: '56px', borderRadius: '50%',
                              objectFit: 'cover',
                              border: frame.css === 'none' ? '2px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                          />
                        </div>
                        <span>{frame.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current selection info */}
                  <div style={{
                    marginTop: '24px', padding: '16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Moldura atual: <span style={{ color: '#fff', fontWeight: '600' }}>
                        {AVATAR_FRAMES.find(f => f.id === profile.avatarFrame)?.label || 'Nenhuma'}
                      </span>
                    </p>
                  </div>

                  {profile.avatarFrame !== 'none' && (
                    <button
                      onClick={() => updateField('avatarFrame', 'none')}
                      className="button-danger"
                      style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                    >
                      <Trash2 size={16} /> Remover decoração
                    </button>
                  )}
                </div>
              )}

              {settingsTab === 'appearance' && (
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Aparência</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Personalize a aparência do seu perfil
                  </p>

                  {/* Badges Management */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Suas Badges</h3>
                    {profile.userNumber === MOD_USER_NUMBER ? (
                      <>
                        <p className="settings-section-desc">
                          Você é moderador ({MOD_USER_NUMBER}). Clique em uma badge para ativar/desativar.
                        </p>
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                          gap: '10px'
                        }}>
                          {BADGES.map(b => {
                            const isActive = profile.badges?.includes(b.id);
                            return (
                              <div
                                key={b.id}
                                onClick={() => {
                                  const currentBadges = profile.badges || [];
                                  const newBadges = isActive
                                    ? currentBadges.filter(id => id !== b.id)
                                    : [...currentBadges, b.id];
                                  updateField('badges', newBadges);
                                }}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '12px 14px', borderRadius: '10px',
                                  background: isActive ? `${b.color}15` : 'rgba(255,255,255,0.02)',
                                  border: isActive ? `2px solid ${b.color}` : '2px solid rgba(255,255,255,0.06)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  boxShadow: isActive ? `0 0 12px ${b.color}33` : 'none'
                                }}
                              >
                                {b.iconType === 'bear' ? (
                                  <AeloBearIcon size={18} color={isActive ? b.color : '#555'} />
                                ) : (
                                  <b.icon size={18} color={isActive ? b.color : '#555'} />
                                )}
                                <span style={{
                                  fontSize: '13px',
                                  color: isActive ? '#fff' : 'var(--text-secondary)',
                                  fontWeight: isActive ? '600' : '400'
                                }}>
                                  {b.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="settings-section-desc">
                          Badges são atribuídas por moderadores. Fale com um membro da equipe para receber sua badge.
                        </p>
                        {profile.badges && profile.badges.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {BADGES.filter(b => profile.badges.includes(b.id)).map(b => (
                              <div key={b.id} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 14px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}>
                                {b.iconType === 'bear' ? (
                                  <AeloBearIcon size={16} color={b.color} />
                                ) : (
                                  <b.icon size={16} color={b.color} />
                                )}
                                <span style={{ fontSize: '13px', color: '#fff' }}>{b.label}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                            Nenhuma badge atribuída ainda
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* User Number */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Placa de Identificação</h3>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <img
                        src={profile.avatarUrl}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{profile.tag}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {profile.userNumber || '#------'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accent Color (also here for convenience) */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Cor de Destaque</h3>
                    <div className="color-picker-grid">
                      {ACCENT_COLORS.map(color => (
                        <div
                          key={color}
                          className={`color-swatch ${profile.accentColor === color ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => updateField('accentColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'audio' && (
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Voz e Áudio</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
                    Configure seu microfone, alto-falante e supressão de ruído
                  </p>

                  {/* Device Selection */}
                  <div className="settings-section">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {/* Input device */}
                      <div className="settings-input-group">
                        <label className="settings-label">Microfone</label>
                        <select
                          value={audioSettings.inputDeviceId}
                          onChange={e => updateAudioSetting('inputDeviceId', e.target.value)}
                          style={{
                            background: '#111319', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px', padding: '12px 16px', color: 'white',
                            outline: 'none', width: '100%', fontSize: '14px',
                            fontFamily: 'inherit', cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2390949c' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center'
                          }}
                        >
                          <option value="">Padrão do sistema</option>
                          {audioDevices.inputs.map(d => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Microfone ${d.deviceId.slice(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Output device */}
                      <div className="settings-input-group">
                        <label className="settings-label">Alto-falante</label>
                        <select
                          value={audioSettings.outputDeviceId}
                          onChange={e => updateAudioSetting('outputDeviceId', e.target.value)}
                          style={{
                            background: '#111319', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px', padding: '12px 16px', color: 'white',
                            outline: 'none', width: '100%', fontSize: '14px',
                            fontFamily: 'inherit', cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2390949c' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center'
                          }}
                        >
                          <option value="">Padrão do sistema</option>
                          {audioDevices.outputs.map(d => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Alto-falante ${d.deviceId.slice(0, 8)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Mic Volume */}
                  <div className="settings-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Mic size={18} color="var(--primary-color)" />
                      <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Volume do Microfone</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input
                        type="range" min="0" max="200" step="1"
                        value={audioSettings.micVolume}
                        onChange={e => updateAudioSetting('micVolume', Number(e.target.value))}
                        style={{
                          flex: 1,
                          background: `linear-gradient(to right, #0060df 0%, #0060df calc(${audioSettings.micVolume / 2}% + ${8 - (audioSettings.micVolume / 2) * 0.16}px), rgba(255,255,255,0.1) calc(${audioSettings.micVolume / 2}% + ${8 - (audioSettings.micVolume / 2) * 0.16}px))`
                        }}
                      />
                      <span style={{
                        fontSize: '14px', fontWeight: '600', color: '#fff',
                        minWidth: '48px', textAlign: 'right'
                      }}>
                        {audioSettings.micVolume}%
                      </span>
                    </div>
                  </div>

                  {/* Speaker Volume */}
                  <div className="settings-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Volume2 size={18} color="var(--primary-color)" />
                      <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Volume do Alto-falante</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input
                        type="range" min="0" max="200" step="1"
                        value={audioSettings.speakerVolume}
                        onChange={e => updateAudioSetting('speakerVolume', Number(e.target.value))}
                        style={{
                          flex: 1,
                          background: `linear-gradient(to right, #0060df 0%, #0060df calc(${audioSettings.speakerVolume / 2}% + ${8 - (audioSettings.speakerVolume / 2) * 0.16}px), rgba(255,255,255,0.1) calc(${audioSettings.speakerVolume / 2}% + ${8 - (audioSettings.speakerVolume / 2) * 0.16}px))`
                        }}
                      />
                      <span style={{
                        fontSize: '14px', fontWeight: '600', color: '#fff',
                        minWidth: '48px', textAlign: 'right'
                      }}>
                        {audioSettings.speakerVolume}%
                      </span>
                    </div>
                  </div>

                  {/* Mic Test */}
                  <div className="settings-section">
                    <h3 className="settings-section-title">Teste de Microfone</h3>
                    <p className="settings-section-desc">
                      Teste seu microfone para verificar se está funcionando corretamente.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <button
                        onClick={micTestActive ? stopMicTest : startMicTest}
                        className={micTestActive ? 'button-danger' : 'button-primary'}
                        style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Mic size={16} />
                        {micTestActive ? 'Parar teste' : 'Teste do microfone'}
                      </button>
                    </div>
                    {/* Level meter */}
                    <div style={{
                      display: 'flex', gap: '3px', alignItems: 'flex-end',
                      height: '32px', padding: '4px 0'
                    }}>
                      {Array.from({ length: 30 }, (_, i) => {
                        const threshold = (i / 30) * 100;
                        const isActive = micTestActive && micTestLevel > threshold;
                        let barColor = '#2ed573';
                        if (threshold > 70) barColor = '#ff5252';
                        else if (threshold > 45) barColor = '#ffa502';
                        return (
                          <div
                            key={i}
                            style={{
                              flex: 1, borderRadius: '2px',
                              height: `${12 + (i * 0.6)}px`,
                              background: isActive ? barColor : 'rgba(255,255,255,0.06)',
                              transition: 'background 0.05s'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Noise Suppression */}
                  <div className="settings-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <ShieldCheck size={18} color="var(--primary-color)" />
                      <h3 className="settings-section-title" style={{ marginBottom: 0 }}>Supressão de Ruído</h3>
                    </div>
                    <p className="settings-section-desc">
                      Reduz ruídos de fundo como teclado, ventilador e ruído ambiente.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { value: 'off', label: 'Desativada', desc: 'Áudio puro, sem processamento' },
                        { value: 'standard', label: 'Padrão', desc: 'Redução básica de ruído de fundo' },
                        { value: 'aggressive', label: 'Agressiva', desc: 'Máxima supressão — ideal para ambientes ruidosos' },
                      ].map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => updateAudioSetting('noiseSuppression', opt.value)}
                          style={{
                            padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                            background: audioSettings.noiseSuppression === opt.value
                              ? 'rgba(0, 96, 223, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: audioSettings.noiseSuppression === opt.value
                              ? '2px solid var(--primary-color)' : '2px solid rgba(255,255,255,0.06)',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '14px'
                          }}
                        >
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '50%',
                            border: audioSettings.noiseSuppression === opt.value
                              ? '5px solid var(--primary-color)' : '2px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.15s', flexShrink: 0
                          }} />
                          <div>
                            <p style={{
                              fontSize: '14px', fontWeight: '600',
                              color: audioSettings.noiseSuppression === opt.value ? '#fff' : 'var(--text-secondary)'
                            }}>
                              {opt.label}
                            </p>
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Echo Cancellation */}
                  <div className="settings-section">
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <h3 className="settings-section-title">Cancelamento de Eco</h3>
                        <p className="settings-section-desc" style={{ marginBottom: 0 }}>
                          Previne que o áudio dos alto-falantes retorne ao seu microfone.
                        </p>
                      </div>
                      {/* Toggle switch */}
                      <div
                        onClick={() => updateAudioSetting('echoCancellation', !audioSettings.echoCancellation)}
                        style={{
                          width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
                          background: audioSettings.echoCancellation ? 'var(--primary-color)' : 'rgba(255,255,255,0.15)',
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#fff', position: 'absolute', top: '3px',
                          left: audioSettings.echoCancellation ? '25px' : '3px',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Input Sensitivity */}
                  <div className="settings-section">
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'
                    }}>
                      <div>
                        <h3 className="settings-section-title">Sensibilidade de Entrada</h3>
                        <p className="settings-section-desc" style={{ marginBottom: 0 }}>
                          Controla quanto som o Aelo captura do seu microfone. Sons abaixo do limite não são transmitidos.
                        </p>
                      </div>
                      {/* Auto toggle */}
                      <div
                        onClick={() => updateAudioSetting('autoSensitivity', !audioSettings.autoSensitivity)}
                        style={{
                          width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
                          background: audioSettings.autoSensitivity ? 'var(--primary-color)' : 'rgba(255,255,255,0.15)',
                          position: 'relative', transition: 'background 0.2s', flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          background: '#fff', position: 'absolute', top: '3px',
                          left: audioSettings.autoSensitivity ? '25px' : '3px',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {audioSettings.autoSensitivity ? 'Automático — Aelo ajusta para você' : 'Manual — defina o limite'}
                    </p>
                    {!audioSettings.autoSensitivity && (
                      <div style={{ position: 'relative' }}>
                        <input
                          type="range" min="0" max="100" step="1"
                          value={audioSettings.inputSensitivity}
                          onChange={e => updateAudioSetting('inputSensitivity', Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                        />
                        {/* Sensitivity bar with mic level indicator */}
                        <div style={{
                          marginTop: '8px', height: '8px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden'
                        }}>
                          {/* Current level */}
                          {micTestActive && (
                            <div style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0,
                              width: `${micTestLevel}%`,
                              background: micTestLevel > audioSettings.inputSensitivity
                                ? 'linear-gradient(90deg, #2ed573, #00fa9a)' : 'linear-gradient(90deg, #ff5252, #ff6348)',
                              borderRadius: '4px', transition: 'width 0.05s'
                            }} />
                          )}
                          {/* Threshold marker */}
                          <div style={{
                            position: 'absolute', top: '-4px', bottom: '-4px',
                            left: `${audioSettings.inputSensitivity}%`,
                            width: '3px', background: '#fff', borderRadius: '2px',
                            boxShadow: '0 0 6px rgba(255,255,255,0.3)'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sensível</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>-{audioSettings.inputSensitivity}dB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div style={{
              width: '380px', flexShrink: 0,
              padding: '32px 24px',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              overflowY: 'auto'
            }}>
              <h3 style={{
                fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                letterSpacing: '1px', color: 'var(--text-secondary)',
                marginBottom: '20px', alignSelf: 'flex-start'
              }}>
                Prévia
              </h3>

              <div style={{
                border: `2px solid ${profile.accentColor || '#0060df'}`,
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: `0 0 30px ${profile.accentColor || '#0060df'}33`
              }}>
                <UserProfileCard data={profile} isPopout />
              </div>

              {/* ID Card below preview */}
              <div style={{
                marginTop: '20px', width: '100%',
                padding: '16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Placa de Identificação
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={profile.avatarUrl}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600' }}>{profile.tag}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {profile.userNumber || '#------'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
