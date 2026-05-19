import { motion } from 'framer-motion';
import { Check, Zap, Star, Building2, CreditCard } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { PLAN_LIMITS } from '@/constants/platforms';
import { useAuthStore } from '@/store/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free', name: 'Free', icon: Zap, color: '#64748b',
    features: ['3 connected accounts','30 posts/month','Basic analytics','5 drafts','1 user'],
    price: 0,
  },
  {
    id: 'creator', name: 'Creator', icon: Star, color: '#6366f1',
    features: ['10 connected accounts','Unlimited posts','Advanced analytics','Scheduling','Unlimited drafts','5 GB media storage','Unlimited hashtag sets','Email support'],
    price: 499,
    popular: true,
  },
  {
    id: 'agency', name: 'Agency', icon: Building2, color: '#22d3ee',
    features: ['Unlimited accounts','Unlimited posts','Full analytics + export','Priority scheduling','50 GB media storage','Up to 10 team members','Phone + email support','White-label reports'],
    price: 1499,
  },
];

export function BillingPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Billing & Plans</h2>
        <p className="text-text-secondary text-sm mt-0.5">All plans include a 14-day free trial. Cancel anytime.</p>
      </div>

      {/* Current plan banner */}
      <Card className="p-5 border-brand-600/30 bg-brand-600/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-brand-400"/>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Current plan</p>
            <p className="font-display text-xl font-bold text-text-primary capitalize">{user?.plan ?? 'Free'}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-display font-bold text-text-primary">₹{PLAN_LIMITS[user?.plan ?? 'free'].priceMonthly}</p>
            <p className="text-xs text-text-muted">per month</p>
          </div>
        </div>
      </Card>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={clsx(
                'relative glass-card p-6 flex flex-col h-full transition-all',
                plan.popular && 'border-brand-600/50 shadow-glow-sm',
                isCurrent && 'border-accent-emerald/40'
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="success">Current</Badge>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}20` }}>
                    <plan.icon className="w-5 h-5" style={{ color: plan.color }}/>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text-primary">{plan.name}</h3>
                    <p className="text-2xl font-display font-bold text-text-primary">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                      {plan.price > 0 && <span className="text-sm text-text-muted font-normal">/mo</span>}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5"/>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (isCurrent) toast('You are already on this plan');
                    else toast.success(`Upgrading to ${plan.name}…`);
                  }}
                  className={clsx('w-full py-2.5 rounded-xl font-semibold text-sm transition-all',
                    isCurrent ? 'bg-bg-secondary text-text-muted cursor-default' :
                    plan.popular ? 'btn-primary' : 'btn-secondary')}
                >
                  {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payment methods */}
      <Card className="p-5">
        <h3 className="font-display font-bold text-text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-4.5 h-4.5 text-text-secondary"/> Payment Methods
        </h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {['UPI', 'Net Banking', 'Credit / Debit Card', 'Wallets (Paytm, PhonePe)'].map(m => (
            <span key={m} className="chip">{m}</span>
          ))}
        </div>
        <p className="text-xs text-text-muted">Powered by Razorpay · GST invoice on every payment · RBI compliant</p>
      </Card>
    </div>
  );
}
