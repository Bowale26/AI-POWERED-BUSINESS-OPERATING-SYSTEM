import React, { useState } from 'react';
import { Lock, Sparkles, Check, CreditCard, ArrowRight, ShieldAlert, RefreshCw, Star } from 'lucide-react';
import { db, doc, updateDoc } from '../lib/firebase';
import { User } from 'firebase/auth';

interface PremiumPaywallProps {
  user: User | null;
  userProfile: { plan: string; name: string; email: string } | null;
  onNavigateToBilling: () => void;
  tabName: string;
}

export default function PremiumPaywall({ user, userProfile, onNavigateToBilling, tabName }: PremiumPaywallProps) {
  const [loading, setLoading] = useState<string | null>(null);

  // Directly activate Free Trial for authenticated users
  const handleActivateTrial = async () => {
    if (!user) {
      onNavigateToBilling();
      return;
    }

    setLoading('trial');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        plan: 'Free Trial',
        joinedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error activating trial from paywall:', err);
    } finally {
      setLoading(null);
    }
  };

  // Directly initiate checkout from paywall
  const handleSubscribe = async (planType: 'monthly' | 'yearly', priceId: string, planName: string) => {
    if (!user) {
      onNavigateToBilling();
      return;
    }

    setLoading(planType);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          email: user.email,
          planName
        })
      });
      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        onNavigateToBilling();
      }
    } catch (err) {
      console.error('Checkout creation error from paywall:', err);
      onNavigateToBilling();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[75vh] bg-dark-card/30 border border-white/5 rounded-2xl max-w-4xl mx-auto space-y-8 animate-fade-in relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Lock header */}
      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex p-4 bg-brand-primary/10 text-brand-primary rounded-full border border-brand-primary/20 mb-2 animate-bounce-slow">
          <Lock className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono font-bold text-brand-primary tracking-widest uppercase bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
            Premium AI-BOS Feature
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
          Unlock {tabName}
        </h2>
        <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
          The operation you are trying to access requires an active corporate subscription. Instantly activate a 7-day free trial or subscribe to one of our competitive pricing tiers to unlock unlimited access.
        </p>
      </div>

      {/* Pricing Quick-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        
        {/* Plan 1: Monthly */}
        <div className="p-6 bg-dark-panel/95 border border-white/5 rounded-xl flex flex-col justify-between hover:border-brand-primary/30 transition-all duration-200">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">
                Monthly Plan
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold font-display text-white">$29.99</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <ul className="space-y-2 border-t border-white/5 pt-4 text-left text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Unlimited AI Command Center pipelines</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Campaign automation & leads scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Executive Memo digests & vector exports</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleSubscribe('monthly', 'price_1Tn6AtBMbxh6jv0C7guuFzrU', 'Monthly Subscription ($29.99)')}
              disabled={loading !== null}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {loading === 'monthly' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-brand-primary" />
                  <span>Subscribe Monthly</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Plan 2: Yearly */}
        <div className="p-6 bg-dark-panel/95 border border-brand-primary/20 rounded-xl flex flex-col justify-between hover:border-brand-primary/50 transition-all duration-200 relative shadow-lg ring-1 ring-brand-primary/10">
          <div className="absolute -top-3 right-4">
            <span className="bg-amber-500 text-black text-[8px] font-extrabold font-mono uppercase tracking-widest px-2 py-0.5 rounded-full shadow">
              Save 17%
            </span>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Enterprise Value
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold font-display text-white">$299.99</span>
              <span className="text-xs text-gray-500">/ year</span>
            </div>
            <ul className="space-y-2 border-t border-white/5 pt-4 text-left text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>All monthly benefits included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Priority API quota & ultra-low latency</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Dedicated account workspace & SLA</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleSubscribe('yearly', 'price_1Tn6AtBMbxh6jv0CziPOztxO', 'Yearly Subscription ($299.99)')}
              disabled={loading !== null}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              {loading === 'yearly' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Subscribe Yearly</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Trial and Nav CTA */}
      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 border-t border-white/5 pt-6 w-full max-w-2xl justify-between text-xs">
        <div className="text-center sm:text-left">
          <p className="text-gray-400">First time trying AI-BOS?</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Unlock a fully functional 7-day trial, no credit card required.</p>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={handleActivateTrial}
              disabled={loading !== null}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-md font-mono font-bold tracking-wide transition-all uppercase text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {loading === 'trial' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Activate Free Trial</span>
              )}
            </button>
          ) : (
            <button
              onClick={onNavigateToBilling}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md font-mono font-bold tracking-wide transition-all uppercase text-[10px] flex items-center gap-1 cursor-pointer"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onNavigateToBilling}
            className="text-gray-400 hover:text-white transition-colors underline font-mono text-[10px] tracking-wide uppercase px-2 py-2"
          >
            Billing Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
