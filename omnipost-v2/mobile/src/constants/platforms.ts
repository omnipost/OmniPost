// src/constants/platforms.ts
export const PLATFORMS = {
  instagram: { id: 'instagram', name: 'Instagram',        abbr: 'IG', color: '#E1306C', phase: 1, maxChars: 2200,   mediaTypes: ['image','video','reel','story','carousel'] },
  facebook:  { id: 'facebook',  name: 'Facebook',         abbr: 'FB', color: '#1877F2', phase: 1, maxChars: 63206,  mediaTypes: ['image','video','story'] },
  twitter:   { id: 'twitter',   name: 'Twitter / X',      abbr: 'X',  color: '#1DA1F2', phase: 1, maxChars: 280,    mediaTypes: ['image','video'] },
  youtube:   { id: 'youtube',   name: 'YouTube',          abbr: 'YT', color: '#FF0000', phase: 1, maxChars: 5000,   mediaTypes: ['video','short'] },
  linkedin:  { id: 'linkedin',  name: 'LinkedIn',         abbr: 'LI', color: '#0A66C2', phase: 1, maxChars: 3000,   mediaTypes: ['image','video','article'] },
  threads:   { id: 'threads',   name: 'Threads',          abbr: 'Th', color: '#AAAAAA', phase: 1, maxChars: 500,    mediaTypes: ['image','video'] },
  sharechat: { id: 'sharechat', name: 'ShareChat',        abbr: 'SC', color: '#F58020', phase: 2, maxChars: 500,    mediaTypes: ['image','video'] },
  moj:       { id: 'moj',       name: 'Moj',              abbr: 'MJ', color: '#FF2D55', phase: 2, maxChars: 300,    mediaTypes: ['video'] },
  telegram:  { id: 'telegram',  name: 'Telegram',         abbr: 'TG', color: '#2AABEE', phase: 2, maxChars: 4096,   mediaTypes: ['image','video','audio'] },
  whatsapp:  { id: 'whatsapp',  name: 'WhatsApp Business',abbr: 'WA', color: '#25D366', phase: 2, maxChars: 4096,   mediaTypes: ['image','video'] },
  pinterest: { id: 'pinterest', name: 'Pinterest',        abbr: 'PI', color: '#E60023', phase: 2, maxChars: 500,    mediaTypes: ['image','video'] },
  snapchat:  { id: 'snapchat',  name: 'Snapchat',         abbr: 'SN', color: '#FFFC00', phase: 2, maxChars: 250,    mediaTypes: ['image','video','story'] },
} as const;

export const PLAN_LIMITS = {
  free:    { accounts: 3,           posts: 30,          scheduling: false, mediaGb: 0.5, price: 0 },
  creator: { accounts: 10,          posts: 'unlimited', scheduling: true,  mediaGb: 5,   price: 499 },
  agency:  { accounts: 'unlimited', posts: 'unlimited', scheduling: true,  mediaGb: 50,  price: 1499 },
};

export const DEMO_CREDENTIALS = {
  email:    'demo@omnipost.in',
  password: 'Demo@123',
  name:     'Priya Sharma',
};
