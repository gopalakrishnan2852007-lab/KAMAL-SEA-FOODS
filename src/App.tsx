import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import AdminDashboard from './pages/AdminDashboard';
import Order from './pages/Order';
import ErrorBoundary from './components/ErrorBoundary';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-blue-400 animate-spin-slow opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
          <Navbar user={user} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/order/:productId" element={<Order />} />
              <Route path="/admin-hidden-2026" element={<AdminDashboard user={user} />} />
            </Routes>
          </main>
          
          <WhatsAppButton />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
