import React from 'react';

const AeloBearIcon = ({ size = 15, color = '#0060df' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="5" r="3" fill={color} opacity="0.8" />
    <circle cx="17" cy="5" r="3" fill={color} opacity="0.8" />
    <rect x="4" y="6" width="16" height="14" rx="8" fill={color} />
    <circle cx="9" cy="12" r="1.5" fill="#111319" />
    <circle cx="15" cy="12" r="1.5" fill="#111319" />
    <ellipse cx="12" cy="15" rx="2.5" ry="1.8" fill="#111319" opacity="0.6" />
    <circle cx="12" cy="14.5" r="1" fill="#111319" />
  </svg>
);

export default AeloBearIcon;
