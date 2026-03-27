import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MemberBar = ({ isOpen, allParticipants, profile, onSelectUser }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          style={{ flexShrink: 0, background: 'var(--bg-sidebar)', borderLeft: '1px solid rgba(0,0,0,0.2)', overflow: 'hidden' }}
        >
          <div style={{ width: '280px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '2px', marginBottom: '24px', textTransform: 'uppercase' }}>
              ONLINE — {allParticipants.length}
            </p>
            {allParticipants.map((p, ix) => (
              <div
                key={ix}
                onClick={() => onSelectUser(p)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                className="hover-bg"
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={p.avatar}
                    style={{
                      width: '38px', height: '38px', borderRadius: '12px',
                      objectFit: 'cover',
                      border: p.user === profile.displayName ? '1px solid var(--primary-color)' : 'none'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: '14px', height: '14px', background: '#36d391', borderRadius: '50%', border: '3px solid var(--bg-sidebar)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{p.user}</p>
                  <p style={{ fontSize: '11px', color: '#36d391' }}>{p.channelId ? 'In Call' : 'Online'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemberBar;
