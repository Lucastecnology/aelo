import React from 'react';
import { Hash, Users, Send } from 'lucide-react';

const ChatArea = ({
  activeChannel,
  messages,
  inputText,
  setInputText,
  handleSendMessage,
  isMemberBarOpen,
  setIsMemberBarOpen,
  profile,
  onSelectUser
}) => {
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#1a1d26' }}>
      {/* Header */}
      <div style={{ height: '56px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Hash size={24} color="var(--primary-color)" style={{ marginRight: '12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{activeChannel}</h3>
        <div style={{ flexGrow: 1 }} />
        <div onClick={() => setIsMemberBarOpen(!isMemberBarOpen)} style={{ cursor: 'pointer', color: isMemberBarOpen ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
          <Users size={22} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {messages.map((m, i) => {
          const isMe = m.user_name === profile.displayName;
          const displayAvatar = isMe ? profile.avatarUrl : m.avatar_url;
          const displayName = isMe ? profile.displayName : m.user_name;

          const handleClick = () => {
            onSelectUser({
              user: displayName,
              avatar: displayAvatar,
              fullProfile: isMe ? profile : { displayName: displayName, avatarUrl: displayAvatar, badges: [], tag: '0000', aboutMe: '---' }
            });
          };
          return (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <img
                src={displayAvatar}
                onClick={handleClick}
                style={{ width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', objectFit: 'cover' }}
              />
              <div>
                <span
                  style={{ fontWeight: 'bold', color: 'var(--primary-color)', cursor: 'pointer' }}
                  onClick={handleClick}
                >
                  {displayName}
                </span>
                <p style={{ color: '#dbdee1', fontSize: '14px', marginTop: '4px' }}>{m.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ padding: '0 24px 24px' }}>
        <div className="card" style={{ padding: '0 20px', height: '54px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px', background: '#111319' }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(e)}
            placeholder={`Conversar em #${activeChannel}`}
            style={{ flexGrow: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
          />
          <Send size={20} color="var(--primary-color)" cursor="pointer" onClick={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
