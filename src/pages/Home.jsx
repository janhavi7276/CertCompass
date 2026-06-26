import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-4xl text-center py-16 md:py-24 flex flex-col items-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none animate-glow-orb"></div>
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-float"></div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-purple-700 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in-up">
          Navigate Your Tech & AI Career
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium animate-fade-in-up">
          Discover vendor-neutral roadmap paths, analyze real-time market insights, and unlock certifications that accelerate your engineering growth.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
          {!user ? (
            <>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-48 text-center"
              >
                Get Started Free
              </Link>
              <Link 
                to="/signin" 
                className="bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-48 text-center shadow-sm"
              >
                Sign In
              </Link>
            </>
          ) : (
            <Link 
              to="/dashboard" 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold px-12 py-4 rounded-xl text-lg shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Go to Dashboard 🧭
            </Link>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="w-full mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/60 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-950/40 hover:-translate-y-1 transition-all duration-300 group">
          <div className="text-3xl mb-4 p-2 bg-blue-500/5 rounded-lg w-fit border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/25 transition-all">
            💰
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Salary Insights</h3>
          <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">Real-time market values, average payouts, and ROI estimation for certifications.</p>
        </div>

        <div className="p-6 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/60 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-950/40 hover:-translate-y-1 transition-all duration-300 group">
          <div className="text-3xl mb-4 p-2 bg-indigo-500/5 rounded-lg w-fit border border-indigo-500/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/25 transition-all">
            🎓
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Exam Prep Hub</h3>
          <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">Curated docs, code labs, mock tests, and training courses to guarantee exam success.</p>
        </div>

        <div className="p-6 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/60 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-950/40 hover:-translate-y-1 transition-all duration-300 group">
          <div className="text-3xl mb-4 p-2 bg-teal-500/5 rounded-lg w-fit border border-teal-500/10 group-hover:bg-teal-500/10 group-hover:border-teal-500/25 transition-all">
            👥
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Tech Community</h3>
          <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">Connect with verified credential holders, share guides, and team up for study goals.</p>
        </div>

        <div className="p-6 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/60 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-950/40 hover:-translate-y-1 transition-all duration-300 group">
          <div className="text-3xl mb-4 p-2 bg-pink-500/5 rounded-lg w-fit border border-pink-500/10 group-hover:bg-pink-500/10 group-hover:border-pink-500/25 transition-all">
            🗺️
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Visual Roadmaps</h3>
          <p className="text-slate-555 dark:text-slate-400 text-sm leading-relaxed">Custom career paths recommended by AI agent models based on your skillset.</p>
        </div>
      </section>

      {/* Trust Banner / Interactive Mockup section */}
      <section className="w-full mt-20 py-12 border border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-900/10 backdrop-blur rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in-up">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-md">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
            AI-Powered Career Compass
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Log in to query our advanced agent that analyzes your specific background and targets the exact milestones you need to land your dream Cloud or Machine Learning Role.
          </p>
          {!user ? (
            <Link 
              to="/signup" 
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-2 group"
            >
              Start building your first path 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <Link 
              to="/dashboard" 
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-2 group"
            >
              Analyze your career goal
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </div>
        <div className="w-full md:w-96 bg-slate-950 border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col gap-4 font-mono text-xs text-slate-100">
          <div className="flex gap-1.5 items-center pb-2 border-b border-slate-900">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span className="text-slate-500 ml-2">agent_diagnostics.py</span>
          </div>
          <div>
            <span className="text-blue-400">&gt;&gt;&gt;</span> <span>user.target_role</span> = <span className="text-green-400">"Machine Learning Engineer"</span>
          </div>
          <div>
            <span className="text-blue-400">&gt;&gt;&gt;</span> <span>user.skills</span> = [<span className="text-green-400">"Python"</span>, <span className="text-green-400">"PyTorch"</span>]
          </div>
          <div>
            <span className="text-blue-400">&gt;&gt;&gt;</span> <span className="text-indigo-400">agent.compute_optimum_path()</span>
          </div>
          <div className="text-slate-500 text-[10px]">
            [ANALYZING 50+ CLOUD & AI CERTIFICATIONS...]
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-850 rounded text-slate-300 flex flex-col gap-1">
            <div className="text-blue-400 font-semibold">Recommended Milestones:</div>
            <div>1. TensorFlow Developer Certificate (Beginner)</div>
            <div>2. AWS Machine Learning Specialty (Advanced)</div>
          </div>
        </div>
      </section>
    </div>
  );
}
