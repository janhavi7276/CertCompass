import { useState, useEffect } from 'react';
import { certAPI } from '../services/api';
import { useAuth } from '../store/auth';

export default function Explore() {
  const { session } = useAuth();
  
  // Tab control: 'browse' or 'ai'
  const [activeTab, setActiveTab] = useState('browse');

  // Browse Tab States
  const [certs, setCerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Tab States
  const [careerGoal, setCareerGoal] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (activeTab === 'browse') {
      loadCerts();
    }
  }, [activeTab]);

  const loadCerts = async (q = query, l = level) => {
    setLoading(true);
    try {
      // If filtering for "Free", we set free flag
      const isFreeFilter = l === 'Free';
      const cleanLevel = isFreeFilter ? '' : l;
      
      const data = await certAPI.getCertifications(q, cleanLevel, isFreeFilter);
      setCerts(data.results || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load certifications:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    loadCerts(q, level);
  };

  const handleFilter = (l) => {
    const nextLevel = level === l ? '' : l;
    setLevel(nextLevel);
    loadCerts(query, nextLevel);
  };

  // Recommendations generator handler
  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!careerGoal.trim()) return;

    setRecLoading(true);
    setSaveStatus('');
    try {
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const data = await certAPI.getRecommendations(careerGoal, skillsArray);
      setRecommendation(data);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
    }
    setRecLoading(false);
  };

  // Save the recommended path handler
  const handleSavePath = async () => {
    if (!session?.access_token || !recommendation) return;
    setSaveStatus('saving');
    try {
      const certIds = recommendation.recommended_certs.map(c => c.id);
      await certAPI.savePath(recommendation.title, certIds, session.access_token);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save path:', err);
      setSaveStatus('error');
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Explore Hub
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Browse our curated certification database or leverage the AI recommender to build your next learning path.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-900 mb-8 p-1 bg-slate-950 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeTab === 'browse'
              ? 'bg-slate-900 text-blue-400 shadow border border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Browse Certifications
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
            activeTab === 'ai'
              ? 'bg-slate-900 text-blue-400 shadow border border-slate-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🧭 AI Roadmap Builder
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Search bar and Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search certifications by name, provider, or topic..."
                value={query}
                onChange={handleSearch}
                className="w-full bg-slate-900 border border-slate-850 px-4 py-3 pl-11 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute left-4 top-3.5 text-slate-500">🔍</span>
            </div>
            
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {['Beginner', 'Intermediate', 'Advanced', 'Free'].map(f => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    level === f
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
            {total} Certifications Found
          </p>

          {/* Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <p>Searching credentials...</p>
            </div>
          ) : certs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl">
              <p className="text-slate-400 mb-2">No matching certifications found</p>
              <button 
                onClick={() => { setQuery(''); setLevel(''); loadCerts('', ''); }}
                className="text-sm font-semibold text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map(cert => (
                <div 
                  key={cert.id} 
                  className="bg-slate-900/30 border border-slate-850 hover:border-slate-850 hover:bg-slate-900/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {cert.image_url ? (
                      <img 
                        src={cert.image_url} 
                        alt={cert.title} 
                        className="w-full h-40 object-cover rounded-xl border border-slate-800 mb-4 bg-slate-950" 
                      />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-blue-900/10 to-indigo-900/15 border border-slate-850 rounded-xl mb-4 flex items-center justify-center text-slate-500 text-2xl font-bold">
                        📜
                      </div>
                    )}
                    <div className="text-xs font-mono text-slate-500 mb-1">{cert.provider}</div>
                    <h3 className="text-lg font-bold text-slate-200 mb-3 leading-snug">{cert.title}</h3>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <span className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                      {cert.level || 'All levels'}
                    </span>
                    <span className="bg-blue-950/20 border border-blue-900/20 text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                      {cert.price || 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* AI Tab Section */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Panel */}
          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold text-slate-200 mb-2 flex items-center gap-2">
              <span>🧠</span> AI Planner
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your target career milestones and core skills to build a recommended learning path.
            </p>

            <form onSubmit={handleGetRecommendations} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Career Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Machine Learning Engineer"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Skills (comma separated)
                </label>
                <textarea
                  placeholder="e.g. Python, SQL, Git, Basic Machine Learning"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-lg text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={recLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 disabled:opacity-50"
              >
                {recLoading ? 'Generating Path...' : 'Generate Roadmap'}
              </button>
            </form>
          </div>

          {/* Output Roadmap Panel */}
          <div className="lg:col-span-2">
            {recLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-900/10 border border-slate-900 rounded-2xl">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-400 font-medium">Computing certification matching matrices...</p>
              </div>
            ) : !recommendation ? (
              <div className="flex flex-col items-center justify-center py-24 bg-slate-900/10 border border-slate-900 rounded-2xl text-center px-6">
                <span className="text-4xl mb-4">🧭</span>
                <h3 className="font-bold text-lg text-slate-200 mb-1">No Roadmap Active</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Fill in the planner details on the left to compute an optimal certification roadmap.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6 relative overflow-hidden">
                {/* Save Roadmap Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase bg-blue-950/20 border border-blue-900/20 px-2 py-0.5 rounded">
                      Roadmap Generated
                    </span>
                    <h2 className="text-2xl font-bold text-slate-100 mt-2">{recommendation.title}</h2>
                  </div>

                  {session ? (
                    <button
                      onClick={handleSavePath}
                      disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold shadow transition-all duration-200 ${
                        saveStatus === 'saved'
                          ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-400'
                          : saveStatus === 'saving'
                          ? 'bg-slate-900 border border-slate-850 text-slate-500'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {saveStatus === 'saved' ? 'Saved to Profile ✓' : saveStatus === 'saving' ? 'Saving...' : 'Save Roadmap Path'}
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500 bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg">
                      🔑 <a href="/signin" className="text-blue-400 hover:underline">Sign in</a> to save this roadmap path.
                    </p>
                  )}
                </div>

                {/* Recommendations Grid */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                    Recommended Certifications
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recommendation.recommended_certs.map((cert, index) => (
                      <div 
                        key={cert.id} 
                        className="bg-slate-950/80 border border-slate-850 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex gap-4 items-start md:items-center">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-bold text-blue-400">
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">{cert.provider}</span>
                            <h4 className="font-bold text-slate-200 text-base">{cert.title}</h4>
                            <div className="flex gap-2 mt-1.5">
                              <span className="text-[9px] font-bold text-slate-400 tracking-wider bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {cert.level}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 tracking-wider bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                {cert.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
