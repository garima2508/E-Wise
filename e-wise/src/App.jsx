import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Recycle, Trophy, Flame, Sparkles, Sun, Moon, LogOut, 
  Building2, PlusCircle, LayoutDashboard, Bot, ChevronLeft, 
  ChevronRight, Send, X, Info, Gift, ExternalLink,
  Cpu, Wrench, Tag, MapPin, XCircle, Smartphone, Battery, 
  Laptop, CheckCircle, HelpCircle, Bell, Camera, Leaf, 
  Droplets, Truck, QrCode, ShoppingCart, Download, Trash2, History,
  ArrowRight, ShieldCheck, Award, Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const AREAS_BY_CITY = {
  Mumbai: ['Andheri West', 'Bandra West', 'Powai', 'South Mumbai', 'Juhu', 'Thane West'],
  Delhi: ['South Delhi (Saket / GK)', 'Dwarka', 'Connaught Place', 'Rohini', 'Lajpat Nagar', 'Vasant Kunj'],
  Bengaluru: ['Koramangala', 'Whitefield', 'Indiranagar', 'Electronic City', 'Jayanagar', 'HSR Layout']
};

const WORKERS_BY_CITY = {
  Mumbai: [
    { name: "Ramesh Kumar (South Mumbai Hub)", keywords: ["south", "colaba", "dadar"] },
    { name: "Vijay Salunkhe (Andheri / Bandra West Hub)", keywords: ["andheri", "bandra", "juhu", "west"] },
    { name: "Prakash Mane (Powai / Thane Central Hub)", keywords: ["powai", "thane", "kurla", "central"] }
  ],
  Delhi: [
    { name: "Suresh Sharma (South Delhi / Saket / Lajpat Hub)", keywords: ["south", "saket", "gk", "lajpat", "vasant"] },
    { name: "Amit Verma (Dwarka / West Delhi Hub)", keywords: ["dwarka", "janakpuri", "west"] },
    { name: "Rajesh Gupta (Connaught Place / Central Hub)", keywords: ["connaught", "karol", "central"] },
    { name: "Deepak Yadav (Rohini / North Delhi Hub)", keywords: ["rohini", "pitampura", "north"] }
  ],
  Bengaluru: [
    { name: "Kiran Gowda (Koramangala / HSR / Jayanagar Hub)", keywords: ["koramangala", "hsr", "jayanagar", "btm"] },
    { name: "Santhosh R (Whitefield / Marathahalli East Hub)", keywords: ["whitefield", "marathahalli", "east"] },
    { name: "Manjunath K (Indiranagar / MG Road Central Hub)", keywords: ["indiranagar", "mg road", "domlur"] },
    { name: "Praveen Nair (Electronic City South Hub)", keywords: ["electronic", "bommanahalli"] }
  ]
};

function getBestWorkerForArea(city, area) {
  const cityWorkers = WORKERS_BY_CITY[city] || [];
  if (cityWorkers.length === 0) return "";
  const lowerArea = (area || "").toLowerCase();
  const exactMatch = cityWorkers.find(w => 
    w.keywords.some(kw => lowerArea.includes(kw))
  );
  return exactMatch ? exactMatch.name : cityWorkers[0].name;
}

function buildStageNotifications(requestsList, existingNotifications = []) {
  const map = new Map(existingNotifications.map(n => [n.stageKey, n]));

  requestsList.forEach(r => {
    const key1 = `${r.id}-stage1`;
    if (!map.has(key1)) {
      map.set(key1, {
        stageKey: key1,
        title: `Stage 1 • Request Received (${r.id})`,
        desc: `${r.devices} scheduled for ${r.pickupDate} (${r.area}).`,
        status: 'Pending Verification',
        unread: true
      });
    }

    if (r.status === 'Rejected') {
      const keyRej = `${r.id}-rejected`;
      if (!map.has(keyRej)) {
        map.set(keyRej, {
          stageKey: keyRej,
          title: `Request Rejected (${r.id})`,
          desc: `${r.devices} • Reason: ${r.rejectionReason}`,
          status: 'Rejected',
          unread: true
        });
      }
    }

    if (r.status === 'Accepted') {
      const key2 = `${r.id}-stage2`;
      if (!map.has(key2)) {
        map.set(key2, {
          stageKey: key2,
          title: `Stage 2 • Worker Dispatched (${r.id})`,
          desc: `${r.assignedWorker} assigned for ${r.devices}.`,
          status: 'Accepted',
          unread: true
        });
      }
    }

    if (r.status === 'Accepted' && r.verifiedByQR === 1) {
      const key3 = `${r.id}-stage3`;
      if (!map.has(key3)) {
        map.set(key3, {
          stageKey: key3,
          title: `Stage 3 • QR Verified (${r.id})`,
          desc: `Field pickup confirmed for ${r.devices}.`,
          status: 'Accepted',
          unread: true
        });
      }

      const key4 = `${r.id}-stage4`;
      if (!map.has(key4)) {
        map.set(key4, {
          stageKey: key4,
          title: `Stage 4 • +${r.points} PTS Credited (${r.id})`,
          desc: `Rewards unlocked for ${r.devices}!`,
          status: 'Accepted',
          unread: true
        });
      }
    }
  });

  return Array.from(map.values()).reverse();
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (user && user.role === 'recycler') {
      fetch(`${API_BASE}/requests/${user.userId}`)
        .then(res => res.json())
        .then(data => {
          setNotifications(prev => buildStageNotifications(data, prev));
        });
    } else {
      setNotifications([]);
    }
  }, [user]);

  if (isLoading) {
    return <SplashLoadingScreen onComplete={() => setIsLoading(false)} isDark={isDark} />;
  }

  return (
    <Router>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-black text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}>
        <Navbar 
          theme={theme} 
          setTheme={setTheme} 
          user={user} 
          notifications={notifications}
          setNotifications={setNotifications}
          setUser={setUser}
        />
        
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={
              user ? <Navigate to={user.role === 'management' ? '/admin/dashboard' : '/dashboard'} /> : <PublicLandingPage isDark={isDark} />
            } />
            <Route path="/login" element={
              user ? <Navigate to={user.role === 'management' ? '/admin/dashboard' : '/dashboard'} /> : <AuthPage setUser={setUser} isDark={isDark} />
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute user={user} role="recycler">
                <RecyclerLayout user={user} setUser={setUser} isDark={isDark} setNotifications={setNotifications} />
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

function SplashLoadingScreen({ onComplete, isDark }) {
  const [showPortalName, setShowPortalName] = useState(true);
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [Smartphone, Laptop, Battery, Cpu];

  useEffect(() => {
    const portalTimer = setTimeout(() => setShowPortalName(false), 1800);
    return () => clearTimeout(portalTimer);
  }, []);

  useEffect(() => {
    if (showPortalName) return;
    const iconInterval = setInterval(() => {
      setIconIndex(prev => {
        if (prev < icons.length - 1) return prev + 1;
        clearInterval(iconInterval);
        setTimeout(onComplete, 400);
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
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-lime-400 to-teal-300 bg-clip-text text-transparent">
            E-Wise Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Smart E-Waste Management Platform</p>
        </div>

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
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
}

function Navbar({ theme, setTheme, user, notifications, setNotifications, setUser }) {
  const isDark = theme === 'dark';
  const [bellOpen, setBellOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

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
          {user && user.role === 'recycler' && (
            <div className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className={`p-2 rounded-xl border relative ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-3 z-50 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold">All Stage Notifications ({notifications.length})</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-lime-400 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className={`p-2.5 rounded-xl border text-xs ${
                            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}>
                            <p className={`font-bold ${
                              n.status === 'Accepted' ? 'text-emerald-400' :
                              n.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400'
                            }`}>{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              onClick={() => setUser(null)}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition border ${
                isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-md ${
                isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// Public Landing / About Info Page for Visitors
function PublicLandingPage({ isDark }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-6xl mx-auto space-y-12 my-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
          isDark ? 'bg-lime-400/10 text-lime-400 border-lime-400/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          🌱 Sustainable E-Waste Management Platform
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Turn Old Electronics into <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
            isDark ? 'from-lime-400 to-teal-300' : 'from-emerald-600 to-teal-700'
          }`}>Eco Rewards</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          E-Wise connects conscious recyclers with municipal hubs across Mumbai, Delhi, and Bengaluru. Schedule pickups, verify via secure QR codes, track environmental impact, and earn redeemable eco-points.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl ${
              isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
            Let's Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Multi-Device Cart</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Consolidate your old laptops, smartphones, batteries, and chargers into a single batch pickup request with photo condition uploads.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Secure QR Verification</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Field workers scan your unique request QR code upon arrival at your doorstep to instantly verify pickup and release reward points.
          </p>
        </div>

        <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold">Leaderboards & Rewards</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Compete on regional recycler leaderboards across metropolitan hubs and convert your earned E-Points into partner discounts and eco-vouchers.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ setUser, isDark }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [role, setRole] = useState('recycler');
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', userId: '', password: '', city: 'Mumbai' });

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setLoginData({ userId: '', password: '' });
    setError('');
  };

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
    <div className="flex-1 flex flex-col items-center justify-center p-4 perspective-1000 my-8">
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
              onClick={() => handleRoleSwitch('recycler')} 
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                role === 'recycler' 
                  ? (isDark ? 'bg-lime-400 text-black shadow-lg' : 'bg-emerald-600 text-white shadow-lg') 
                  : 'text-slate-400 hover:text-white'
              }`}>
              Recycler
            </button>
            <button 
              type="button"
              onClick={() => handleRoleSwitch('management')} 
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                role === 'management' 
                  ? (isDark ? 'bg-lime-400 text-black shadow-lg' : 'bg-emerald-600 text-white shadow-lg') 
                  : 'text-slate-400 hover:text-white'
              }`}>
              Management
            </button>
          </div>

          <motion.form 
            key={role}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleLogin} 
            className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">User ID</label>
              <input 
                type="text" required value={loginData.userId} 
                onChange={e => setLoginData({...loginData, userId: e.target.value})}
                placeholder="Enter User ID"
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
          </motion.form>

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
            <div>
              <label className="block text-xs font-medium mb-1 text-slate-400">Home City</label>
              <select 
                value={signupData.city} onChange={e => setSignupData({...signupData, city: e.target.value})}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                }`}>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
              </select>
            </div>
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
          <p className="text-xs text-slate-400 mt-1">How Your 4-Stage Pickup & Reward System Works:</p>
        </div>

        <div className="space-y-3 text-xs text-slate-300 my-6">
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <ShoppingCart className="w-5 h-5 text-lime-400 shrink-0" />
            <p><b>Recycle Devices:</b> Add multiple items to your e-waste cart, attach photos, analyze, and submit.</p>
          </div>
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <QrCode className="w-5 h-5 text-sky-400 shrink-0" />
            <p><b>QR Pickup Verification:</b> Show your unique QR code to the field worker upon arrival. Once verified, points credit instantly!</p>
          </div>
          <div className={`p-3 rounded-xl border flex gap-3 items-start ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <History className="w-5 h-5 text-amber-400 shrink-0" />
            <p><b>History & Live Stages:</b> Track every request across all 4 stages in the History tab.</p>
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

function RecyclerLayout({ user, setUser, isDark, setNotifications }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('main'); 
  const [requests, setRequests] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(user.hasSeenOnboarding === 0);

  useEffect(() => {
    fetch(`${API_BASE}/requests/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setNotifications(prev => buildStageNotifications(data, prev));
      });
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
              onClick={() => setActiveTab('recycle')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'recycle'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Recycle className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Recycle Devices</span>}
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

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'history'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <History className="w-4 h-4 shrink-0" />
              {!collapsed && <span>History</span>}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-xs transition ${
                activeTab === 'info'
                  ? (isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white')
                  : (isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100')
              }`}>
              <Info className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Info</span>}
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
        {activeTab === 'main' && <MainDashboardView user={user} requests={requests} isDark={isDark} />}
        {activeTab === 'recycle' && <RecycleDevicesView user={user} setRequests={setRequests} setNotifications={setNotifications} isDark={isDark} />}
        {activeTab === 'claim' && <ClaimRewardsView user={user} setUser={setUser} isDark={isDark} />}
        {activeTab === 'history' && <HistoryView requests={requests} isDark={isDark} />}
        {activeTab === 'info' && <InfoViewWithMapAndLinks isDark={isDark} />}
      </div>
    </div>
  );
}

function MainDashboardView({ user, requests, isDark }) {
  const verifiedItems = requests.filter(r => r.status === 'Accepted' && r.verifiedByQR === 1);
  const co2Saved = verifiedItems.length * 45;
  const waterSaved = verifiedItems.length * 1200;

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border bg-gradient-to-r ${
        isDark ? 'from-slate-900 to-slate-950 border-slate-800' : 'from-emerald-50 to-teal-50 border-emerald-100'
      }`}>
        <h2 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h2>
        <p className="text-xs text-slate-400 mt-1">Your live gamified status and environmental sustainability impact:</p>
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

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-md font-bold mb-1 flex items-center gap-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <Leaf className="w-5 h-5" /> Your CO₂ & Environmental Impact Calculator
        </h3>
        <p className="text-xs text-slate-400 mb-4">Calculated from your {verifiedItems.length} QR-verified pickup(s):</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Carbon Emissions Prevented</p>
              <p className="text-2xl font-extrabold text-emerald-400">{co2Saved} kg CO₂e</p>
              <p className="text-[11px] text-slate-500">Equivalent to planting {Math.max(1, Math.round(co2Saved / 20))} trees</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isDark ? 'bg-sky-950/20 border-sky-500/20' : 'bg-sky-50 border-sky-200'
          }`}>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Clean Water Conserved</p>
              <p className="text-2xl font-extrabold text-sky-400">{waterSaved.toLocaleString()} L</p>
              <p className="text-[11px] text-slate-500">Saved from toxic heavy metal mining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecycleDevicesView({ user, setRequests, setNotifications, isDark }) {
  const [cart, setCart] = useState([]);
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceType, setDeviceType] = useState('laptop');
  const [condition, setCondition] = useState('working_slow');
  
  const [city, setCity] = useState(user.city || 'Mumbai');
  const [selectedArea, setSelectedArea] = useState(AREAS_BY_CITY[user.city || 'Mumbai'][0]);
  const [customArea, setCustomArea] = useState('');
  const [deviceImage, setDeviceImage] = useState('');
  const [analyzedPreview, setAnalyzedPreview] = useState(null);

  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  const [pickupDate, setPickupDate] = useState(availableDates[0]);
  const [timeSlot, setTimeSlot] = useState('Morning (9 AM - 12 PM)');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setDeviceImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!deviceModel.trim()) return;

    let pts = 50;
    let action = 'Recycle';
    if (condition === 'working_good') { pts = 120; action = 'Donate / Reuse'; }
    else if (condition === 'working_slow') { pts = 80; action = 'Repair & Upcycle'; }

    const newItem = {
      id: Date.now(),
      model: deviceModel,
      type: deviceType,
      condition,
      action,
      points: pts
    };

    setCart([...cart, newItem]);
    setDeviceModel('');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalCartPoints = cart.reduce((sum, item) => sum + item.points, 0);
  const devicesString = cart.map(item => `${item.model} (${item.type})`).join(', ');
  const finalArea = selectedArea === 'Other' ? customArea : selectedArea;

  const handleAnalyzeRequest = (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Please add at least one device to your e-waste cart.');
    if (selectedArea === 'Other' && !customArea.trim()) return alert('Please enter your custom locality.');

    setAnalyzedPreview({
      devices: devicesString,
      totalPts: totalCartPoints,
      city,
      area: finalArea,
      pickupDate,
      timeSlot
    });
  };

  const handleBatchSubmit = async () => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.userId,
        devices: devicesString,
        action: 'Bulk Recycle',
        points: totalCartPoints,
        city,
        area: finalArea,
        pickupDate,
        timeSlot,
        deviceImage
      })
    });
    const data = await res.json();
    setRequests(data.requests);
    setNotifications(prev => buildStageNotifications(data.requests, prev));

    setCart([]);
    setDeviceImage('');
    setAnalyzedPreview(null);
    confetti({ particleCount: 70 });
  };

  return (
    <div className="space-y-6">
      {user.hasSeenOnboarding === 0 && (
        <GuidedBanner 
          title="Recycling Devices"
          steps={[
            "Add devices to your cart and optionally upload a photo for condition verification.",
            "Choose City, Locality, Date & Time Slot, then click Analyze Request.",
            "Confirm your request—view its 4 stages and QR code anytime in the History tab!"
          ]}
          isDark={isDark}
        />
      )}

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <Recycle className="w-5 h-5" /> Recycle Devices & Schedule Pickup
        </h3>

        <form onSubmit={handleAddToCart} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Device Model / Name</label>
              <input 
                type="text" placeholder="e.g. Dell Inspiron / iPhone 8"
                value={deviceModel} onChange={e => setDeviceModel(e.target.value)}
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
                <option value="battery">Battery / Power Bank</option>
                <option value="charger">Charger / Cables</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
              <select 
                value={condition} onChange={e => setCondition(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                <option value="working_good">Good / Reusable (+120 PTS)</option>
                <option value="working_slow">Functional with Issues (+80 PTS)</option>
                <option value="damaged">Damaged / Scrap (+50 PTS)</option>
              </select>
            </div>
          </div>

          <button type="submit" className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-lime-400 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200'
          }`}>
            <PlusCircle className="w-4 h-4" /> Add Item to Cart
          </button>
        </form>

        {cart.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Cart Items ({cart.length}) • Estimated: {totalCartPoints} PTS</h4>
              <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:underline">Clear Cart</button>
            </div>

            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className="font-bold">{item.model}</span> ({item.type}) • <span className="text-amber-400">+{item.points} PTS</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Upload Device Photo for Verification (Optional)</label>
              <label className={`flex items-center justify-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer transition ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-lime-400' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-600'
              }`}>
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{deviceImage ? 'Photo Attached ✓' : 'Choose Image File'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {deviceImage && (
              <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-800 bg-slate-900/40">
                <img src={deviceImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-lime-400">Image Preview Ready</p>
                  <p className="text-[11px] text-slate-400">Admin will view this image to verify device condition.</p>
                </div>
                <button type="button" onClick={() => setDeviceImage('')} className="text-xs text-rose-400 hover:underline px-2">Remove</button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                <select 
                  value={city} onChange={e => { setCity(e.target.value); setSelectedArea(AREAS_BY_CITY[e.target.value][0]); }}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Area Locality</label>
                <select 
                  value={selectedArea} onChange={e => setSelectedArea(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                  {(AREAS_BY_CITY[city] || []).map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="Other">Other (Custom Locality)</option>
                </select>
              </div>
            </div>

            {selectedArea === 'Other' && (
              <input 
                type="text" placeholder="Type custom locality/landmark..."
                value={customArea} onChange={e => setCustomArea(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pickup Date</label>
                <select 
                  value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}>
                  {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Time Slot</label>
                <select 
                  value={timeSlot} onChange={e => setTimeSlot(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAnalyzeRequest}
              className={`w-full font-bold py-3 rounded-xl transition ${
                isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}>
              Analyze Request ({cart.length} items • {totalCartPoints} PTS)
            </button>
          </div>
        )}

        {analyzedPreview && (
          <div className={`mt-4 p-4 rounded-xl border space-y-2 ${isDark ? 'border-lime-500/30 bg-lime-950/20' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className="text-xs font-bold text-amber-500">✨ AI Analysis Complete: +{analyzedPreview.totalPts} PTS credited upon QR verification at pickup</p>
            <p className="text-xs text-slate-400">Devices: {analyzedPreview.devices}</p>
            <p className="text-xs text-slate-400">Location: {analyzedPreview.area}, {analyzedPreview.city} • Schedule: {analyzedPreview.pickupDate} ({analyzedPreview.timeSlot})</p>
            <button onClick={handleBatchSubmit} className={`px-4 py-2 rounded-xl text-xs font-bold ${
              isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
            }`}>
              Confirm Schedule Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryView({ requests, isDark }) {
  const [qrModalReq, setQrModalReq] = useState(null);

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-bold mb-1 flex items-center gap-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <History className="w-5 h-5" /> Recycled Devices History & Live Stages
        </h3>
        <p className="text-xs text-slate-400 mb-6">Track the 4-stage lifecycle of your submitted devices. Points credit automatically once your QR code is verified upon pickup.</p>

        {requests.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No recycled devices yet. Visit Recycle Devices to schedule your first pickup!</p>
        ) : (
          <div className="space-y-4">
            {requests.map(r => {
              const isAccepted = r.status === 'Accepted';
              const isRejected = r.status === 'Rejected';
              const isQRVerified = r.verifiedByQR === 1;

              return (
                <div key={r.id} className={`p-4 rounded-xl border space-y-4 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-start gap-3">
                      {r.deviceImage ? (
                        <img src={r.deviceImage} alt={r.devices} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0" />
                      ) : (
                        <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                          <Laptop className="w-6 h-6 text-lime-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold">{r.devices} ({r.id})</p>
                        <p className="text-xs text-slate-400">Location: {r.area}, {r.city} • Slot: {r.pickupDate} ({r.timeSlot})</p>
                        
                        {isAccepted && (
                          <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Worker Dispatched: {r.assignedWorker} {isQRVerified ? '• QR Verified ✓' : ''}
                          </p>
                        )}
                        {isRejected && (
                          <p className="text-xs text-rose-400 font-semibold mt-1 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejection Reason: {r.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAccepted && !isQRVerified && (
                        <button 
                          onClick={() => setQrModalReq(r)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                            isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                          <QrCode className="w-4 h-4" /> View QR Code
                        </button>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        isAccepted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        isRejected ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {isAccepted && isQRVerified ? 'Completed & Verified' : r.status}
                      </span>
                    </div>
                  </div>

                  {!isRejected && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-center">
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400">1. Request Received</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${isAccepted ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                          <span className={isAccepted ? 'text-emerald-400' : 'text-slate-500'}>2. Worker Dispatched</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${isAccepted && isQRVerified ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                          <span className={isAccepted && isQRVerified ? 'text-emerald-400' : 'text-slate-500'}>3. QR Verified</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`h-1.5 rounded-full ${isAccepted && isQRVerified ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                          <span className={isAccepted && isQRVerified ? 'text-emerald-400' : 'text-slate-500'}>4. +{r.points} PTS Credited</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {qrModalReq && qrModalReq.verifiedByQR === 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-6 rounded-2xl border text-center space-y-4 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-bold">Pickup Verification QR</h3>
            <p className="text-xs text-slate-400">Request {qrModalReq.id} • {qrModalReq.devices}</p>

            <div className="w-48 h-48 mx-auto bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-slate-900">
              <QrCode className="w-36 h-36 text-slate-900" />
              <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">{qrModalReq.qrCode}</span>
            </div>

            <p className="text-xs text-slate-400">Show this QR code to your assigned field worker upon pickup to verify completion and release your +{qrModalReq.points} PTS.</p>

            <button 
              onClick={() => setQrModalReq(null)}
              className={`w-full py-2 rounded-xl text-xs font-bold ${
                isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
              }`}>
              Close QR Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoViewWithMapAndLinks({ isDark }) {
  const [selectedHub, setSelectedHub] = useState('Mumbai');

  const hubsData = {
    Mumbai: { title: "Mumbai Regional Hub", address: "Andheri West Collection Center, Mumbai", capacity: "84% Capacity", workers: 3, status: "Active & Dispatched" },
    Delhi: { title: "Delhi NCR Hub", address: "Saket Metro Station Depot, South Delhi", capacity: "62% Capacity", workers: 4, status: "Active & Dispatched" },
    Bengaluru: { title: "Bengaluru Tech Hub", address: "Koramangala 5th Block Depot, Bengaluru", capacity: "78% Capacity", workers: 4, status: "Active & Dispatched" }
  };

  const currentHub = hubsData[selectedHub];

  const externalResources = [
    { title: "UN Global E-Waste Monitor", desc: "Official statistics and research reports on world electronic waste trends.", link: "https://ewastemonitor.info/" },
    { title: "CPCB E-Waste Guidelines", desc: "Central Pollution Control Board regulations and certified dismantler lists.", link: "https://cpcb.nic.in/e-waste/" },
    { title: "US EPA Electronics Stewardship", desc: "Learn about certified electronics recyclers and sustainable management.", link: "https://www.epa.gov/recycle/electronics-donation-and-recycling" },
    { title: "iFixit Repair Guides", desc: "Open-source repair manuals to fix electronics instead of throwing them away.", link: "https://www.ifixit.com/" }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 mb-2 ${isDark ? 'text-lime-400' : 'text-emerald-600'}`}>
          <MapPin className="w-5 h-5" /> Interactive Hub Map & Collection Centers
        </h2>
        <p className="text-xs text-slate-400 mb-6">Click on any regional metropolis node to inspect live hub logistics and field worker status:</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {['Mumbai', 'Delhi', 'Bengaluru'].map(city => (
            <button
              key={city}
              onClick={() => setSelectedHub(city)}
              className={`p-4 rounded-xl border text-left transition ${
                selectedHub === city 
                  ? (isDark ? 'bg-lime-400/10 border-lime-400 text-lime-400' : 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold') 
                  : (isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600')
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="font-bold text-sm">{city} Hub</span>
              </div>
              <p className="text-[11px] opacity-80">{hubsData[city].status}</p>
            </button>
          ))}
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-md font-bold">{currentHub.title}</h3>
              <p className="text-xs text-slate-400 mt-1">📍 Address: {currentHub.address}</p>
              <p className="text-xs text-slate-400 mt-0.5">👷 Active Field Workers: {currentHub.workers} teams deployed</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentHub.capacity}
              </span>
            </div>
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
      body: JSON.stringify({ userId: user.userId, cost: reward.cost })
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
              {!collapsed && <span>Operations Overview</span>}
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
  const handleExportCSV = () => {
    const headers = "Request ID,User ID,Devices,Status,QR Verified,Points,City,Area,Pickup Date,Assigned Worker\n";
    const rows = requests.map(r => 
      `"${r.id}","${r.userId}","${r.devices}","${r.status}","${r.verifiedByQR ? 'Yes' : 'No'}","${r.points}","${r.city}","${r.area}","${r.pickupDate}","${r.assignedWorker}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ewise_operations_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r ${
        isDark ? 'from-slate-900 to-slate-950 border-slate-800' : 'from-emerald-50 to-teal-50 border-emerald-100'
      }`}>
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user.name} 🛡️</h2>
          <p className="text-xs text-slate-400 mt-1">Here is your live municipal operations overview:</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            isDark ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}>
          <Download className="w-4 h-4" /> Export Operations CSV
        </button>
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

  const handleOpenAcceptModal = (r) => {
    setSelectedReq(r);
    const recommendedWorker = getBestWorkerForArea(r.city, r.area);
    setWorker(recommendedWorker);
  };

  const handleAccept = async (requestId) => {
    if (!worker) return alert('Please assign a field worker.');

    await fetch(`${API_BASE}/admin/verify-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status: 'Accepted', assignedWorker: worker })
    });

    setSelectedReq(null);
    setWorker('');
    fetchRequests();
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason) return alert('Please enter a rejection reason.');

    await fetch(`${API_BASE}/admin/verify-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status: 'Rejected', rejectionReason })
    });

    setRejectModal(null);
    setRejectionReason('');
    fetchRequests();
  };

  const handleScanQR = async (requestId) => {
    await fetch(`${API_BASE}/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId })
    });
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="text-md font-bold mb-4">Pickup Requests Operations Queue</h3>
        
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-3">
                {r.deviceImage && (
                  <img src={r.deviceImage} alt={r.devices} className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold">{r.devices} • <span className="text-amber-500">ID: {r.id}</span></p>
                  <p className="text-xs text-slate-400">User: <b>{r.userId}</b> • (+{r.points} PTS upon QR verification)</p>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location: <b>{r.area}, {r.city}</b>
                  </p>
                  {r.status === 'Accepted' && (
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      Assigned: {r.assignedWorker} {r.verifiedByQR === 1 ? '• QR Verified & Points Credited ✓' : '• Awaiting QR Pickup Verification'}
                    </p>
                  )}
                  {r.status === 'Rejected' && (
                    <p className="text-xs text-rose-400 font-semibold mt-1">
                      Rejected: {r.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.status === 'Pending Verification' && (
                  <>
                    <button onClick={() => handleOpenAcceptModal(r)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                      isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
                    }`}>
                      Accept & Assign
                    </button>
                    <button onClick={() => setRejectModal(r)} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg">
                      Reject
                    </button>
                  </>
                )}
                {r.status === 'Accepted' && r.verifiedByQR === 0 && (
                  <>
                    <button onClick={() => handleScanQR(r.id)} className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" /> Scan QR
                    </button>
                    <button onClick={() => setRejectModal(r)} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-lg">
                      Reject
                    </button>
                  </>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  r.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  {r.status === 'Accepted' && r.verifiedByQR === 1 ? 'Completed' : r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedReq && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-1">Accept Pickup & Allot Worker</h3>
            <p className="text-xs text-slate-400 mb-3">Pickup Hub: <b>{selectedReq.area}, {selectedReq.city}</b></p>

            {selectedReq.deviceImage && (
              <div className="mb-4">
                <p className="text-[11px] text-slate-400 mb-1">Uploaded Device Condition Photo:</p>
                <img src={selectedReq.deviceImage} alt="Device verification" className="w-full h-36 object-cover rounded-xl border border-slate-800" />
              </div>
            )}

            <label className="block text-xs font-medium mb-1">Field Worker ({selectedReq.city})</label>
            <select value={worker} onChange={e => setWorker(e.target.value)} className={`w-full p-2 text-xs rounded-xl border mb-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
            }`}>
              <option value="">-- Choose Field Worker --</option>
              {(WORKERS_BY_CITY[selectedReq.city] || []).map((w, i) => (
                <option key={i} value={w.name}>{w.name}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button onClick={() => handleAccept(selectedReq.id)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                isDark ? 'bg-lime-400 text-black' : 'bg-emerald-600 text-white'
              }`}>
                Confirm Assignment
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
            <h3 className="text-lg font-bold mb-1 text-rose-500">Reject Pickup Request ({rejectModal.id})</h3>
            <p className="text-xs text-slate-400 mb-3">
              {rejectModal.status === 'Accepted' 
                ? 'Rejecting at field QR verification stage (e.g., device mismatch or damaged beyond condition):' 
                : 'Enter reason for rejecting this request:'}
            </p>
            <textarea 
              rows={3} required
              placeholder="Reason for rejection..."
              value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
              className={`w-full p-2 text-xs rounded-xl border mb-4 focus:outline-none ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <div className="flex gap-2">
              <button onClick={() => handleReject(rejectModal.id)} className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold">
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
    ? 'Hello! Ask me about QR verification, rejecting mismatched items at pickup, or CSV exports.'
    : 'Hello! I am your E-Wise Smart Assistant. Ask me about Recycle Devices, QR verification, or History!';
  const [messages, setMessages] = useState([{ sender: 'bot', text: initialBotMsg }]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');

    setTimeout(() => {
      let botReply = "I am here to guide you!";
      const q = text.toLowerCase();
      if (q.includes('recycle') || q.includes('cart')) {
        botReply = "♻️ Go to 'Recycle Devices' to add multiple items, attach photos, analyze points, and schedule a pickup.";
      } else if (q.includes('qr') || q.includes('points')) {
        botReply = "📱 Once your request is accepted, open 'History' and click 'View QR Code'. Points credit as soon as the worker scans it!";
      } else if (q.includes('history') || q.includes('stage')) {
        botReply = "📜 The 'History' tab tracks all 4 stages: Request Received, Worker Dispatched, QR Verified, and PTS Credited.";
      } else if (q.includes('csv') || q.includes('report')) {
        botReply = "📊 Click 'Export Operations CSV' on the Operations Overview to download a full collection audit report.";
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
              <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> E-Wise Assistant</span>
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