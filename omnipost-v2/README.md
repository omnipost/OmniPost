# OmniPost — Multi-Platform Social Media Publisher
> India's #1 platform for influencers to publish everywhere, once.

## 🔑 Demo Login Credentials
| Field    | Value               |
|----------|---------------------|
| Email    | demo@omnipost.in    |
| Password | Demo@123            |
| OTP demo | 123456              |

## 📁 Project Structure
```
omnipost/
├── frontend/   — React 18 + Vite + TypeScript + Tailwind (Web)
├── backend/    — Node.js + Express + TypeScript (API)
├── mobile/     — React Native 0.74 (iOS + Android)
└── README.md
```

## 🗂️ Complete File Reference

### Frontend /frontend/src/
```
App.tsx                     Root router (React Router v6)
main.tsx                    Entry: React Query, Toaster setup
index.css                   Global styles + design tokens

constants/platforms.ts      12 platform configs, plan limits
types/index.ts              All TypeScript interfaces
store/authStore.ts          Zustand auth (user, token, login/logout)
store/uiStore.ts            UI state (sidebar, composer modal)
services/api.ts             Axios client with JWT interceptors
services/mockData.ts        Demo data for all entities

components/layout/
  AppLayout.tsx             Shell: sidebar + header + outlet + modal
  Sidebar.tsx               Left nav, platform pills, upgrade banner
  Header.tsx                Search, notifications dropdown

components/ui/index.tsx     Card, Badge, StatCard, Modal, Toggle, PlatformIcon

components/composer/
  ComposerModal.tsx         Platform picker, text, hashtags, media upload,
                            per-platform char limits, schedule, publish

pages/
  DashboardPage.tsx         Stats, chart, platform reach, recent posts
  AnalyticsPage.tsx         Full charts, platform table, hashtags, best times
  CalendarPage.tsx          Monthly calendar grid, scheduled list
  MediaPage.tsx             Grid/list media library, upload, storage bar
  SettingsPage.tsx          Profile, accounts, notifications, security
  BillingPage.tsx           Plan comparison, Razorpay payment, invoices
  auth/LoginPage.tsx        Email, mobile OTP, Google, Register, Onboarding
```

### Backend /backend/src/
```
server.ts                   Express: helmet, CORS, rate limiting, all routes

config/database.ts          PostgreSQL pool
config/logger.ts            Winston logger
config/queue.ts             Bull queues: publish, analytics, token-refresh
config/schema.sql           Full DB schema with indexes + triggers

middleware/auth.ts          requireAuth JWT middleware

controllers/authController.ts    register, login, sendOtp, verifyOtp, getMe
controllers/postController.ts    publishPost, listPosts, delete, retry, draft

routes/auth.ts              POST /register /login /otp/send /otp/verify
routes/users.ts             GET/PATCH /profile
routes/accounts.ts          OAuth connect, callback, disconnect
routes/posts.ts             Publish, draft, list, delete, retry
routes/media.ts             Upload (multer), list, delete
routes/analytics.ts         Summary, per-post, export CSV
routes/webhooks.ts          Meta webhook, Razorpay events
routes/billing.ts           Subscribe, cancel, invoices

services/social/publisher.ts     Real API calls:
                                 Instagram (Meta Graph API v19)
                                 Facebook  (Meta Graph API v19)
                                 Twitter/X (X API v2)
                                 YouTube   (YouTube Data API v3)
                                 LinkedIn  (LinkedIn API v2)
                                 Threads   (Meta Threads API)
                                 ShareChat (ShareChat Creator API)
```

### Mobile /mobile/src/
```
App.tsx                     Root: QueryClient + AppNavigator + Toast

constants/theme.ts          Colors, Typography, Radius, Spacing, Shadow
constants/platforms.ts      Platform configs, plan limits, demo credentials
types/index.ts              Interfaces + Navigation param lists
store/authStore.ts          Zustand + MMKV persistent auth
store/uiStore.ts            Composer / modal state
services/api.ts             All API endpoint functions
services/mockData.ts        Demo data

components/UI.tsx           Button, Card, Badge, PlatformIcon, StatCard,
                            Toggle, InputField, EmptyState, SectionTitle

navigation/AppNavigator.tsx Stack (Auth) + BottomTab (Main) + custom tab bar

screens/auth/
  LoginScreen.tsx           Email/password + mobile OTP + Google
  RegisterScreen.tsx        Register form + 4-step onboarding wizard

screens/main/
  DashboardScreen.tsx       Stats, platform reach bars, posts, scheduled
  ComposeScreen.tsx         Platform picker, text, hashtags, schedule, publish
  AnalyticsScreen.tsx       Stats cards, platform table, hashtags, best times
  CalendarScreen.tsx        Calendar grid with dots, scheduled/published lists
  ProfileScreen.tsx         Profile/Accounts/Notifications/Security/Billing
```

## 🚀 Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env          # Fill in all values

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE omnipost_db;"
psql -U postgres -c "CREATE USER omnipost_user WITH PASSWORD 'yourpassword';"
psql -U postgres -c "GRANT ALL ON DATABASE omnipost_db TO omnipost_user;"
psql -U omnipost_user -d omnipost_db -f src/config/schema.sql

npm run dev                   # http://localhost:4000
```

### Frontend (Web)
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm run dev                   # http://localhost:5173
```
Login: demo@omnipost.in / Demo@123

### Mobile (React Native)
```bash
cd mobile
npm install
cd ios && pod install && cd ..  # iOS only

npm start                     # Start Metro bundler
npm run android               # Android emulator
npm run ios                   # iOS simulator
```

Edit `src/services/api.ts`:
```ts
// Android emulator:
export const BASE_URL = 'http://10.0.2.2:4000/api';
// iOS / physical device (use your machine IP):
export const BASE_URL = 'http://192.168.1.x:4000/api';
```

## 🔑 Environment Variables (Backend .env)
| Variable | Description |
|----------|-------------|
| JWT_SECRET | 64-char secret: `openssl rand -hex 32` |
| DB_* | PostgreSQL connection details |
| REDIS_URL | redis://localhost:6379 |
| META_APP_ID / META_APP_SECRET | developers.facebook.com |
| TWITTER_CLIENT_ID / SECRET | developer.twitter.com |
| GOOGLE_CLIENT_ID / SECRET | console.cloud.google.com |
| LINKEDIN_CLIENT_ID / SECRET | developer.linkedin.com |
| RAZORPAY_KEY_ID / SECRET | razorpay.com |
| MSG91_AUTH_KEY | msg91.com (India OTP) |
| AWS_ACCESS_KEY_ID / SECRET | AWS S3 media storage |
| TOKEN_ENCRYPTION_KEY | `openssl rand -hex 16` |

## 📦 Supported Platforms
| Platform  | Phase | Status   |
|-----------|-------|----------|
| Instagram | 1     | ✅ Ready  |
| Facebook  | 1     | ✅ Ready  |
| Twitter/X | 1     | ✅ Ready  |
| YouTube   | 1     | ✅ Ready  |
| LinkedIn  | 1     | ✅ Ready  |
| Threads   | 1     | ✅ Ready  |
| ShareChat | 2     | 🔜 Coming |
| Moj       | 2     | 🔜 Coming |
| Telegram  | 2     | 🔜 Coming |
| WhatsApp  | 2     | 🔜 Coming |
| Pinterest | 2     | 🔜 Coming |
| Snapchat  | 2     | 🔜 Coming |

## 💳 Plans
| Feature      | Free | Creator ₹499/mo | Agency ₹1499/mo |
|--------------|------|-----------------|-----------------|
| Accounts     | 3    | 10              | Unlimited       |
| Posts/month  | 30   | Unlimited       | Unlimited       |
| Scheduling   | ❌   | ✅              | ✅              |
| Media        | 500MB| 5GB             | 50GB            |
| Team members | 1    | 1               | 10              |

## 🔒 Security
- JWT auth with 7-day expiry
- bcrypt (cost 12) for passwords
- AES-256-GCM encrypted OAuth tokens
- Rate limiting: 100 req/15min general, 10 req/15min auth
- DPDP Act 2023 compliant, India data residency (AWS Mumbai)

*Built with ❤️ for Indian creators — OmniPost v1.0.0*
