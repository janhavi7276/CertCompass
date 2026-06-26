import { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { certAPI } from '../services/api';
import { Link } from 'react-router-dom';

// Mapped premium resources for top certifications
const RESOURCES_MAP = {
  'tf-dev': [
    { name: 'Official TensorFlow Study Guide & Handbook', url: 'https://www.tensorflow.org/certificate' },
    { name: 'Coursera: DeepLearning.AI TensorFlow Developer Certificate Course', url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice' },
    { name: 'FreeCodeCamp: TensorFlow Complete Tutorial (Free Course)', url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk' }
  ],
  'aws-ml': [
    { name: 'AWS Learning Path: Machine Learning Specialty Prep', url: 'https://aws.amazon.com/training/pathway-machine-learning/' },
    { name: 'Udemy: AWS Certified Machine Learning Specialty Course by Frank Kane', url: 'https://www.udemy.com/course/aws-machine-learning/' },
    { name: 'AWS Certified Machine Learning Specialty Official Practice Questions', url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/12480/exam-readiness-aws-certified-machine-learning-specialty' }
  ],
  'gcp-pca': [
    { name: 'Google Cloud Certified Professional Cloud Architect Path', url: 'https://cloud.google.com/learn/certification/cloud-architect' },
    { name: 'Coursera: Preparing for Google Cloud Architect Professional Certificate', url: 'https://www.coursera.org/professional-certificates/gcp-cloud-architect' },
    { name: 'Google Cloud Architecture Framework Docs', url: 'https://cloud.google.com/architecture/framework' }
  ],
  'gcp-pml': [
    { name: 'Google Cloud Professional ML Engineer Exam Guide', url: 'https://cloud.google.com/learn/certification/machine-learning-engineer' },
    { name: 'Coursera: Preparing for Google Cloud ML Engineer Certificate', url: 'https://www.coursera.org/professional-certificates/gcp-machine-learning-engineer' },
    { name: 'Vertex AI Product Documentation & Tutorials', url: 'https://cloud.google.com/vertex-ai/docs' }
  ],
  'azure-ai-fun': [
    { name: 'Microsoft Learn: Azure AI Fundamentals AI-900 Study Guide', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/' },
    { name: 'FreeCodeCamp: Microsoft Azure AI Fundamentals Exam Prep Course', url: 'https://www.youtube.com/watch?v=H77vYl9G9_w' }
  ],
  'azure-ai-eng': [
    { name: 'Microsoft Learn: Azure AI Engineer Associate AI-102 Exam Track', url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/' },
    { name: 'Pluralsight: Microsoft Certified Azure AI Engineer Associate Prep', url: 'https://www.pluralsight.com/paths/microsoft-certified-azure-ai-engineer-associate-ai-102' }
  ],
  'ckad': [
    { name: 'The Linux Foundation: Certified Kubernetes Application Developer (CKAD) Prep', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/' },
    { name: 'Udemy: Kubernetes Certified Application Developer Course by Mumshad Mumshad', url: 'https://www.udemy.com/course/certified-kubernetes-application-developer/' }
  ]
};

const getFallbackResources = (title, provider) => [
  { name: `Official ${provider} Certification Page`, url: `https://www.google.com/search?q=${encodeURIComponent(title + ' official certification page')}` },
  { name: 'Search Prep Courses on Coursera', url: `https://www.coursera.org/search?query=${encodeURIComponent(title)}` },
  { name: 'Search Study Guides on YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' study guide')}` }
];

export default function Dashboard() {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('quiz');

  // Questionnaire States
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    track: '',
    level: '',
    provider: '',
    budget: ''
  });

  // Recommendations and History
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [savedPaths, setSavedPaths] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Settings states
  const [localTheme, setLocalTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [userProfile, setUserProfile] = useState({
    title: 'Software Engineer',
    skills: 'React, Node.js, Python, Git'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, session]);

  const fetchHistory = async () => {
    if (!session?.access_token) return;
    setHistoryLoading(true);
    try {
      const data = await certAPI.getPaths(session.access_token);
      setSavedPaths(data.paths || []);
    } catch (err) {
      console.error('Failed to load history paths:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectQuizAnswer = (field, value) => {
    setQuizAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setQuizStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setQuizStep(prev => prev - 1);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({
      track: '',
      level: '',
      provider: '',
      budget: ''
    });
    setQuizStep(1);
    setRecommendations(null);
  };

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      const careerGoal = `${quizAnswers.provider} ${quizAnswers.track}`;
      const skillsArray = [quizAnswers.level, quizAnswers.budget].filter(Boolean);
      
      // Get recommendation from API
      const data = await certAPI.getRecommendations(careerGoal, skillsArray);
      
      // Save it to history automatically
      if (session?.access_token && data.recommended_certs.length > 0) {
        const certIds = data.recommended_certs.map(c => c.id);
        await certAPI.savePath(data.title, certIds, session.access_token);
      }
      
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle theme utility within settings
  const toggleTheme = () => {
    const nextTheme = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(nextTheme);
    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', nextTheme);
  };

  // Load a previously saved track from history
  const handleLoadSavedTrack = (track) => {
    const loadSavedPath = async () => {
      setLoading(true);
      try {
        const allCertsResponse = await certAPI.getCertifications();
        const fullCerts = (allCertsResponse.results || []).filter(c => track.cert_ids.includes(c.id));
        setRecommendations({
          title: track.title,
          recommended_certs: fullCerts
        });
        setActiveTab('quiz');
      } catch (err) {
        console.error('Failed to load saved path details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSavedPath();
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <div className="p-4 bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl backdrop-blur flex flex-col items-center text-center gap-2 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/10">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100">{user?.email?.split('@')[0]}</h4>
            <p className="text-[10px] font-mono text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => { setActiveTab('quiz'); }}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
              : 'hover:bg-slate-255 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-350'
          }`}
        >
          <span>🔍</span> Search Certification
        </button>

        <button
          onClick={() => { setActiveTab('history'); }}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
              : 'hover:bg-slate-255 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-350'
          }`}
        >
          <span>📜</span> Saved Paths History
        </button>

        <button
          onClick={() => { setActiveTab('profile'); }}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
              : 'hover:bg-slate-255 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-350'
          }`}
        >
          <span>👤</span> Profile Info
        </button>

        <button
          onClick={() => { setActiveTab('settings'); }}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
              : 'hover:bg-slate-255 dark:hover:bg-slate-900/60 text-slate-650 dark:text-slate-350'
          }`}
        >
          <span>⚙️</span> Dashboard Settings
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="lg:col-span-3">
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Certification Match Engine
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
                Complete the interactive questionnaire to evaluate target pathways, study resources, and career roadmap templates.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 backdrop-blur text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h4 className="font-bold text-slate-850 dark:text-slate-200">Matching Credentials</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 max-w-xs mt-1.5">Checking vendor-neutral certification details and computing resources roadmap...</p>
              </div>
            ) : recommendations ? (
              // RECOMMENDATIONS PANEL
              <div className="space-y-8 animate-fade-in-up">
                {/* Header card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-650 border border-blue-550 dark:border-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
                  <span className="text-[9px] font-bold tracking-wider bg-white/20 border border-white/25 px-2 py-0.5 rounded uppercase">
                    AI Roadmap Ready ✓
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">{recommendations.title}</h2>
                  <p className="text-blue-100 text-xs mt-2 max-w-lg leading-relaxed">
                    Based on your profile answers, here is the certification plan, preparation courses, and interactive milestone roadmap.
                  </p>
                  <button
                    onClick={handleResetQuiz}
                    className="mt-6 bg-white hover:bg-slate-50 text-blue-755 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    ← Build Another Path
                  </button>
                </div>

                {/* Recommendations Grid */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>📜</span> i. Recommended Certifications
                  </h3>

                  {recommendations.recommended_certs.length === 0 ? (
                    <div className="p-8 text-center bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl">
                      <p className="text-slate-550 text-sm">No specific certifications matched your exact filter preferences.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {recommendations.recommended_certs.map(cert => (
                        <div 
                          key={cert.id} 
                          className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">{cert.provider}</span>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mt-1 mb-3 leading-snug">{cert.title}</h4>
                            <div className="flex gap-2">
                              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-450 uppercase">
                                {cert.level}
                              </span>
                              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-450 uppercase">
                                {cert.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resources Panel */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>📚</span> ii. Mapped Exam Prep Resources
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recommendations.recommended_certs.map(cert => {
                      const certResources = RESOURCES_MAP[cert.id] || getFallbackResources(cert.title, cert.provider);
                      return (
                        <div 
                          key={`res-${cert.id}`}
                          className="bg-white/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-875 rounded-2xl p-5"
                        >
                          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-875 mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-slate-250 text-sm">{cert.title}</h4>
                            <span className="text-[9px] font-mono bg-blue-105 dark:bg-blue-950/20 text-blue-755 dark:text-blue-400 px-2 py-0.5 rounded">
                              {cert.provider}
                            </span>
                          </div>
                          <ul className="space-y-2.5">
                            {certResources.map((res, i) => (
                              <li key={i} className="flex justify-between items-center bg-white/70 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-900">
                                <span className="text-xs text-slate-750 dark:text-slate-300 font-medium">{res.name}</span>
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  Open Link ↗
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Career Roadmap Timeline */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>🗺️</span> iii. Target Career Roadmap
                  </h3>

                  <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 relative">
                    <div className="absolute left-[27px] top-[40px] bottom-[40px] w-0.5 bg-slate-200 dark:bg-slate-800"></div>

                    <div className="space-y-8">
                      {/* Step 1 */}
                      <div className="flex gap-5 relative">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-50 dark:border-slate-950 flex-shrink-0 z-10"></div>
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase text-emerald-500">Step 1: Foundational Prerequisites</span>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">Ecosystem Basics</h4>
                          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 max-w-xl">
                            Gain experience in Linux scripting, basic command terminal tools, Git version control, and primary programming languages.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-5 relative">
                        <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-50 dark:border-slate-950 flex-shrink-0 z-10 animate-pulse"></div>
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase text-blue-500">Step 2: Hands-on Preparation</span>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">Study Training Course Tracks</h4>
                          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 max-w-xl">
                            Study the recommended Coursera or Udemy exam courses. Construct small laboratory projects matching typical certification requirements.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-5 relative">
                        <div className="w-6 h-6 rounded-full bg-slate-350 dark:bg-slate-850 border-4 border-slate-50 dark:border-slate-950 flex-shrink-0 z-10"></div>
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-555 dark:text-slate-450">Step 3: Certification Exam Milestones</span>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">Book & Pass Recommendations</h4>
                          <div className="mt-1.5 flex flex-col gap-1.5">
                            {recommendations.recommended_certs.map((c, idx) => (
                              <div key={idx} className="text-xs text-slate-750 dark:text-slate-300 font-semibold flex items-center gap-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
                                  {idx + 1}
                                </span>
                                {c.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-5 relative">
                        <div className="w-6 h-6 rounded-full bg-slate-350 dark:bg-slate-850 border-4 border-slate-50 dark:border-slate-950 flex-shrink-0 z-10"></div>
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-555 dark:text-slate-450">Step 4: Career Landing Target</span>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-0.5">Apply for Professional Roles</h4>
                          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 max-w-xl">
                            Deploy your credential validation badges on GitHub/LinkedIn. Build larger cloud/AI sandbox proof-of-concepts, and interview for target tech openings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // INTERACTIVE QUIZ QUESTIONS
              <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl animate-fade-in-up">
                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 mb-8">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(quizStep / 4) * 100}%` }}
                  ></div>
                </div>

                {/* Step 1: Track selection */}
                {quizStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Question 1 of 4</span>
                      <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">What is your target career track?</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'Cloud Architect', name: 'Cloud Architect', desc: 'Design scalable, highly-available systems' },
                        { id: 'DevOps Engineer', name: 'DevOps Engineer', desc: 'Deploy pipelines & configure infrastructure' },
                        { id: 'Machine Learning / AI Engineer', name: 'Machine Learning / AI Engineer', desc: 'Build AI models, LLMs, and neural tracks' },
                        { id: 'Data Engineer', name: 'Data Engineer', desc: 'Configure data pipelines, analytics, & stores' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { handleSelectQuizAnswer('track', option.id); }}
                          className={`p-5 rounded-2xl text-left border transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                            quizAnswers.track === option.id
                              ? 'bg-blue-600/10 border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-875 hover:border-slate-300 dark:hover:border-slate-800 text-slate-700 dark:text-slate-350'
                          }`}
                        >
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Experience level */}
                {quizStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Question 2 of 4</span>
                      <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">What is your current level of experience in this field?</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'Beginner', name: 'Beginner / Student', desc: 'No active production cloud experience, looking to get started' },
                        { id: 'Intermediate', name: 'Intermediate Engineer', desc: '1-3 years of programming or infrastructure setup' },
                        { id: 'Advanced', name: 'Advanced / Professional', desc: '3+ years of building and managing production services' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { handleSelectQuizAnswer('level', option.id); }}
                          className={`p-5 rounded-2xl text-left border transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                            quizAnswers.level === option.id
                              ? 'bg-blue-600/10 border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-875 hover:border-slate-300 dark:hover:border-slate-800 text-slate-700 dark:text-slate-350'
                          }`}
                        >
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Ecosystem provider */}
                {quizStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Question 3 of 4</span>
                      <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">Which primary cloud provider/tech ecosystem do you prefer?</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'Google Cloud', name: 'Google Cloud Platform (GCP)', desc: 'Best for Vertex AI, BigQuery, and Kubernetes' },
                        { id: 'Amazon Web Services', name: 'Amazon Web Services (AWS)', desc: 'Widest industry adoption and specialized specialties' },
                        { id: 'Microsoft Azure', name: 'Microsoft Azure', desc: 'Best for corporate IT integration & Open AI services' },
                        { id: 'Vendor-Neutral', name: 'Multi-Cloud / Vendor-Neutral', desc: 'Kubernetes developer (CKAD) or general framework tracks' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { handleSelectQuizAnswer('provider', option.id); }}
                          className={`p-5 rounded-2xl text-left border transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                            quizAnswers.provider === option.id
                              ? 'bg-blue-600/10 border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-875 hover:border-slate-300 dark:hover:border-slate-800 text-slate-700 dark:text-slate-350'
                          }`}
                        >
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Budget range */}
                {quizStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Question 4 of 4</span>
                      <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mt-1">What is your learning budget for certification exams?</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'Free', name: 'Free Only', desc: 'Only search paths with $0 examination fees' },
                        { id: 'Under $150', name: 'Under $150', desc: 'Affordable associate-level certifications' },
                        { id: 'Any Price', name: 'Any Price Range', desc: 'Include advanced and specialty architect credentials' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => { handleSelectQuizAnswer('budget', option.id); }}
                          className={`p-5 rounded-2xl text-left border transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                            quizAnswers.budget === option.id
                              ? 'bg-blue-600/10 border-blue-500 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-875 hover:border-slate-300 dark:hover:border-slate-800 text-slate-700 dark:text-slate-350'
                          }`}
                        >
                          <h4 className="font-bold text-sm">{option.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-850 mt-8 pt-6">
                  {quizStep > 1 ? (
                    <button
                      onClick={handlePrevStep}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-205 text-slate-650 dark:text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {quizStep < 4 ? (
                    <button
                      onClick={handleNextStep}
                      disabled={
                        (quizStep === 1 && !quizAnswers.track) ||
                        (quizStep === 2 && !quizAnswers.level) ||
                        (quizStep === 3 && !quizAnswers.provider)
                      }
                      className="bg-blue-600 hover:bg-blue-755 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateRecommendations}
                      disabled={!quizAnswers.budget}
                      className="bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Analyze & Recommend ✨
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History panel */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-605 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                My Path Tracks History
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                Browse and reload previously generated certification roadmaps.
              </p>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-550">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-xs">Loading history tracks...</p>
              </div>
            ) : savedPaths.length === 0 ? (
              <div className="text-center py-16 bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 flex flex-col items-center">
                <span className="text-4xl mb-4">🗺️</span>
                <h3 className="font-bold text-lg text-slate-850 dark:text-slate-200 mb-2">No History Saved</h3>
                <p className="text-slate-505 dark:text-slate-400 text-xs max-w-sm mb-6">
                  You haven't completed any questionnaires yet. Head to "Search Certification" to create one.
                </p>
                <button 
                  onClick={() => { setActiveTab('quiz'); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-md cursor-pointer"
                >
                  Start Questionnaire
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPaths.map((path, idx) => (
                  <div 
                    key={path.id || idx} 
                    className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:bg-slate-900/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
                  >
                    <div>
                      <span className="text-[9px] font-mono bg-blue-50 dark:bg-blue-955/20 text-blue-650 dark:text-blue-400 px-2 py-0.5 rounded">
                        Roadmap Record
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mt-2">{path.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 font-mono">
                        <span>📅</span> Saved on {new Date(path.searched_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => { handleLoadSavedTrack(path); }}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 font-bold text-xs px-4 py-2.5 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      Reload Path
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Info panel */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                User Profile Information
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                Manage your credentials and personal workspace records.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 sm:items-center pb-6 border-b border-slate-200 dark:border-slate-850">
                <div className="w-20 h-20 rounded-full bg-indigo-655 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{user?.email?.split('@')[0]}</h3>
                  <p className="text-xs font-mono text-slate-500">{user?.email}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-450 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                    Account Status: Verified Supabase Client
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Primary Target Career Role
                  </label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={userProfile.title}
                      onChange={(e) => { setUserProfile(prev => ({ ...prev, title: e.target.value })); }}
                      className="w-full max-w-md bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-750 dark:text-slate-200">{userProfile.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Current Skills Summary
                  </label>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={userProfile.skills}
                      onChange={(e) => { setUserProfile(prev => ({ ...prev, skills: e.target.value })); }}
                      className="w-full max-w-md bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.split(',').map((s, i) => (
                        <span key={i} className="text-xs bg-blue-50 dark:bg-blue-955/20 text-blue-700 dark:text-blue-400 border border-blue-150 dark:border-blue-950/40 px-2.5 py-1 rounded-md font-semibold">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex gap-3">
                  {isEditingProfile ? (
                    <>
                      <button 
                        onClick={() => { setIsEditingProfile(false); }}
                        className="bg-emerald-605 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Save Profile
                      </button>
                      <button 
                        onClick={() => { setIsEditingProfile(false); }}
                        className="bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setIsEditingProfile(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings panel */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                Dashboard Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                Adjust workspace styling parameters and system configuration settings.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-xl space-y-6">
              {/* Theme Settings */}
              <div className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-slate-850">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Theme Mode</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle between dark mode and light mode.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-350 font-bold text-xs px-4 py-2.5 rounded-lg hover:scale-102 transition-all cursor-pointer"
                >
                  Active: {localTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                </button>
              </div>

              {/* Account Stats */}
              <div className="flex justify-between items-center pb-5 border-b border-slate-200 dark:border-slate-850">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">Integration Database</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Check database connection credentials.</p>
                </div>
                <span className="text-xs font-mono bg-emerald-50 dark:bg-emerald-955/20 text-emerald-650 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/40 px-3 py-1 rounded-lg">
                  Supabase Project: 10007875 Active
                </span>
              </div>

              {/* Danger Zone */}
              <div className="space-y-3">
                <h4 className="font-bold text-red-655 dark:text-red-400 text-sm">Danger Zone</h4>
                <div className="flex justify-between items-center p-4 bg-red-50/50 dark:bg-red-955/10 border border-red-150 dark:border-red-900/20 rounded-2xl">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Clear Roadmap History</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Permanently delete all saved roadmap history logs.</p>
                  </div>
                  <button 
                    onClick={() => { alert("Roadmap clearing mock triggered."); }}
                    className="bg-red-600 hover:bg-red-755 text-white font-bold text-[10px] px-3 py-2 rounded-lg cursor-pointer transition-all"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
