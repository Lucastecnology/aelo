import React from 'react';
import { Zap, Minus, Square, X } from 'lucide-react';

const TitleBar = ({ onClose }) => (
  <div className="drag-region" style={{ height: '36px', width: '100%', position: 'absolute', top: 0, left: 0, background: '#0a0b0e', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', zIndex: 10001, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
    <div style={{ flexGrow: 1, paddingLeft: '16px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Zap size={18} /> AELΘ <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>PROJETO ELITE</span>
    </div>
    <div className="no-drag" style={{ display: 'flex', height: '100%' }}>
      <div onClick={() => window.electronAPI.minimizeWindow()} className="hover-bg" style={{ padding: '8px 16px', cursor: 'pointer' }}><Minus size={14} /></div>
      <div onClick={() => window.electronAPI.maximizeWindow()} className="hover-bg" style={{ padding: '4px 16px', cursor: 'pointer' }}><Square size={14} /></div>
      <div onClick={onClose} className="hover-bg-red" style={{ padding: '8px 16px', cursor: 'pointer' }}><X size={14} /></div>
    </div>
  </div>
);

export default TitleBar;
