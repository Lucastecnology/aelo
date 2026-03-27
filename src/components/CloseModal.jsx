import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CloseModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 30000, backdropFilter: 'blur(10px)' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: '400px', background: '#1e1f22', borderRadius: '16px', padding: '32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h2>Quit Aelo?</h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button onClick={() => window.electronAPI.appRelaunch()} className="button-primary" style={{ flexGrow: 1 }}>Restart</button>
              <button onClick={() => window.electronAPI.closeWindow()} style={{ flexGrow: 1, background: '#ff5252', color: 'white', border: 'none', borderRadius: '12px', padding: '12px', cursor: 'pointer' }}>Quit</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CloseModal;
