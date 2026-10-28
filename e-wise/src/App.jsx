import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Recycle, Trophy, Flame, Sparkles, ArrowRight, Sun, Moon, LogOut, 
  User, Lock, Building2, PlusCircle, LayoutDashboard, History,
  Bot, ChevronLeft, ChevronRight, Send, X, Info, Gift, ExternalLink,
  ShieldAlert, Cpu, Wrench, Tag, CheckCircle2, MapPin, Calendar, Clock,
  XCircle, UserCheck, Smartphone, Battery, Laptop, CheckCircle, HelpCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const WORKERS_BY_CITY = {
  Mumbai: [
    "Ramesh Kumar (South Mumbai Hub)",
    "Vijay Salunkhe (Andheri / Western Suburbs)",
    "Prakash Mane (Powai / Central Suburbs)"
  ],
  Delhi: [
    "Suresh Sharma (South Delhi Center)",
    "Amit Verma (Dwarka / West Delhi)",
    "Rajesh Gupta (Connaught Place Hub)"
  ],
  Bengaluru: [
    "Kiran Gowda (Koramangala Hub)",
    "Santhosh R (Whitefield Center)",
    "Manjunath K (Indiranagar Depot)"
  ]
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'dark';

  if (isLoading) {
    return <SplashLoadingScreen onComplete={() => setIsLoading(false)} isDark={isDark} />;
  }

  return (
    <Router>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        <Navbar theme={theme} setTheme={setTheme} user={user} />
        
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={
              user ? <Navigate to={user.role === 'management' ? '/admin/dashboard' : '/dashboard'} /> : <AuthPage setUser={setUser} isDark={isDark} />
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute user={user} role="recycler">
                <RecyclerLayout user={user} setUser={setUser} isDark={isDark} />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={
              <ProtectedRoute user={user} role="management">
                <AdminLayout user={user} setUser={setUser} isDark={isDark} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {user && <SmartAssistantWidget user={user} isDark={isDark} />}
      </div>
    </Router>
  );
}

// Fixed & Smoothed Splash Loading Screen
function SplashLoadingScreen({ onComplete, isDark }) {
  const [showPortalName, setShowPortalName] = useState(true);
  const [iconIndex, setIconIndex] = useState(0);

  const icons = [Smartphone, Laptop, Battery, Cpu];

  useEffect(() => {
    // Show Portal Name for 1.8 seconds first
    const portalTimer = setTimeout(() => {
      setShowPortalName(false);
    }, 1800);

    return () => clearTimeout(portalTimer);
  }, []);

  useEffect(() => {
    if (showPortalName) return;

    // Cycle through device icons without reloading the container
    const iconInterval = setInterval(() => {
      setIconIndex(prev => {
        if (prev < icons.length - 1) return prev + 1;
        clearInterval(iconInterval);
        setTimeout(onComplete, 400); // Complete loading after last icon
        return prev;
      });
    }, 700);

    return () => clearInterval(iconInterval);
  }, [showPortalName]);

  const CurrentIcon = icons[iconIndex];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
      isDark ? 'bg-black text-white' : 'bg-slate-900 text-slate-100'
    }`}>
      <div className="flex flex-col items-center space-y-6">
        
        {/* Static Title Container */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-lime-400 to-teal-300 bg-clip-text text-transparent">
            E-Wise Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Smart E-Waste Management Platform</p>
        </div>

        {/* Icon Container with Smooth Morphs */}
        <div className="w-24 h-24 rounded-3xl bg-lime-400/10 border border-lime-400/30 text-lime-400 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {showPortalName ? (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}>
                <Recycle className="w-10 h-10 animate-spin-slow" />
              </motion.div>
            ) : (
              <motion.div
                key={iconIndex}
                initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.3 }}>
                <CurrentIcon className="w-10 h-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Continuous Progress Bar */}
        <div className="w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
          <motion.div 
            className="h-full bg-lime-400"
            initial={{ width: '0%' }}
            animate={{ 
              width: showPortalName ? '35%' : `${35 + ((iconIndex + 1) / icons.length) * 65}%` 
            }}
            transition={{ ease: 'linear', duration: 0.4 }}
          />
        </div>

      </div>
    </div>
  );
}

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function Navbar({ theme, setTheme, user }) {
  const isDark = theme === 'dark';
  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur-md ${
      isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-lime-500/10 text-lime-400 border-lime-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
          }`}>
            <Recycle className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
              isDark ? 'from-lime-400 to-teal-300' : 'from-emerald-600 to-teal-700'
            }`}>E-Wise</h1>
            <p className="text-xs text-slate-400">Smart E-Waste Management</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <div className="flex items-center gap-2 border-l pl-3 border-slate-700">
              <span className="text-xs font-semibold">{user.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${
                isDark ? 'bg-lime-500/10 text-lime-400 border-lime-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthPage({ setUser, isDark }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState('recycler');
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', userId: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...loginData, role })
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
    else setError(data.error);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...signupData, role })
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
    else setError(data.error);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 perspective-1000">
      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-xl max-w-md w-full text-center">
          {error}
        </div>
      )}

      <div className={`relative w-full max-w-md transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* LOGIN CARD */}
        <div className={`w-full rounded-2xl border p-6 shadow-2xl backface-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-2xl font-bold text-center mb-1">Welcome Back</h2>
          <p className="text-xs text-slate-400 text-center mb-6">Sign in to your E-Wise account</p>

          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
            <button 
              type="button"
              onClick={() => setRole('recycler')} 
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                role === 'recycler' 
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white') 
                  : 'text-slate-400'
              }`}>
              Recycler
            </button>
            <button 
              type="button"
              onClick={() => setRole('management')} 
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                role === 'management' 
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white') 
                  : 'text-slate-400'
              }`}>
              Management
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">User ID</label>
              <input 
                type="text" required value={loginData.userId} 
                onChange={e => setLoginData({...loginData, userId: e.target.value})}
                placeholder="Enter User ID (e.g. recycler1 or admin1)"
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-lime-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                }`} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">Password</label>
              <input 
                type="password" required value={loginData.password} 
                onChange={e => setLoginData({...loginData, password: e.target.value})}
                placeholder="••••••••"
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-lime-400' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600'
                }`} 
              />
            </div>
            <button type="submit" className={`w-full font-semibold py-2.5 rounded-xl transition ${
              isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
              Login as {role === 'recycler' ? 'Recycler' : 'Management'}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <button type="button" onClick={() => setIsFlipped(true)} className={`font-semibold hover:underline ${
              isDark ? 'text-lime-400' : 'text-emerald-600'
            }`}>
              Sign up here
            </button>
          </p>
        </div>

        {/* SIGNUP CARD */}
        <div className={`w-full rounded-2xl border p-6 shadow-2xl absolute top-0 left-0 rotate-y-180 backface-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h2 className="text-2xl font-bold text-center mb-1">Create Account</h2>
          <p className="text-xs text-slate-400 text-center mb-4">Register as a {role}</p>

          <form onSubmit={handleSignup} className="space-y-3">
            <input 
              type="text" placeholder="Full Name" required value={signupData.name} 
              onChange={e => setSignupData({...signupData, name: e.target.value})}
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`} 
            />
            <input 
              type="email" placeholder="Email Address" required value={signupData.email} 
              onChange={e => setSignupData({...signupData, email: e.target.value})}
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`} 
            />
            <input 
              type="text" placeholder="Choose User ID" required value={signupData.userId} 
              onChange={e => setSignupData({...signupData, userId: e.target.value})}
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`} 
            />
            <input 
              type="password" placeholder="Password" required value={signupData.password} 
              onChange={e => setSignupData({...signupData, password: e.target.value})}
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`} 
            />
            <button type="submit" className={`w-full font-semibold py-2.5 rounded-xl transition mt-2 ${
              isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
              Create Account
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-4">
            Already registered?{' '}
            <button type="button" onClick={() => setIsFlipped(false)} className={`font-semibold hover:underline ${
              isDark ? 'text-lime-400' : 'text-emerald-600'
            }`}>
              Log in here
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

function OnboardingModal({ user, onClose, isDark }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className={`max-w-lg w-full p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="text-center mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
            isDark ? 'bg-lime-400/20 text-lime-400' : 'bg-emerald-500/20 text-emerald-600'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Welcome to E-Wise, {user.name}! 👋</h2>
          <p className="text-xs text-slate-400 mt-1">Your Portal Tour & Impact Guide:</p>
        </div>

        <div className="space-y-3 text-xs text-slate-300 my-6">
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className={`font-bold px-2 py-0.5 rounded ${isDark ? 'text-lime-400 bg-lime-400/10' : 'text-emerald-700 bg-emerald-100'}`}>1</span>
            <p><b>Schedule Pickups:</b> Submit requests in <b>Recycled Items</b> with location & condition details. Points credit once management accepts!</p>
          </div>
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className={`font-bold px-2 py-0.5 rounded ${isDark ? 'text-lime-400 bg-lime-400/10' : 'text-emerald-700 bg-emerald-100'}`}>2</span>
            <p><b>Learn & Locate:</b> Explore e-waste guidelines and active Indian collection hubs in <b>E-Waste Info</b>.</p>
          </div>
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className={`font-bold px-2 py-0.5 rounded ${isDark ? 'text-lime-400 bg-lime-400/10' : 'text-emerald-700 bg-emerald-100'}`}>3</span>
            <p><b>Claim Rewards:</b> Redeem accepted E-Points for partner discounts in <b>Claim Rewards</b>.</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className={`w-full font-bold py-2.5 rounded-xl transition ${
            isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}>
          Explore Dashboard
        </button>
      </motion.div>
    </div>
  );
}

function GuidedBanner({ title, steps, isDark }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className={`p-4 rounded-2xl border mb-6 flex justify-between items-start ${
      isDark ? 'bg-lime-950/20 border-lime-500/30 text-lime-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
    }`}>
      <div className="flex gap-3">
        <HelpCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-1">New Recycler Guide: {title}</h4>
          <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
            {steps.map((step, idx) => <li key={idx}>{step}</li>)}
          </ul>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function RecyclerLayout({ user, setUser, isDark }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); 
  const [requests, setRequests] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(user.hasSeenOnboarding === 0);

  useEffect(() => {
    fetch(`${API_BASE}/requests/${user.userId}`)
      .then(res => res.json())
      .then(data => setRequests(data));
  }, [user.userId]);

  const handleDismissOnboarding = async () => {
    await fetch(`${API_BASE}/user/onboarding-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId })
    });
    setShowOnboarding(false);
    setUser({ ...user, hasSeenOnboarding: 1 });
  };

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto">
      {showOnboarding && <OnboardingModal user={user} onClose={handleDismissOnboarding} isDark={isDark} />}

      <aside className={`border-r transition-all duration-300 p-4 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      } ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white/40'}`}>
        
        <div className="space-y-4">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl border self-end hover:bg-slate-800 transition ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('main')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'main'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Main Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveTab('recycled')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'recycled'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Recycle className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Recycled Items</span>}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'info'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Info className="w-4 h-4 shrink-0" />
              {!collapsed && <span>E-Waste Info</span>}
            </button>

            <button
              onClick={() => setActiveTab('claim')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'claim'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Gift className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Claim Rewards</span>}
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition border ${
              isDark 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
            }`}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 p-6 space-y-6">
        {activeTab === 'main' && <MainDashboardView user={user} isDark={isDark} />}
        {activeTab === 'recycled' && <RecycledItemsView user={user} setUser={setUser} requests={requests} setRequests={setRequests} isDark={isDark} />}
        {activeTab === 'info' && <InfoView isDark={isDark} />}
        {activeTab === 'claim' && <ClaimRewardsView user={user} setUser={setUser} isDark={isDark} />}
      </div>
    </div>
  );
}

function MainDashboardView({ user, isDark }) {
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border bg-gradient-to-r ${
        isDark ? 'from-slate-900 to-slate-950 border-slate-800' : 'from-emerald-50 to-teal-50 border-emerald-100'
      }`}>
        <h2 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h2>
        <p className="text-xs text-slate-400 mt-1">Your location-based pickup overview (Points are credited upon management verification):</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-slate-400">Total Points</p>
            <p className="text-xl font-bold text-amber-500">{user.points} PTS</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Sparkles className={`w-5 h-5 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`} />
          <div>
            <p className="text-xs text-slate-400">Current Level</p>
            <p className={`text-xl font-bold ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>Level {user.level}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Flame className="w-5 h-5 text-rose-500" />
          <div>
            <p className="text-xs text-slate-400">Weekly Streak</p>
            <p className="text-xl font-bold text-rose-500">{user.streak} Weeks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecycledItemsView({ user, setUser, requests, setRequests, isDark }) {
  const [brandModel, setBrandModel] = useState('');
  const [deviceType, setDeviceType] = useState('laptop');
  const [condition, setCondition] = useState('working_slow');
  const [city, setCity] = useState('Mumbai');
  const [area, setArea] = useState('Andheri West');
  
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [pickupDate, setPickupDate] = useState(availableDates[0]);

  const getAvailableTimeSlots = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const isToday = pickupDate === now.toISOString().split('T')[0];

    let slots = [
      { label: 'Morning (9 AM - 12 PM)', startHour: 9 },
      { label: 'Afternoon (12 PM - 4 PM)', startHour: 12 },
      { label: 'Evening (4 PM - 7 PM)', startHour: 16 }
    ];

    if (isToday) {
      slots = slots.filter(s => currentHour < s.startHour);
    }
    return slots.length > 0 ? slots : [{ label: 'Evening Express (6 PM - 8 PM)', startHour: 18 }];
  };

  const availableTimeSlots = getAvailableTimeSlots();
  const [timeSlot, setTimeSlot] = useState(availableTimeSlots[0].label);
  const [recommendation, setRecommendation] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    let action = 'Recycle';
    let pts = 50;

    if (condition === 'working_good') { action = 'Donate / Reuse'; pts = 120; }
    else if (condition === 'working_slow') { action = 'Repair & Upcycle'; pts = 80; }

    setRecommendation({ action, pts, device: `${brandModel} (${deviceType})` });
  };

  const handleConfirm = async () => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        device: recommendation.device,
        action: recommendation.action,
        points: recommendation.pts,
        city,
        area,
        pickupDate,
        timeSlot
      })
    });
    const data = await res.json();
    setRequests(data.requests);
    setRecommendation(null);
    setBrandModel('');
    confetti({ particleCount: 60 });
  };

  const getDeviceIcon = (type) => {
    if (type.includes('smartphone')) return <Smartphone className="w-6 h-6 text-sky-400" />;
    if (type.includes('battery')) return <Battery className="w-6 h-6 text-amber-400" />;
    return <Laptop className="w-6 h-6 text-lime-400" />;
  };

  return (
    <div className="space-y-6">
      {user.hasSeenOnboarding === 0 && (
        <GuidedBanner 
          title="Registering Your First Pickup"
          steps={[
            "Fill in Brand/Model and Condition for smart AI disposition routing.",
            "Select your City and Area locality so local hubs can assign workers.",
            "Choose a valid non-past date and slot, then click Analyze Request to review."
          ]}
          isDark={isDark}
        />
      )}

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <PlusCircle className="w-5 h-5" /> Schedule Weekly Pickup & Diagnostics
        </h3>

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Brand & Model</label>
              <input 
                type="text" required placeholder="e.g. HP Pavilion / iPhone X"
                value={brandModel} onChange={e => setBrandModel(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Device Type</label>
              <select 
                value={deviceType} onChange={e => setDeviceType(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                <option value="laptop">Laptop / PC</option>
                <option value="smartphone">Smartphone / Tablet</option>
                <option value="battery">Battery / Charger</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Current Condition / Problem Status</label>
            <select 
              value={condition} onChange={e => setCondition(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
              <option value="working_good">Fully Functional / Good Shape</option>
              <option value="working_slow">Functional with Issues (Slow/Laggy)</option>
              <option value="damaged">Damaged Screen / Hardware Failure</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
              <select 
                value={city} onChange={e => setCity(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Area / Locality</label>
              <input 
                type="text" required placeholder="e.g. Andheri West, Bandra, Koramangala"
                value={area} onChange={e => setArea(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Date (Non-Past)</label>
              <select 
                value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                {availableDates.map(dateStr => (
                  <option key={dateStr} value={dateStr}>{dateStr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Time Slot Window (Valid Only)</label>
              <select 
                value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                {availableTimeSlots.map((slot, i) => (
                  <option key={i} value={slot.label}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className={`w-full font-semibold py-2.5 rounded-xl transition ${
            isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}>
            Analyze Request
          </button>
        </form>

        {recommendation && (
          <div className={`mt-4 p-4 rounded-xl border space-y-2 ${isDark ? 'border-lime-500/30 bg-lime-950/20' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className="text-xs font-bold text-amber-500">Route: {recommendation.action} (+{recommendation.pts} PTS awarded upon admin acceptance)</p>
            <p className="text-xs text-slate-400">Pickup Location: {area}, {city} • Schedule: {pickupDate} ({timeSlot})</p>
            <button onClick={handleConfirm} className={`px-4 py-2 rounded-xl text-xs font-bold ${
              isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
            }`}>
              Confirm Schedule Request
            </button>
          </div>
        )}
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-md font-bold mb-4">Your Pickup Requests</h3>
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {getDeviceIcon(r.device)}
                </div>
                <div>
                  <p className="text-sm font-bold">{r.device} ({r.id})</p>
                  <p className="text-xs text-slate-400">Location: {r.area}, {r.city} • Slot: {r.pickupDate} ({r.timeSlot})</p>
                  
                  {r.status === 'Accepted' && (
                    <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Worker Assigned: {r.assignedWorker} (+{r.points} PTS credited)
                    </p>
                  )}
                  {r.status === 'Rejected' && (
                    <p className="text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejection Reason: {r.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                r.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoView({ isDark }) {
  const externalResources = [
    { title: "UN Global E-Waste Monitor", desc: "Official statistics and research reports on world electronic waste trends.", link: "https://ewastemonitor.info/" },
    { title: "CPCB E-Waste Guidelines", desc: "Central Pollution Control Board regulations and certified dismantler lists.", link: "https://cpcb.nic.in/e-waste/" },
    { title: "US EPA Electronics Stewardship", desc: "Learn about certified electronics recyclers and sustainable management.", link: "https://www.epa.gov/recycle/electronics-donation-and-recycling" },
    { title: "iFixit Repair Guides", desc: "Open-source repair manuals to fix electronics instead of throwing them away.", link: "https://www.ifixit.com/" }
  ];

  const serviceHubs = [
    { city: "Mumbai", areas: "Andheri, Bandra, Powai, South Mumbai", status: "Active Hub" },
    { city: "Delhi", areas: "South Delhi, Dwarka, Connaught Place", status: "Active Hub" },
    { city: "Bengaluru", areas: "Koramangala, Whitefield, Indiranagar", status: "Active Hub" }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 mb-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <Info className="w-5 h-5" /> Understanding E-Waste & Sustainability
        </h2>
        <p className="text-xs text-slate-400">
          Electronic waste is the fastest-growing solid waste stream in the world. Proper recycling prevents toxic contamination and recovers rare minerals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <ShieldAlert className="w-6 h-6 text-rose-500 mb-2" />
          <h3 className="text-sm font-bold mb-1">Hazardous Materials</h3>
          <p className="text-xs text-slate-400">Lead, mercury, and cadmium in circuit boards can leach into groundwater if dumped in landfills.</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <Cpu className={`w-6 h-6 mb-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`} />
          <h3 className="text-sm font-bold mb-1">Precious Mineral Recovery</h3>
          <p className="text-xs text-slate-400">1 ton of smartphones contains 100x more gold than 1 ton of raw gold ore.</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <Wrench className="w-6 h-6 text-amber-500 mb-2" />
          <h3 className="text-sm font-bold mb-1">Right to Repair</h3>
          <p className="text-xs text-slate-400">Extending a laptop's life by just 2 years reduces its carbon footprint by over 30%.</p>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-md font-bold mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" /> Active Service Hubs in India
        </h3>
        <p className="text-xs text-slate-400 mb-4">E-Wise currently provides direct home pickup and worker dispatch across major metropolitan hubs in India.</p>

        <div className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col items-center justify-center text-center ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full z-10">
            {serviceHubs.map((hub, i) => (
              <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-sm">{hub.city}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{hub.areas}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {hub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-md font-bold mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-amber-500" /> External E-Waste Resources & Official Portals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalResources.map((res, i) => (
            <a 
              key={i} 
              href={res.link} 
              target="_blank" 
              rel="noreferrer"
              className={`p-4 rounded-xl border transition flex justify-between items-start hover:border-amber-500/50 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  {res.title} <ExternalLink className="w-3 h-3 text-slate-500" />
                </h4>
                <p className="text-xs text-slate-400 mt-1">{res.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClaimRewardsView({ user, setUser, isDark }) {
  const [msg, setMsg] = useState('');

  const rewards = [
    { id: 1, title: '20% Off Repair Services', cost: 150, category: 'Tech Repair', icon: Wrench },
    { id: 2, title: '₹200 Eco-Store Voucher', cost: 200, category: 'Shopping', icon: Tag },
    { id: 3, title: 'Free Cable/Adapter Upgrade', cost: 300, category: 'Hardware', icon: Cpu },
    { id: 4, title: 'Sustainability Champion Badge', cost: 500, category: 'Badge', icon: Sparkles },
  ];

  const handleClaim = async (reward) => {
    if (user.points < reward.cost) {
      setMsg(`You need ${reward.cost - user.points} more E-Points to claim this voucher!`);
      return;
    }

    const res = await fetch(`${API_BASE}/claim-reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        cost: reward.cost,
        rewardTitle: reward.title
      })
    });

    const data = await res.json();
    if (res.ok) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      setUser(data.user);
      setMsg(`🎉 Voucher claimed! Code: EWise-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="space-y-6">
      {user.hasSeenOnboarding === 0 && (
        <GuidedBanner 
          title="Redeeming Vouchers"
          steps={[
            "Earn E-Points by having your pickup requests accepted by management.",
            "Choose a voucher below and click Redeem Voucher once you have enough PTS balance."
          ]}
          isDark={isDark}
        />
      )}

      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
            <Gift className="w-5 h-5" /> Redeem E-Points for Discounts
          </h2>
          <p className="text-xs text-slate-400">Convert your sustainable recycling points into partner discounts and rewards.</p>
        </div>
        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-400">Available Balance</p>
            <p className="text-lg font-bold text-amber-500">{user.points} PTS</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs rounded-xl text-center">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.map(r => {
          const IconComponent = r.icon;
          const canAfford = user.points >= r.cost;

          return (
            <div key={r.id} className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-slate-900 text-lime-400' : 'bg-slate-100 text-emerald-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{r.title}</h3>
                    <p className="text-xs text-slate-400">{r.category}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  {r.cost} PTS
                </span>
              </div>

              <button
                onClick={() => handleClaim(r)}
                disabled={!canAfford}
                className={`w-full font-bold py-2 rounded-xl text-xs transition ${
                  canAfford
                    ? (isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700')
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}>
                {canAfford ? 'Redeem Voucher' : `Needs ${r.cost - user.points} More PTS`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminLayout({ user, setUser, isDark }) {
  const [collapsed, setCollapsed] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard'); 
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    fetch(`${API_BASE}/admin/requests`)
      .then(res => res.json())
      .then(data => setRequests(data));
  };

  const acceptedCount = requests.filter(r => r.status === 'Accepted').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto">
      <aside className={`border-r transition-all duration-300 p-4 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      } ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white/40'}`}>
        
        <div className="space-y-4">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-xl border self-end hover:bg-slate-800 transition ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
            }`}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <nav className="space-y-2">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                adminTab === 'dashboard'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Admin Dashboard</span>}
            </button>

            <button
              onClick={() => setAdminTab('requests')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                adminTab === 'requests'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Building2 className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Requests Queue</span>}
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition border ${
              isDark 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
            }`}>
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 p-6 space-y-6">
        {adminTab === 'dashboard' && (
          <AdminDashboardHome user={user} requests={requests} acceptedCount={acceptedCount} rejectedCount={rejectedCount} isDark={isDark} />
        )}
        {adminTab === 'requests' && (
          <AdminRequestsView requests={requests} fetchRequests={fetchRequests} isDark={isDark} />
        )}
      </div>
    </div>
  );
}

function AdminDashboardHome({ user, requests, acceptedCount, rejectedCount, isDark }) {
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border bg-gradient-to-r ${
        isDark ? 'from-slate-900 to-slate-950 border-slate-800' : 'from-emerald-50 to-teal-50 border-emerald-100'
      }`}>
        <h2 className="text-2xl font-bold">Welcome back, {user.name} (Management) 🛡️</h2>
        <p className="text-xs text-slate-400 mt-1">Here is your live e-waste operations overview:</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs text-slate-400">Total Accepted</p>
            <p className="text-xl font-bold text-emerald-400">{acceptedCount} Requests</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <XCircle className="w-5 h-5 text-rose-500" />
          <div>
            <p className="text-xs text-slate-400">Total Rejected</p>
            <p className="text-xl font-bold text-rose-500">{rejectedCount} Requests</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <Building2 className={`w-5 h-5 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`} />
          <div>
            <p className="text-xs text-slate-400">Total Queue</p>
            <p className={`text-xl font-bold ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>{requests.length} Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRequestsView({ requests, fetchRequests, isDark }) {
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [worker, setWorker] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAccept = async (requestId) => {
    if (!worker) return alert('Please assign a field worker from that area.');

    await fetch(`${API_BASE}/admin/verify-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        status: 'Accepted',
        assignedWorker: worker
      })
    });

    setSelectedReq(null);
    setWorker('');
    fetchRequests();
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason) return alert('Please enter a reason for rejection.');

    await fetch(`${API_BASE}/admin/verify-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        status: 'Rejected',
        rejectionReason
      })
    });

    setRejectModal(null);
    setRejectionReason('');
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="text-md font-bold mb-4">Pickup Requests Management Queue (Ordered by Arrival)</h3>
        
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className="text-sm font-bold">{r.device} • <span className="text-amber-500">ID: {r.id}</span></p>
                <p className="text-xs text-slate-400">User: <b>{r.userId}</b> • Action: <b>{r.action}</b> (+{r.points} PTS)</p>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location: <b>{r.area}, {r.city}</b>
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Scheduled: <b>{r.pickupDate} ({r.timeSlot})</b>
                </p>

                {r.status === 'Accepted' && <p className="text-xs text-emerald-400 font-semibold mt-1">Assigned Worker: {r.assignedWorker}</p>}
                {r.status === 'Rejected' && <p className="text-xs text-rose-400 font-semibold mt-1">Reason: {r.rejectionReason}</p>}
              </div>

              {r.status === 'Pending Verification' ? (
                <div className="flex gap-2">
                  <button onClick={() => setSelectedReq(r)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                    isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
                  }`}>
                    Accept & Assign Worker
                  </button>
                  <button onClick={() => setRejectModal(r)} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600">
                    Reject
                  </button>
                </div>
              ) : (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  r.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {r.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-2">Accept Pickup & Allot Worker</h3>
            <p className="text-xs text-slate-400 mb-4">Location: {selectedReq.area}, {selectedReq.city}</p>

            <label className="block text-xs font-medium mb-1">Select Local Area Worker ({selectedReq.city})</label>
            <select value={worker} onChange={e => setWorker(e.target.value)} className={`w-full p-2 text-xs rounded-xl border mb-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
            }`}>
              <option value="">-- Choose Field Worker --</option>
              {(WORKERS_BY_CITY[selectedReq.city] || []).map((w, i) => (
                <option key={i} value={w}>{w}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => handleAccept(selectedReq.id)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
              }`}>
                Confirm Assignment & Credit Points
              </button>
              <button onClick={() => setSelectedReq(null)} className="px-4 py-2 border border-slate-700 text-slate-400 rounded-xl text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-2 text-rose-500">Reject Pickup Request</h3>
            <p className="text-xs text-slate-400 mb-4">Provide a reason for rejecting request {rejectModal.id}</p>

            <textarea 
              rows={3} required
              placeholder="e.g. Hazardous battery condition beyond pickup limits, invalid details provided."
              value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border mb-4 focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />

            <div className="flex gap-2">
              <button onClick={() => handleReject(rejectModal.id)} className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600">
                Confirm Rejection
              </button>
              <button onClick={() => setRejectModal(null)} className="px-4 py-2 border border-slate-700 text-slate-400 rounded-xl text-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartAssistantWidget({ user, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const isManagement = user?.role === 'management';

  const initialBotMsg = isManagement
    ? 'Hello Operations Admin! Ask me about worker assignment protocols, rejection guidelines, or verification policies.'
    : 'Hello! I am your E-Wise Smart Assistant. Ask me anything about e-waste disposal, preparation, or point rewards!';

  const [messages, setMessages] = useState([{ sender: 'bot', text: initialBotMsg }]);

  const recyclerSuggestions = [
    "What is e-waste?",
    "How to handle devices before pickup?",
    "When are points credited?",
    "What items can I recycle?"
  ];

  const managementSuggestions = [
    "Valid rejection reasons?",
    "How to assign a field worker?",
    "When are user points credited?",
    "How to check city pickup hubs?"
  ];

  const suggestions = isManagement ? managementSuggestions : recyclerSuggestions;

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');

    setTimeout(() => {
      let botReply = "I am here to guide you with your E-Wise queries!";
      const q = text.toLowerCase();

      if (isManagement) {
        if (q.includes('reject') || q.includes('reasons')) {
          botReply = "⚠️ Valid rejection reasons include: hazardous damaged battery cells, unverified non-electronic items, or invalid contact details.";
        } else if (q.includes('assign') || q.includes('worker')) {
          botReply = "👷 Click 'Accept & Assign Worker' on any pending request, then select an active field worker allocated to that city hub (Mumbai, Delhi, or Bengaluru).";
        } else if (q.includes('credited') || q.includes('points')) {
          botReply = "⭐ User points are automatically credited to their account balance as soon as you confirm worker assignment for their request!";
        } else if (q.includes('hubs') || q.includes('city')) {
          botReply = "📍 Active hubs are configured for South/West/Central zones in Mumbai, Delhi, and Bengaluru.";
        }
      } else {
        if (q.includes('what is e-waste') || q.includes('e-waste')) {
          botReply = "♻️ E-waste refers to discarded electronic devices like laptops, smartphones, chargers, and batteries that contain toxic materials as well as recyclable minerals.";
        } else if (q.includes('handle') || q.includes('prepare') || q.includes('before')) {
          botReply = "📦 Before pickup: 1. Backup and wipe personal data. 2. Remove SIM/SD cards. 3. Pack battery items safely in a sealed bag or box.";
        } else if (q.includes('credited') || q.includes('points')) {
          botReply = "⏳ Points remain pending until management verifies your request and dispatches a local area worker.";
        } else if (q.includes('items') || q.includes('recycle')) {
          botReply = "💻 We accept laptops, PCs, smartphones, tablets, lithium batteries, chargers, and peripheral cables.";
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`w-80 sm:w-96 h-[430px] rounded-2xl border shadow-2xl flex flex-col mb-4 overflow-hidden ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3 font-bold flex justify-between items-center text-xs ${isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'}`}>
              <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> {isManagement ? 'Operations Advisor' : 'E-Wise Assistant'}</span>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2.5 rounded-xl ${m.sender === 'user' ? (isDark ? 'bg-lime-400 text-black font-medium' : 'bg-emerald-600 text-white font-medium') : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800')}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-800/50 flex flex-wrap gap-1 bg-slate-900/30">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition ${
                    isDark ? 'bg-slate-900 border-slate-700 text-lime-400 hover:bg-slate-800' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}>
                  {sug}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-2 border-t border-slate-800 flex gap-2">
              <input type="text" placeholder="Ask a question..." value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
              <button type="submit" className={`p-2 rounded-xl ${isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'}`}><Send className="w-3.5 h-3.5" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-2xl ${isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'}`}>
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
}