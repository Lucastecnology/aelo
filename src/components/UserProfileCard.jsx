import React from 'react';
import { BADGES, AVATAR_FRAMES } from '../constants';
import AeloBearIcon from './AeloBearIcon';

const UserProfileCard = ({ data, isPopout = false }) => {
  const frame = AVATAR_FRAMES.find(f => f.id === data.avatarFrame) || AVATAR_FRAMES[0];
  const accentColor = data.accentColor || '#0060df';

  return (
    <div style={{
      width: isPopout ? '360px' : '100%',
      background: '#111319',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
    }}>
      {/* Banner */}
      <div style={{
        height: isPopout ? '110px' : '130px',
        background: data.bannerUrl
          ? `url(${data.bannerUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
        position: 'relative'
      }}>
        {/* Status badge */}
        {data.status && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            padding: '6px 14px', borderRadius: '20px',
            fontSize: '12px', color: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>💬</span> {data.status}
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div style={{ padding: '0 24px 24px', position: 'relative', marginTop: '-48px' }}>
        {/* Avatar with frame */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={data.avatarUrl}
            className={frame.css !== 'none' ? frame.css : undefined}
            style={{
              width: '94px', height: '94px',
              borderRadius: '50%',
              border: `6px solid #111319`,
              background: '#222',
              objectFit: 'cover'
            }}
          />
          {/* Online indicator */}
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            width: '16px', height: '16px',
            background: '#36d391', borderRadius: '50%',
            border: '4px solid #111319'
          }} />
        </div>

        {/* Name + Tag + Badges */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>{data.displayName}</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>.{data.tag}</span>
            {/* Badges inline */}
            {data.badges && data.badges.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                {BADGES.filter(b => data.badges?.includes(b.id)).map(b => (
                  <div key={b.id} title={b.label} className="badge-item" style={{ padding: '4px' }}>
                    {b.iconType === 'bear' ? (
                      <AeloBearIcon size={14} color={b.color} />
                    ) : (
                      <b.icon size={14} color={b.color} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {data.userNumber && (
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', fontFamily: 'monospace' }}>
              {data.userNumber}
            </p>
          )}
          {data.pronouns && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{data.pronouns}</p>
          )}
        </div>

        <hr style={{ border: 'none', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

        {/* About Me */}
        {data.aboutMe && (
          <section style={{ marginBottom: '12px' }}>
            <h4 style={{ fontSize: '12px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>
              Sobre mim
            </h4>
            <p style={{ fontSize: '14px', color: '#dbdee1', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {data.aboutMe}
            </p>
          </section>
        )}

        {/* Member since */}
        <section>
          <h4 style={{ fontSize: '12px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>
            Membro Aelo
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {data.userNumber || '#------'}
          </p>
        </section>
      </div>
    </div>
  );
};

export default UserProfileCard;
