import { ShieldCheck, Zap, Ghost, Terminal, Star, Crown, Flame, Heart, Sparkles, Award, Gem, Shield } from 'lucide-react';

export const VOICE_CHANNELS = [
  { id: 'lobby', name: 'Lobby Central' },
  { id: 'squad1', name: 'Squad 01' }
];

// --- BADGES ---
export const BADGES = [
  { id: 'founder', icon: Crown, color: '#ffd700', label: 'Fundador' },
  { id: 'staff', icon: ShieldCheck, color: '#ff5252', label: 'Staff' },
  { id: 'mod', icon: Shield, color: '#5865f2', label: 'Moderador' },
  { id: 'dev', icon: Terminal, color: '#0060df', label: 'Desenvolvedor' },
  { id: 'aelo_bear', iconType: 'bear', color: '#0060df', label: 'Aelo Bear' },
  { id: 'elite', icon: Zap, color: '#ff73fa', label: 'Elite' },
  { id: 'early', icon: Star, color: '#faa61a', label: 'Early Adopter' },
  { id: 'supporter', icon: Heart, color: '#ff6b81', label: 'Supporter' },
  { id: 'bug_hunter', icon: Ghost, color: '#36d391', label: 'Bug Hunter' },
  { id: 'gem', icon: Gem, color: '#9b59b6', label: 'Gem' },
  { id: 'fire', icon: Flame, color: '#ff6348', label: 'On Fire' },
  { id: 'sparkle', icon: Sparkles, color: '#00d4ff', label: 'Sparkle' },
  { id: 'awarded', icon: Award, color: '#2ed573', label: 'Premiado' },
];

// --- AVATAR FRAMES / DECORATIONS ---
export const AVATAR_FRAMES = [
  { id: 'none', label: 'Nenhuma', css: 'none' },
  { id: 'pulse_blue', label: 'Pulso Azul', css: 'pulse-blue-frame' },
  { id: 'rotating_gradient', label: 'Gradiente Rotativo', css: 'rotating-gradient-frame' },
  { id: 'fire_ring', label: 'Anel de Fogo', css: 'fire-ring-frame' },
  { id: 'electric', label: 'Elétrico', css: 'electric-frame' },
  { id: 'rainbow', label: 'Arco-íris', css: 'rainbow-frame' },
  { id: 'purple_glow', label: 'Brilho Roxo', css: 'purple-glow-frame' },
  { id: 'gold_ring', label: 'Anel Dourado', css: 'gold-ring-frame' },
];

// --- ACCENT COLORS ---
export const ACCENT_COLORS = [
  '#0060df', '#5865f2', '#9b59b6', '#ff73fa',
  '#ff5252', '#ff6348', '#ffa502', '#ffd700',
  '#2ed573', '#36d391', '#00d4ff', '#1abc9c',
];

// --- DEFAULT PROFILE ---
export const DEFAULT_PROFILE = {
  displayName: 'Lucas',
  tag: 'xgn',
  userNumber: '#000000',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
  bannerUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1000',
  pronouns: 'ele/dele',
  aboutMe: 'Desenvolvedor da Aelo.',
  badges: ['founder', 'dev', 'aelo_bear', 'elite'],
  avatarFrame: 'none',
  accentColor: '#0060df',
  status: '',
};

// --- MOD SYSTEM ---
export const MOD_USER_NUMBER = '#000000';
