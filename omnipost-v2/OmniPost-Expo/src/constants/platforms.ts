// src/constants/platforms.ts
export const PLATFORMS = {
  instagram: { name: 'Instagram', abbr: 'IG', color: '#E1306C', maxChars: 2200,  maxMedia: 10 },
  facebook:  { name: 'Facebook',  abbr: 'FB', color: '#1877F2', maxChars: 63206, maxMedia: 10 },
  twitter:   { name: 'Twitter/X', abbr: 'X',  color: '#1DA1F2', maxChars: 280,   maxMedia: 4  },
  youtube:   { name: 'YouTube',   abbr: 'YT', color: '#FF0000', maxChars: 5000,  maxMedia: 1  },
  linkedin:  { name: 'LinkedIn',  abbr: 'LI', color: '#0A66C2', maxChars: 3000,  maxMedia: 9  },
  threads:   { name: 'Threads',   abbr: 'Th', color: '#AAAAAA', maxChars: 500,   maxMedia: 10 },
  sharechat: { name: 'ShareChat', abbr: 'SC', color: '#F58020', maxChars: 1000,  maxMedia: 1  },
  moj:       { name: 'Moj',       abbr: 'Mj', color: '#FF2D55', maxChars: 500,   maxMedia: 1  },
  telegram:  { name: 'Telegram',  abbr: 'TG', color: '#2AABEE', maxChars: 4096,  maxMedia: 10 },
  whatsapp:  { name: 'WhatsApp',  abbr: 'WA', color: '#25D366', maxChars: 1000,  maxMedia: 30 },
  pinterest: { name: 'Pinterest', abbr: 'Pi', color: '#E60023', maxChars: 500,   maxMedia: 1  },
  snapchat:  { name: 'Snapchat',  abbr: 'Sn', color: '#FFFC00', maxChars: 250,   maxMedia: 1  },
};

export const PLAN_LIMITS = {
  free:    { accounts: 3,  posts: 30,  media: 500   },
  creator: { accounts: 10, posts: Infinity, media: 5120  },
  agency:  { accounts: Infinity, posts: Infinity, media: 51200 },
};

export const DEMO_CREDENTIALS = {
  email:    'demo@omnipost.in',
  password: 'Demo@123',
  otp:      '123456',
};
