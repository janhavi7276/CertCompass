import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { supabase } from '../services/supabase';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, email, password);

      // If session exists, email is auto-confirmed → go to dashboard
      if (result?.user?.email_confirmed_at || result?.session) {
        navigate('/dashboard');
      } else {
        // Email confirmation required → show success/check-email screen
        setSuccess(true);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('fetch')) {
        setError('Cannot connect to server. Your Supabase project may be paused. Go to supabase.com → your project → click "Resume".');
      } else if (msg.includes('already registered') || msg.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (msg.includes('invalid email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('Password should')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(msg || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google Authentication failed');
    }
  };

  // ─── Email Confirmation Screen ─────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-purple-100 p-10 rounded-3xl shadow-xl shadow-purple-100/50 text-center animate-fade-in-up">
          <div className="text-6xl mb-5">📬</div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Check your inbox!</h2>
          <p className="text-slate-500 text-sm mb-2 leading-relaxed">
            We've sent a confirmation link to:
          </p>
          <p className="text-purple-600 font-semibold text-sm mb-6 bg-purple-50 border border-purple-100 px-4 py-2 rounded-lg inline-block">
            {email}
          </p>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            Click the link in your email to activate your account, then come back and sign in.
          </p>
          <Link
            to="/signin"
            className="w-full block bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            Go to Sign In →
          </Link>
          <p className="mt-5 text-xs text-slate-400">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSuccess(false)}
              className="text-purple-600 hover:underline cursor-pointer font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Sign Up Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-indigo-50 text-slate-800 flex flex-col items-center justify-center px-6 relative transition-colors duration-300">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/15 rounded-full blur-[100px] pointer-events-none animate-glow-orb"></div>
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none animate-float"></div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium text-sm bg-white border border-purple-200 hover:bg-purple-50 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="w-full max-w-md bg-white border border-purple-100 p-8 rounded-3xl shadow-xl shadow-purple-100/50 backdrop-blur-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-200">
            🧭 CertCompass
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 mt-4">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-medium">Sign up to map your personal career roadmaps.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-5 flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-up */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-purple-50 text-slate-700 font-semibold py-3 px-4 border border-purple-200 rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] text-sm cursor-pointer mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-purple-100"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-wider uppercase">or credentials</span>
          <div className="flex-grow border-t border-purple-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-purple-50/50 border border-purple-100 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-purple-50/50 border border-purple-100 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password (min 6 characters)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-purple-50/50 border border-purple-100 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-300 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 text-sm mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-xs font-medium">
          Already have an account?{' '}
          <Link to="/signin" className="text-purple-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
