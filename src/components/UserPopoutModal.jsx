import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileCard from './UserProfileCard';

const UserPopoutModal = ({ selectedUser, onClose }) => {
  return (
    <AnimatePresence>
      {selectedUser && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <UserProfileCard
              data={selectedUser.fullProfile || {
                displayName: selectedUser.user,
                avatarUrl: selectedUser.avatar,
                tag: '0000',
                badges: [],
                aboutMe: 'Elite member.',
                bannerUrl: ''
              }}
              isPopout
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserPopoutModal;
