import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Smartphone, Mail, Chrome } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER } from '@/services/mockData';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

/* ── Shared layout ───────────────────────────────────────────────── */
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-glow"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 bg-brand-500 blur-3xl"/>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" fill="white"/>
          </div>
          <span className="font-display text-2xl font-bold text-text-primary">OmniPost</span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-text-primary leading-tight mb-4">
            Publish Everywhere.<br/>
            <span className="gradient-text">Once.</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-8">
            Connect all your social platforms and post to Instagram, Twitter, YouTube, LinkedIn, ShareChat and more — simultaneously, from one beautiful dashboard.
          </p>
          {/* Platform icons row */}
          <div className="flex gap-3">
            {['📸','𝕏','▶️','💼','🗣️','@','👍','🎬'].map((icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-xl bg-bg-card border border-bg-border flex items-center justify-center text-lg shadow-card"
              >
                {icon}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="relative flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full bg-brand-600/30 border-2 border-bg-primary flex items-center justify-center text-xs font-bold text-brand-300">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary"><span className="text-text-primary font-semibold">2,400+ creators</span> already using OmniPost</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Login Page ──────────────────────────────────────────────────── */
export function LoginPage() {
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogin() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAuth(MOCK_USER, 'mock_token_xyz');
    toast.success('Welcome back, Priya! 👋');
    navigate('/');
    setLoading(false);
  }

  async function handleSendOtp() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setShowOtp(true);
    setLoading(false);
    toast.success('OTP sent to +91 ' + mobile);
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" fill="white"/>
          </div>
          <span className="font-display text-xl font-bold text-text-primary">OmniPost</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary mt-1">Sign in to your account to continue</p>
        </div>

        {/* Google sign-in */}
        <button onClick={handleLogin} className="w-full btn-secondary gap-3 py-3 justify-center">
          <Chrome className="w-4.5 h-4.5"/> Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 divider"/>
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 divider"/>
        </div>

        {/* Method toggle */}
        <div className="flex bg-bg-secondary border border-bg-border rounded-xl p-1">
          <button onClick={() => setMethod('email')} className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all', method === 'email' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted')}>
            <Mail className="w-4 h-4"/> Email
          </button>
          <button onClick={() => setMethod('mobile')} className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all', method === 'mobile' ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-muted')}>
            <Smartphone className="w-4 h-4"/> Mobile OTP
          </button>
        </div>

        <div className="space-y-4">
          {method === 'email' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="priya@example.com" className="form-input"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
                <div className="relative">
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="form-input pr-10"/>
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                    {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <button className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="form-input w-20 text-center text-text-secondary shrink-0">+91</div>
                  <input value={mobile} onChange={e => setMobile(e.target.value)} type="tel" placeholder="98765 43210" className="form-input flex-1"/>
                </div>
              </div>
              {showOtp ? (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Enter OTP</label>
                  <input value={otp} onChange={e => setOtp(e.target.value)} type="text" maxLength={6} placeholder="6-digit OTP" className="form-input text-center text-xl tracking-widest font-mono"/>
                  <p className="text-xs text-text-muted mt-1 text-center">Resend OTP in 30s</p>
                </div>
              ) : null}
            </>
          )}
        </div>

        <button
          onClick={method === 'mobile' && !showOtp ? handleSendOtp : handleLogin}
          disabled={loading}
          className="btn-primary w-full py-3 justify-center text-base"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/></svg>
          ) : (
            <>{method === 'mobile' && !showOtp ? 'Send OTP' : 'Sign In'} <ArrowRight className="w-4 h-4"/></>
          )}
        </button>

        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Create account</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

/* ── Register Page ───────────────────────────────────────────────── */
export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleRegister() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAuth({ ...MOCK_USER, name }, 'mock_token_xyz');
    toast.success('Account created! Let\'s set up your platforms 🚀');
    navigate('/onboarding');
    setLoading(false);
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex lg:hidden items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm"><Zap className="w-4 h-4 text-white" fill="white"/></div>
          <span className="font-display text-xl font-bold text-text-primary">OmniPost</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Create account</h1>
          <p className="text-text-secondary mt-1">Start your 14-day free Creator trial — no card needed</p>
        </div>

        <button onClick={handleRegister} className="w-full btn-secondary gap-3 py-3 justify-center">
          <Chrome className="w-4.5 h-4.5"/> Sign up with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 divider"/><span className="text-xs text-text-muted">or</span><div className="flex-1 divider"/>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" className="form-input"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="priya@example.com" className="form-input"/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Mobile (India)</label>
            <div className="flex gap-2">
              <div className="form-input w-16 text-center text-text-secondary shrink-0">+91</div>
              <input type="tel" placeholder="98765 43210" className="form-input flex-1"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min 8 chars" className="form-input"/>
          </div>
        </div>

        <button onClick={handleRegister} disabled={loading} className="btn-primary w-full py-3 justify-center text-base">
          {loading ? <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/></svg> : <>Create Account <ArrowRight className="w-4 h-4"/></>}
        </button>

        <p className="text-xs text-text-muted text-center">By creating an account you agree to our Terms of Service and Privacy Policy.</p>
        <p className="text-center text-sm text-text-secondary">Already have an account?{' '}<Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link></p>
      </motion.div>
    </AuthLayout>
  );
}

/* ── Onboarding Page ─────────────────────────────────────────────── */
export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const steps = ['Welcome', 'Connect Platforms', 'Customize', 'Done'];

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i <= step ? 'bg-brand-600 text-white' : 'bg-bg-secondary border border-bg-border text-text-muted')}>{i + 1}</div>
              <span className={clsx('text-xs font-medium hidden sm:block', i === step ? 'text-text-primary' : 'text-text-muted')}>{s}</span>
              {i < steps.length - 1 && <div className={clsx('flex-1 h-0.5 rounded-full', i < step ? 'bg-brand-600' : 'bg-bg-border')}/>}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {step === 0 && (
            <Card className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-brand mx-auto flex items-center justify-center shadow-glow"><Zap className="w-8 h-8 text-white" fill="white"/></div>
              <h2 className="font-display text-2xl font-bold text-text-primary">Welcome to OmniPost!</h2>
              <p className="text-text-secondary">Let's get your account set up in 3 quick steps. First, we'll connect your social media accounts.</p>
              <button onClick={() => setStep(1)} className="btn-primary w-full py-3 justify-center">Get Started <ArrowRight className="w-4 h-4"/></button>
            </Card>
          )}

          {step === 1 && (
            <Card className="p-6 space-y-5">
              <h2 className="font-display text-xl font-bold text-text-primary">Connect Your Platforms</h2>
              <p className="text-text-secondary text-sm">Select the platforms you want to manage. You can always add more later.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C' },
                  { id: 'twitter',   name: 'Twitter/X',  icon: '𝕏',  color: '#1DA1F2' },
                  { id: 'facebook',  name: 'Facebook',  icon: '👍', color: '#1877F2' },
                  { id: 'youtube',   name: 'YouTube',   icon: '▶️', color: '#FF0000' },
                  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', color: '#0A66C2' },
                  { id: 'threads',   name: 'Threads',   icon: '@',  color: '#e5e7eb' },
                ].map(p => (
                  <motion.button key={p.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => toast.success(`Connecting ${p.name}…`)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-secondary hover:border-brand-600/40 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: `${p.color}22` }}>{p.icon}</div>
                    <span className="text-sm font-semibold text-text-primary">{p.name}</span>
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3 justify-center">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3 justify-center">Continue <ArrowRight className="w-4 h-4"/></button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-5">
              <h2 className="font-display text-xl font-bold text-text-primary">Choose Your Plan</h2>
              <p className="text-text-secondary text-sm">Start with a 14-day free trial of Creator. No credit card needed.</p>
              <div className="p-4 rounded-xl border border-brand-600/40 bg-brand-600/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-text-primary">Creator Plan — Free Trial</p>
                    <p className="text-xs text-text-muted mt-0.5">14 days free, then ₹499/month</p>
                  </div>
                  <span className="text-brand-400 font-bold text-lg">FREE</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 justify-center">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3 justify-center">Start Trial <ArrowRight className="w-4 h-4"/></button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-accent-emerald/20 mx-auto flex items-center justify-center">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary">You're all set!</h2>
              <p className="text-text-secondary">Your OmniPost account is ready. Start creating and publishing content to all your platforms.</p>
              <button onClick={() => { setAuth(MOCK_USER, 'mock_token'); navigate('/'); }} className="btn-primary w-full py-3 justify-center text-base">
                Go to Dashboard <ArrowRight className="w-4 h-4"/>
              </button>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
