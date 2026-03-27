import { useState, useEffect } from 'react';
import { DEFAULT_PROFILE } from '../constants';

export const useProfile = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('aelo_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge: defaults first, then saved data, but ensure critical fields are present
      const merged = { ...DEFAULT_PROFILE, ...parsed };
      // Ensure userNumber is always set (for first user = mod)
      if (!merged.userNumber) merged.userNumber = DEFAULT_PROFILE.userNumber;
      // Ensure avatarFrame has a value
      if (!merged.avatarFrame) merged.avatarFrame = 'none';
      // Ensure badges is an array
      if (!Array.isArray(merged.badges)) merged.badges = DEFAULT_PROFILE.badges;
      return merged;
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('aelo_profile', JSON.stringify(profile));
  }, [profile]);

  return { profile, setProfile };
};
