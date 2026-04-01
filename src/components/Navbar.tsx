import { Link, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Package, Home, LogOut, Fish } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
  ];

  return (
    <nav className="bg-slate-950/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-500 p-1.5 rounded-lg group-hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Kamal <span className="text-blue-400">Sea Foods</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-400",
                  location.pathname === item.path ? "text-blue-400" : "text-slate-300"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-white">{user.displayName}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
