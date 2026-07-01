import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  updatePassword, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  CreditCard, 
  Check, 
  Lock, 
  Mail, 
  User as UserIcon, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  KeyRound, 
  Sparkles, 
  Clock, 
  Coins,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';

export default function SubscriptionHub() {
  const { addToast } = useNotifications();
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{ plan: string; name: string; email?: string; subscriptionStatus?: string; planType?: string; joinedAt: string } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // View/Form states: 'plans' | 'signup' | 'signin' | 'forgot' | 'profile'
  const [currentView, setCurrentView] = useState<'plans' | 'signup' | 'signin' | 'forgot' | 'profile'>('plans');
  const [selectedPendingPlan, setSelectedPendingPlan] = useState<string | null>(null);

  // Sign Up Form Fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Sign In Form Fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);

  // Reset / Forgot Password Form Fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Direct Change Password Fields (when logged in)
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Stripe config states with defaults matching instructions
  const [stripeConfigured, setStripeConfigured] = useState<boolean>(false);
  const [monthlyPriceId, setMonthlyPriceId] = useState<string>('price_1Tn6AtBMbxh6jv0C7guuFzrU');
  const [monthlyPlanName, setMonthlyPlanName] = useState<string>('AI-BOS Monthly Subscription');
  const [monthlyPlanPrice, setMonthlyPlanPrice] = useState<string>('$29.99/month');
  const [yearlyPriceId, setYearlyPriceId] = useState<string>('price_1Tn6AtBMbxh6jv0CziPOztxO');
  const [yearlyPlanName, setYearlyPlanName] = useState<string>('AI-BOS Annual Subscription');
  const [yearlyPlanPrice, setYearlyPlanPrice] = useState<string>('$299.99/year');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState<boolean>(false);
  const [dismissedRenewalAlert, setDismissedRenewalAlert] = useState<boolean>(false);

  // Fetch configuration on component mount
  useEffect(() => {
    fetch('/api/stripe/config')
      .then(res => res.json())
      .then(data => {
        setStripeConfigured(data.stripeConfigured);
        setMonthlyPriceId(data.STRIPE_PRICE_ID_KEY_MONTHLY);
        setMonthlyPlanName(data.PLAN_MONTHLY_NAME);
        setMonthlyPlanPrice(data.PLAN_MONTHLY_PRICE);
        setYearlyPriceId(data.STRIPE_PRICE_ID_KEY_YEARLY);
        setYearlyPlanName(data.PLAN_YEARLY_NAME);
        setYearlyPlanPrice(data.PLAN_YEARLY_PRICE);
      })
      .catch(err => {
        console.error('Error fetching Stripe configuration:', err);
      });
  }, []);

  // Check for successful checkout session redirection from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const planFromUrl = params.get('plan');
    
    if (sessionId && planFromUrl && user) {
      if (sessionId.startsWith('cs_test_simulated_') || sessionId !== 'cancelled') {
        const updatePlanInFirestore = async () => {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              plan: planFromUrl
            });
            addToast(`Successfully subscribed to ${planFromUrl}!`, 'success', 5000);
            
            // Clean up URL parameters so they don't keep triggers
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
          } catch (e) {
            console.error('Error updating user plan from Stripe checkout:', e);
          }
        };
        updatePlanInFirestore();
      }
    }
  }, [user]);

  // Track Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user profile from Firestore to check selected plan
        const docRef = doc(db, 'users', currentUser.uid);
        const unsubProfile = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as any);
          } else {
            // Create user profile document if it doesn't exist
            const initialProfile = {
              name: currentUser.displayName || 'Enterprise User',
              email: currentUser.email || '',
              plan: 'None',
              joinedAt: new Date().toISOString()
            };
            setDoc(doc(db, 'users', currentUser.uid), initialProfile)
              .then(() => setUserProfile(initialProfile))
              .catch(err => console.error("Error creating user profile:", err));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        return () => unsubProfile();
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Free Trial Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) {
      addToast('Please fill in all sign-up fields.', 'warn', 2500);
      return;
    }
    if (signupPassword.length < 6) {
      addToast('Password must be at least 6 characters long.', 'warn', 3000);
      return;
    }

    setSignupLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(userCredential.user, { displayName: signupName });
      
      const profileData = {
        name: signupName,
        email: signupEmail,
        plan: selectedPendingPlan || 'Free Trial',
        joinedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), profileData);
      
      addToast(`Account created! Welcome to CRM Orchestrator, ${signupName}.`, 'success', 3500);
      
      // If plan selection was pending, complete it
      if (selectedPendingPlan) {
        addToast(`Activated plan: ${selectedPendingPlan}!`, 'success', 3000);
      } else {
        addToast('Activated plan: Free Trial!', 'success', 3000);
      }
      
      // Clean up fields
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSelectedPendingPlan(null);
      setCurrentView('plans');
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      addToast(errorMsg, 'error', 3500);
    } finally {
      setSignupLoading(false);
    }
  };

  // Handle User Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinEmail || !signinPassword) {
      addToast('Please enter your email and password.', 'warn', 2500);
      return;
    }

    setSigninLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, signinEmail, signinPassword);
      addToast(`Successfully signed in as ${userCredential.user.displayName || userCredential.user.email}.`, 'success', 3000);
      
      if (selectedPendingPlan) {
        // Apply pending plan to logged-in user
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          plan: selectedPendingPlan
        });
        addToast(`Activated plan: ${selectedPendingPlan}!`, 'success', 3000);
        setSelectedPendingPlan(null);
      }
      
      setSigninEmail('');
      setSigninPassword('');
      setCurrentView('plans');
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password.';
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = 'No user found with this email.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      addToast(errorMsg, 'error', 3500);
    } finally {
      setSigninLoading(false);
    }
  };

  // Handle Password Reset Email Request (Forgot Password)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      addToast('Please enter your email address.', 'warn', 2500);
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      addToast(`Password reset link sent to ${resetEmail}. Check your inbox!`, 'success', 4000);
      setResetEmail('');
      setCurrentView('signin');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to send password reset email.', 'error', 3500);
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Direct Password Update (when user is logged in)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('You must be logged in to change your password.', 'error', 3000);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'warn', 3000);
      return;
    }

    setChangePasswordLoading(true);
    try {
      await updatePassword(user, newPassword);
      addToast('Your password has been changed successfully.', 'success', 3500);
      setNewPassword('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        addToast('Please sign out and sign back in to change your password for security.', 'warn', 4000);
      } else {
        addToast(err.message || 'Failed to change password.', 'error', 3500);
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Handle User Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      addToast('Signed out successfully.', 'info', 2000);
      setCurrentView('plans');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to sign out.', 'error', 2500);
    }
  };

  // Handle selecting / purchasing a plan via Stripe Checkout Session
  const selectPlan = async (planName: string, priceId?: string) => {
    if (!user) {
      // If user is not logged in, prompt them to Sign Up or Sign In
      setSelectedPendingPlan(planName);
      if (planName === 'Free Trial') {
        setCurrentView('signup');
        addToast('Please Sign Up with your name, email, and password to start your Free Trial.', 'info', 3500);
      } else {
        setCurrentView('signin');
        addToast(`Please Sign In or Sign Up to purchase the ${planName} Plan.`, 'info', 3500);
      }
      return;
    }

    if (planName === 'Free Trial') {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          plan: 'Free Trial'
        });
        addToast('Activated plan: Free Trial!', 'success', 3000);
      } catch (err: any) {
        console.error(err);
        addToast('Failed to update subscription tier.', 'error', 3000);
      }
      return;
    }

    // Purchase via Stripe checkout (or simulated checkout)
    setCheckoutLoading(planName);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          email: user.email,
          planName: planName
        })
      });
      const data = await response.json();
      if (data.success && data.url) {
        if (data.simulated) {
          addToast('Stripe configuration is in simulated mode. Redirecting to sandbox success hook...', 'info', 3000);
        } else {
          addToast('Redirecting to secure Stripe subscription checkout portal...', 'success', 3000);
        }
        
        // Wait a small moment and redirect
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      } else {
        addToast(data.error || 'Failed to initiate checkout session.', 'error', 3000);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Error contacting Stripe checkout gateway.', 'error', 3000);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      addToast('Please sign in to manage your subscription.', 'warn', 3000);
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await response.json();
      if (data.success && data.url) {
        if (data.simulated) {
          addToast('Opening simulated Stripe Customer Billing Portal...', 'info', 2500);
          setTimeout(() => {
            addToast('Billing simulation: This would redirect to the Stripe Customer Portal where users update cards, download invoices, or cancel plans.', 'success', 6000);
            setPortalLoading(false);
          }, 1500);
        } else {
          addToast('Redirecting to Stripe Customer Portal...', 'success', 2500);
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      } else {
        addToast(data.error || 'Failed to generate Customer Portal session.', 'error', 3000);
        setPortalLoading(false);
      }
    } catch (err) {
      console.error('Error generating portal session:', err);
      addToast('Error contacting subscription management gateway.', 'error', 3000);
      setPortalLoading(false);
    }
  };

  const getPlanTier = () => {
    if (!user) return 'Free';
    if (!userProfile || !userProfile.plan) return 'Free';
    const plan = userProfile.plan.toLowerCase();
    if (plan.includes('annual') || plan.includes('year') || plan.includes('299')) return 'Yearly';
    if (plan.includes('month') || plan.includes('29.99')) return 'Monthly';
    if (plan.includes('trial') || plan === 'none' || plan === '') {
      const joinedAt = userProfile.joinedAt;
      if (joinedAt) {
        const joinedTime = new Date(joinedAt).getTime();
        const trialLengthMs = 7 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        if (now > (joinedTime + trialLengthMs)) {
          return 'Trial Expired';
        }
      }
      return 'Free Trial';
    }
    return 'Free';
  };

  const renderPlanTierBadge = () => {
    const tier = getPlanTier();
    let bg = 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    if (tier === 'Free Trial') bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (tier === 'Monthly') bg = 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-bold';
    if (tier === 'Yearly') bg = 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold';
    if (tier === 'Trial Expired') bg = 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold animate-pulse';
    
    return (
      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${bg} tracking-wider`}>
        {tier}
      </span>
    );
  };

  const renderTrialExpirationWarning = () => {
    if (!user || !userProfile) return null;
    
    const tier = getPlanTier();
    if (tier !== 'Free Trial' && tier !== 'Trial Expired') return null;
    
    const joinedAt = userProfile.joinedAt;
    if (!joinedAt) return null;
    
    const joinedTime = new Date(joinedAt).getTime();
    const trialLengthMs = 7 * 24 * 60 * 60 * 1000;
    const trialEndTime = joinedTime + trialLengthMs;
    const now = new Date().getTime();
    
    const timeLeftMs = trialEndTime - now;
    if (timeLeftMs <= 0) {
      return (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                Your 7-Day Free Trial Has Expired
              </h4>
              <p className="text-[11px] text-gray-300 mt-1">
                Your trial access ended on <span className="text-white font-mono font-bold">{new Date(trialEndTime).toLocaleDateString()}</span>.
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                To regain immediate full access to all features of the AI-POWERED BUSINESS OPERATING SYSTEM, please select a subscription plan below.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    const daysLeft = Math.ceil(timeLeftMs / (24 * 60 * 60 * 1000));
    const exactDays = Math.floor(timeLeftMs / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor((timeLeftMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    const isUrgent = daysLeft <= 3;
    
    let borderClass = isUrgent ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/5';
    let textClass = isUrgent ? 'text-amber-400' : 'text-emerald-400';
    let badgeClass = isUrgent ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-300';
    
    return (
      <div className={`p-4 ${borderClass} rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 ${isUrgent ? 'bg-amber-500/10' : 'bg-emerald-500/10'} ${textClass} rounded-lg`}>
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className={`text-xs font-bold ${textClass} uppercase tracking-wider font-mono flex items-center gap-1.5`}>
              <span>Free Trial Active</span>
              <span className={`${badgeClass} text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-normal`}>
                {exactDays > 0 ? `${exactDays}d ${hoursLeft}h left` : `${hoursLeft}h left`}
              </span>
            </h4>
            <p className="text-[11px] text-gray-300 mt-1">
              You are currently on the <span className="text-white font-bold">7-Day Free Trial</span>. You have full access to all platform features until <span className="text-white font-mono font-bold">{new Date(trialEndTime).toLocaleDateString()}</span>.
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Select one of our premium plans below to seamlessly transition after your trial expires. You won't be charged until the trial period is over.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderRenewalWarning = () => {
    if (!user || !userProfile || dismissedRenewalAlert) return null;
    
    const tier = getPlanTier();
    // Only warn for paid plans (Monthly or Yearly)
    if (tier !== 'Monthly' && tier !== 'Yearly') return null;

    // Current local time: 2026-06-28. Renewal is July 1st, 2026 (3 days away).
    const renewalDateStr = 'July 1, 2026';

    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg mt-0.5 sm:mt-0">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>Subscription Auto-Renewal Notice</span>
              <span className="bg-amber-500/20 text-amber-300 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold tracking-normal animate-pulse">
                In 3 Days
              </span>
            </h4>
            <p className="text-[11px] text-gray-300 mt-1">
              Your <span className="text-white font-bold">{tier}</span> subscription is scheduled to auto-renew on <span className="text-amber-300 font-mono font-bold">{renewalDateStr}</span>.
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Your saved payment method will be charged. If you need to update billing info, change plans, or cancel auto-renew, you can do so instantly via the portal.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="bg-amber-500 hover:bg-amber-600 text-dark-bg border border-amber-500/10 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            {portalLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CreditCard className="w-3.5 h-3.5" />
            )}
            <span>Manage Payment</span>
          </button>
          <button
            onClick={() => setDismissedRenewalAlert(true)}
            className="bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 px-2 py-1.5 rounded text-[10px] font-mono transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-dark-card border border-white/5 rounded-lg">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
        <p className="text-xs font-mono text-gray-400">Loading Subscription & Authentication status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Dashboard Info */}
      <div className="bg-dark-card p-5 rounded-lg border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded">
              <CreditCard className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Subscription & Access Control</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 leading-normal">
            Manage your corporate workspace access, activate premium models, and easily update security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Logged in as:</p>
                <div className="flex items-center gap-2 justify-end">
                  {renderPlanTierBadge()}
                  <p className="text-xs font-bold text-white font-mono">{user.displayName || user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('profile')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>My Profile / Password</span>
              </button>
              <button
                onClick={handleSignOut}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('signin')}
                className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setCurrentView('signup')}
                className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Trial / Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Section view switcher */}

      {/* VIEW: PLANS */}
      {currentView === 'plans' && (
        <div className="space-y-6">
          {/* Active subscription status if logged in */}
          {user && userProfile && (
            <div className="p-4 bg-emerald-950/15 border border-emerald-500/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Workspace Plan</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Tier: <span className="text-emerald-400 font-bold font-mono">{userProfile.plan || 'Free Trial'}</span> | Registered to: <span className="text-white font-mono font-medium">{userProfile.email}</span>
                  </p>
                  {(userProfile.subscriptionStatus || userProfile.planType) && (
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                      Status: <span className="text-emerald-400 font-bold uppercase">{userProfile.subscriptionStatus || 'active'}</span> | Billing Cycle: <span className="text-purple-400 font-bold uppercase">{userProfile.planType || 'monthly'}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="bg-brand-primary hover:bg-brand-hover text-white border border-brand-primary/20 px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  {portalLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5" />
                  )}
                  <span>Manage Subscription</span>
                </button>
                <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1.5 rounded uppercase">
                  Unlimited Access
                </span>
              </div>
            </div>
          )}

          {renderRenewalWarning()}
          {renderTrialExpirationWarning()}

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Free Trial */}
            <div className={`p-6 rounded-lg border flex flex-col justify-between transition-all duration-200 bg-dark-card hover:border-blue-500/30 ${
              userProfile?.plan === 'Free Trial' ? 'border-brand-primary shadow-lg ring-1 ring-brand-primary/25' : 'border-white/5'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 font-bold uppercase tracking-wider">
                    Risk Free
                  </span>
                  {userProfile?.plan === 'Free Trial' && (
                    <span className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> CURRENT PLAN
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white font-display">7-Day Free Trial</h3>
                <p className="text-[11px] text-gray-400 mt-1">Full-featured sandbox access for testing executive intelligence.</p>
                
                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-display text-white">$0.00</span>
                  <span className="text-[10px] text-gray-500">/ 7 days</span>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Access to AI Command Center</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Local pipeline operations & Kanban</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>Basic telemetry & live logs</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => selectPlan('Free Trial')}
                  className={`w-full py-2 rounded text-[10px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                    userProfile?.plan === 'Free Trial'
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {userProfile?.plan === 'Free Trial' ? 'Active Trial' : 'Sign Up Free Trial'}
                </button>
              </div>
            </div>

            {/* Card 2: Monthly Subscription */}
            <div className={`p-6 rounded-lg border flex flex-col justify-between transition-all duration-200 bg-dark-card hover:border-brand-primary/50 relative ${
              userProfile?.plan === 'Monthly Subscription ($29.99)' ? 'border-brand-primary shadow-lg ring-1 ring-brand-primary/30' : 'border-white/5'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20 font-bold uppercase tracking-wider">
                    Flexible Billing
                  </span>
                  {userProfile?.plan === 'Monthly Subscription ($29.99)' && (
                    <span className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> CURRENT PLAN
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white font-display">Monthly Subscription</h3>
                <p className="text-[11px] text-gray-400 mt-1">Perfect for fast-paced operational tuning & dynamic campaign design.</p>
                
                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-display text-white">$29.99</span>
                  <span className="text-[10px] text-gray-500">/ month</span>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Unlimited AI Orchestrator Pipelines</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Executive Memo generation & vector PDF</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Real-time sync and team audit rules</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="monthly-subscription-btn"
                  onClick={() => selectPlan('Monthly Subscription ($29.99)')}
                  className={`w-full py-2 rounded text-[10px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                    userProfile?.plan === 'Monthly Subscription ($29.99)'
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-brand-primary hover:bg-brand-hover text-white border border-brand-primary/20'
                  }`}
                >
                  {userProfile?.plan === 'Monthly Subscription ($29.99)' ? 'Active Plan' : 'Subscribe Monthly'}
                </button>
              </div>
            </div>

            {/* Card 3: Yearly Subscription */}
            <div className={`p-6 rounded-lg border flex flex-col justify-between transition-all duration-200 bg-dark-card hover:border-amber-500/50 relative ${
              userProfile?.plan === 'Yearly Subscription ($299.99)' ? 'border-amber-500 shadow-lg ring-1 ring-amber-500/30' : 'border-white/5'
            }`}>
              <div className="absolute -top-3 right-6">
                <span className="bg-amber-500 text-black text-[8px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md">
                  Best Value (Save 17%)
                </span>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold uppercase tracking-wider">
                    Enterprise
                  </span>
                  {userProfile?.plan === 'Yearly Subscription ($299.99)' && (
                    <span className="text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> CURRENT PLAN
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white font-display">Yearly Subscription</h3>
                <p className="text-[11px] text-gray-400 mt-1">Full strategic enterprise command for scale & high efficiency.</p>
                
                <div className="my-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-display text-white">$299.99</span>
                  <span className="text-[10px] text-gray-500">/ year</span>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>All Monthly tier benefits included</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Prioritized API processing & low latency</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-gray-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Dedicated technical account officer RAG setup</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  id="yearly-subscription-btn"
                  onClick={() => selectPlan('Yearly Subscription ($299.99)')}
                  className={`w-full py-2 rounded text-[10px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                    userProfile?.plan === 'Yearly Subscription ($299.99)'
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-600 text-black font-extrabold border border-amber-500/20'
                  }`}
                >
                  {userProfile?.plan === 'Yearly Subscription ($299.99)' ? 'Active Plan' : 'Subscribe Yearly'}
                </button>
              </div>
            </div>

          </div>

          {/* Verification Warning for first time email auth */}
          <div className="p-4 bg-white/5 border border-white/5 rounded-lg text-xs leading-relaxed text-gray-400">
            <h4 className="font-bold text-gray-200 font-mono mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Developer Sandbox Setup Notice
            </h4>
            Since we utilize live Firebase Authentication for email/password profiles, please ensure that "Email/Password" is enabled under the "Sign-in method" in your Firebase console. To reset or change passwords easily, you can use our direct change password input or trigger the reset password link below.
          </div>
        </div>
      )}

      {/* VIEW: SIGN UP (Free Trial / Register) */}
      {currentView === 'signup' && (
        <div className="max-w-md mx-auto bg-dark-card border border-white/5 p-6 rounded-lg space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">Create Your Enterprise Account</h3>
            <p className="text-xs text-gray-400 mt-1">
              {selectedPendingPlan 
                ? `Sign up to complete your subscription to: ${selectedPendingPlan}` 
                : 'Start your risk-free 14-day Free Trial instantly.'}
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Full Name</span>
              </label>
              <input
                id="signup-name"
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                id="signup-email"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="jane.doe@enterprise.com"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Secure Password</span>
              </label>
              <input
                id="signup-password"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-[9px] text-gray-500 mt-1">Must be at least 6 characters long.</p>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={signupLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {signupLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account & Start</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-[11px] text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentView('signin')}
                className="text-blue-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
            <button
              onClick={() => setCurrentView('plans')}
              className="text-gray-500 hover:text-gray-300 text-[10px] mt-2 underline block mx-auto font-mono"
            >
              Back to Pricing Overview
            </button>
          </div>
        </div>
      )}

      {/* VIEW: SIGN IN */}
      {currentView === 'signin' && (
        <div className="max-w-md mx-auto bg-dark-card border border-white/5 p-6 rounded-lg space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">Sign In to Workspace</h3>
            <p className="text-xs text-gray-400 mt-1">Access your persistent operational databases & dashboards.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                id="signin-email"
                type="email"
                value={signinEmail}
                onChange={(e) => setSigninEmail(e.target.value)}
                placeholder="jane.doe@enterprise.com"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Password</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="text-[9px] font-mono text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="signin-password"
                type="password"
                value={signinPassword}
                onChange={(e) => setSigninPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              id="signin-submit-btn"
              type="submit"
              disabled={signinLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {signinLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-[11px] text-gray-400">
              New to CRM Orchestrator?{' '}
              <button
                onClick={() => setCurrentView('signup')}
                className="text-blue-400 hover:underline font-bold"
              >
                Sign Up / Register Free Trial
              </button>
            </p>
            <button
              onClick={() => setCurrentView('plans')}
              className="text-gray-500 hover:text-gray-300 text-[10px] mt-2 underline block mx-auto font-mono"
            >
              Back to Pricing Overview
            </button>
          </div>
        </div>
      )}

      {/* VIEW: FORGOT PASSWORD / RESET EMAIL */}
      {currentView === 'forgot' && (
        <div className="max-w-md mx-auto bg-dark-card border border-white/5 p-6 rounded-lg space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">Recover Your Password</h3>
            <p className="text-xs text-gray-400 mt-1">We will send a high-fidelity password reset instructions link to your email.</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="jane.doe@enterprise.com"
                className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={resetLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {resetLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span>Send Password Reset Email</span>
              )}
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center">
            <button
              onClick={() => setCurrentView('signin')}
              className="text-blue-400 hover:underline font-bold text-xs"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* VIEW: USER PROFILE / LOGGED IN PANEL */}
      {currentView === 'profile' && user && (
        <div className="space-y-6">
          {renderRenewalWarning()}
          {renderTrialExpirationWarning()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Account Profile Details */}
          <div className="bg-dark-card border border-white/5 p-6 rounded-lg space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Workspace Profile Info</span>
            </h3>

            <div className="space-y-3.5 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Display Name:</span>
                <span className="text-white font-mono font-medium">{user.displayName || 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Email Address:</span>
                <span className="text-white font-mono font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Account ID:</span>
                <span className="text-gray-500 font-mono text-[10px] truncate max-w-[180px]">{user.uid}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Current Plan Tier:</span>
                <div className="flex items-center gap-1.5">
                  {renderPlanTierBadge()}
                  <span className="text-emerald-400 font-mono font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                    {userProfile?.plan || 'Free Trial'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Account Established:</span>
                <span className="text-gray-400 font-mono text-[10.5px]">
                  {userProfile?.joinedAt 
                    ? new Date(userProfile.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
                    : 'Today'}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                {portalLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>Manage Payment & Plan</span>
              </button>
              
              <button
                onClick={() => setCurrentView('plans')}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View All Pricing Plans</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-dark-card border border-white/5 p-6 rounded-lg space-y-4">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Change Security Password</span>
            </h3>
            <p className="text-xs text-gray-400">
              Directly and securely update your password. Must be at least 6 characters.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>New Password</span>
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password"
                  className="w-full bg-dark-bg/60 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                id="update-password-submit-btn"
                type="submit"
                disabled={changePasswordLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs font-mono font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {changePasswordLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply New Password</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-3 bg-white/5 border border-white/5 rounded text-[10.5px] leading-relaxed text-gray-400 space-y-1.5">
              <p className="font-bold text-gray-300">Need to reset your password via email?</p>
              <p>You can trigger a verified password recovery email to your registered inbox <strong className="text-white">{user.email}</strong> by clicking the button below.</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await sendPasswordResetEmail(auth, user.email!);
                    addToast(`Password reset link sent to ${user.email}. Check your inbox!`, 'success', 4000);
                  } catch (err: any) {
                    addToast(err.message || 'Failed to send password reset email.', 'error', 3000);
                  }
                }}
                className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1 font-bold mt-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Reset Link to {user.email}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      )}

    </div>
  );
}
