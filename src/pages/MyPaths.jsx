import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { certAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function MyPaths() {
  const { session } = useAuth();
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, [session]);

  const loadPaths = async () => {
    try {
      if (session?.access_token) {
        const data = await certAPI.getPaths(session.access_token);
        setPaths(data.paths || []);
      }
    } catch (err) {
      console.error('Failed to load paths:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
        <p>Retrieving your learning tracks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          My Roadmap Tracks
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Review your saved learning paths and explore recommendations again.
        </p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/10 border border-slate-900 rounded-3xl p-8 flex flex-col items-center">
          <span className="text-4xl mb-4">🗺️</span>
          <h3 className="font-bold text-lg text-slate-200 mb-2">No Saved Tracks</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            You haven't saved any AI recommended paths to your profile history yet.
          </p>
          <Link 
            to="/explore" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-md transition-colors"
          >
            Generate AI Roadmap
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {paths.map((path, idx) => (
            <div 
              key={path.id || idx} 
              className="bg-slate-900/30 border border-slate-850 hover:bg-slate-900/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
            >
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Roadmap Path
                </span>
                <h3 className="font-bold text-slate-200 text-lg mt-0.5">{path.title}</h3>
                <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5">
                  <span>📅</span> Saved on {new Date(path.searched_at).toLocaleDateString()} at {new Date(path.searched_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <Link 
                to={`/explore`} 
                className="bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-lg text-center transition-colors"
              >
                Analyze Again
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
