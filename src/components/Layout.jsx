import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dark/Light Mode Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-purple-100 shadow-sm shadow-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200"
          >
            <span className="text-3xl filter drop-shadow">🧭</span>
            <span>CertCompass</span>
          </Link>
          
          <nav className="flex gap-4 sm:gap-6 items-center">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors duration-200 hover:text-purple-600 ${
                isActive('/') ? 'text-purple-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Home
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors duration-200 hover:text-purple-600 ${
                  isActive('/dashboard') ? 'text-purple-600 font-semibold' : 'text-slate-600'
                }`}
              >
                Dashboard
              </Link>
            )}
            
            <div className="h-4 w-[1px] bg-purple-100 mx-1 hidden sm:block"></div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 hover:scale-105 transition-all duration-200 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 1111.36 3.636" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden lg:inline-block font-mono bg-purple-50 border border-purple-100 px-2 py-1 rounded">
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-3 items-center">
                <Link 
                  to="/signin" 
                  className="text-slate-600 hover:text-purple-600 text-sm font-medium px-2.5 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {children}
      </main>
      
      {/* Premium Footer with Contact Info */}
      <footer className="bg-white border-t border-purple-100 text-slate-500 py-10 text-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-base">About CertCompass</h3>
            <p className="leading-relaxed text-xs">
              CertCompass is a vendor-neutral roadmap and certification recommendation system. 
              We use intelligent mapping algorithms to help tech professionals align their career targets 
              with cloud and AI credentials.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-base">Quick Links</h3>
            <div className="flex flex-col gap-2 text-xs">
              <Link to="/" className="hover:text-purple-600 transition-colors">Home Page</Link>
              <Link to="/dashboard" className="hover:text-purple-600 transition-colors">Dashboard</Link>
              <span className="hover:text-purple-600 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-purple-600 transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-3 text-base">Contact Us</h3>
            <div className="flex flex-col gap-2 text-xs font-mono">
              <p className="flex items-center gap-2">
                <span>📧</span> <a href="mailto:support@certcompass.com" className="hover:text-blue-500 transition-colors">support@certcompass.com</a>
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span> <span>+1 (555) 123-4567</span>
              </p>
              <p className="flex items-center gap-2">
                <span>🏢</span> <span className="not-italic">100 Innovation Way, Tech Suite 500</span>
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-purple-100 mt-8 pt-6 text-center text-xs text-slate-400">
          <p>© 2026 CertCompass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
