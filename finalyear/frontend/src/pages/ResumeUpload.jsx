import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, RefreshCw, Zap, ArrowRight, BrainCircuit, Target, AlertTriangle, BookOpen, ExternalLink, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { useAnalysis } from '../context/AnalysisContext';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5 }
});

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { updateAnalysis } = useAnalysis();

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(null); }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) { setFile(e.dataTransfer.files[0]); setError(null); }
  };

  const simulateProgress = () => {
    const steps = [
      { p: 15, l: 'Reading document...' }, { p: 30, l: 'Extracting text...' },
      { p: 50, l: 'Running NLP analysis...' }, { p: 70, l: 'Matching skills...' },
      { p: 85, l: 'Finding career matches...' }, { p: 95, l: 'Building roadmap...' },
    ];
    steps.forEach(({ p, l }, i) => { setTimeout(() => { setProgress(p); setProgressLabel(l); }, i * 600); });
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true); setProgress(0); setError(null);
    simulateProgress();
    try {
      const response = await resumeAPI.upload(file);
      setProgress(100); setProgressLabel('Analysis complete!');
      setTimeout(() => {
        setResult(response.data);
        // Push to global AnalysisContext so dashboard updates instantly
        updateAnalysis(response.data);
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      setProgress(0); setProgressLabel('');
      // Show REAL error — NO mock/hardcoded data
      setError(err.response?.data?.detail || 'Resume analysis failed. Please check that the backend server is running and try again.');
    } finally {
      setTimeout(() => setIsUploading(false), 600);
    }
  };

  const handleReset = () => { setFile(null); setResult(null); setError(null); setProgress(0); };

  const readinessColor = (r) => {
    if (r === 'Job Ready') return 'var(--accent-emerald)';
    if (r === 'Almost Ready') return 'var(--accent-cyan)';
    if (r === 'On Track') return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const tabs = [
    { id: 'skills', label: 'Detected Skills', icon: <Zap size={14} /> },
    { id: 'careers', label: 'Career Matches', icon: <Target size={14} /> },
    { id: 'missing', label: 'Missing Skills', icon: <AlertTriangle size={14} /> },
    { id: 'recs', label: 'Recommendations', icon: <BookOpen size={14} /> },
  ];

  const renderSkillsTab = () => (
    <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {Object.entries(result.skill_categories || {}).map(([cat, skills]) => (
        <div key={cat} className="glass-card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>{cat} ({skills.length})</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <motion.span key={s.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="skill-tag skill-tag-emerald">
                <CheckCircle size={12} /> {s.name}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );

  const renderCareersTab = () => (
    <motion.div key="careers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
      {(result.alternate_careers || []).map((c, i) => (
        <motion.div key={i} {...fadeUp(i)} className="glass-card p-5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{c.title}</h4>
            <div className="flex gap-2 mt-1.5">
              <span className="badge badge-info">{c.avg_salary}</span>
              <span className="badge badge-success">{c.demand_level}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black" style={{ color: readinessColor(c.readiness) }}>{c.match_score}%</div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{c.readiness}</span>
          </div>
        </motion.div>
      ))}
      {(!result.alternate_careers || result.alternate_careers.length === 0) && (
        <div className="glass-card p-6 text-center"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No alternate career matches.</p></div>
      )}
    </motion.div>
  );

  const renderMissingTab = () => (
    <motion.div key="missing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Skills needed for <strong style={{ color: 'var(--text-primary)' }}>{result.best_match?.title}</strong>:</p>
      {result.best_match?.missing_essential?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-rose)' }}>Essential</h4>
          <div className="flex flex-wrap gap-2">{result.best_match.missing_essential.map(s => <span key={s} className="skill-tag skill-tag-rose">{s}</span>)}</div>
        </div>
      )}
      {result.best_match?.missing_important?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-amber)' }}>Important</h4>
          <div className="flex flex-wrap gap-2">{result.best_match.missing_important.map(s => <span key={s} className="skill-tag skill-tag-amber">{s}</span>)}</div>
        </div>
      )}
      {result.best_match?.missing_recommended?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Recommended</h4>
          <div className="flex flex-wrap gap-2">{result.best_match.missing_recommended.map(s => <span key={s} className="skill-tag skill-tag-indigo">{s}</span>)}</div>
        </div>
      )}
      {(!result.best_match?.missing_skills || result.best_match.missing_skills.length === 0) && (
        <p className="text-sm" style={{ color: 'var(--accent-emerald)' }}>🎉 You have all required skills!</p>
      )}
    </motion.div>
  );

  const renderRecsTab = () => (
    <motion.div key="recs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {result.recommendations?.courses?.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-indigo)' }}>📚 Courses</h4>
          <div className="space-y-2">
            {result.recommendations.courses.slice(0, 8).map((c, i) => (
              <a key={i} href={c.link} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group">
                <div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.platform} • {c.skill}</p></div>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100" style={{ color: 'var(--accent-indigo)' }} />
              </a>
            ))}
          </div>
        </div>
      )}
      {result.recommendations?.videos?.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-rose)' }}>🎬 YouTube Videos</h4>
          <div className="space-y-2">
            {result.recommendations.videos.slice(0, 8).map((v, i) => (
              <a key={i} href={v.link} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group">
                <div><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>YouTube • {v.skill}</p></div>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100" style={{ color: 'var(--accent-rose)' }} />
              </a>
            ))}
          </div>
        </div>
      )}
      {result.recommendations?.projects?.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent-emerald)' }}>🚀 Projects</h4>
          <div className="space-y-2">
            {result.recommendations.projects.map((p, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
                <div className="flex gap-1.5 mt-2">{(p.technologies || []).slice(0, 4).map(t => (<span key={t} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>{t}</span>))}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 px-4">
      <motion.div {...fadeUp(0)} className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>AI Resume <span className="gradient-text">Analyzer</span></h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Upload your resume and our NLP engine will extract your exact skills, match careers, and build your roadmap.</p>
      </motion.div>
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 flex items-start gap-3" style={{ borderColor: 'rgba(251,113,133,0.3)' }}>
                <XCircle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-rose)' }} />
                <div className="flex-1"><h4 className="text-sm font-bold mb-1" style={{ color: 'var(--accent-rose)' }}>Analysis Failed</h4><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p></div>
              </motion.div>
            )}
            <motion.div {...fadeUp(1)} className="glass-panel p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px]" style={{ background: 'rgba(99,102,241,0.08)' }} />
              {!isUploading ? (
                <div className="relative z-10 space-y-6">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all group" style={{ borderColor: file ? 'var(--accent-indigo)' : 'var(--border-subtle)', background: file ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                    <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}><UploadCloud className="w-10 h-10 group-hover:scale-110 transition-transform" /></div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Drop your resume here</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>or click to browse • PDF supported</p>
                    {file && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent-indigo)' }}><FileText size={16} /><span className="font-bold text-sm">{file.name}</span></motion.div>)}
                  </motion.div>
                  <motion.button whileHover={file ? { scale: 1.01 } : {}} whileTap={file ? { scale: 0.99 } : {}} onClick={handleUpload} disabled={!file}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: file ? 'var(--gradient-accent)' : 'rgba(30,41,59,0.5)', color: 'white', boxShadow: file ? '0 4px 20px rgba(99,102,241,0.3)' : 'none' }}><BrainCircuit className="w-5 h-5" /> Analyze with AI</motion.button>
                </div>
              ) : (
                <div className="relative z-10 text-center py-8">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--gradient-accent)' }}><BrainCircuit className="w-10 h-10 text-white" /></motion.div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{progressLabel}</h3>
                  <div className="max-w-sm mx-auto mt-4"><div className="progress-track"><motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} /></div><p className="text-sm mt-2 font-semibold" style={{ color: 'var(--accent-indigo)' }}>{progress}%</p></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-panel p-6 md:p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.05), rgba(99,102,241,0.05))' }} />
              <div className="relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--accent-emerald)' }}><CheckCircle className="w-8 h-8" /></motion.div>
                <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Analysis Complete!</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Found <strong style={{ color: 'var(--accent-indigo)' }}>{result.skill_count || result.skills?.length || 0}</strong> skills across {Object.keys(result.skill_categories || {}).length} categories</p>
              </div>
            </div>
            {result.best_match && (
              <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-accent)' }} />
                <div className="absolute inset-[1px] rounded-[calc(var(--radius-xl)-1px)]" style={{ background: 'var(--bg-secondary)' }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-indigo)' }}>🏆 Best Career Match</p>
                    <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{result.best_match.title}</h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{result.best_match.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold">
                      <span className="badge badge-success">{result.best_match.demand_level} Demand</span>
                      <span className="badge badge-info">{result.best_match.avg_salary}</span>
                      <span className="badge badge-warning">↑ {result.best_match.growth_rate} Growth</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <div className="text-4xl font-black" style={{ color: readinessColor(result.best_match.readiness) }}>{result.best_match.match_score}%</div>
                    <span className="text-xs font-bold mt-1 px-3 py-1 rounded-full" style={{ background: `${readinessColor(result.best_match.readiness)}15`, color: readinessColor(result.best_match.readiness) }}>{result.best_match.readiness}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(15,23,42,0.5)' }}>
              {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all" style={{ background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent', color: activeTab === tab.id ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>{tab.icon} {tab.label}</button>))}
            </div>
            <AnimatePresence mode="wait">
              {activeTab === 'skills' && renderSkillsTab()}
              {activeTab === 'careers' && renderCareersTab()}
              {activeTab === 'missing' && renderMissingTab()}
              {activeTab === 'recs' && renderRecsTab()}
            </AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.button {...fadeUp(5)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => navigate('/roadmap')} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2" style={{ background: 'var(--gradient-accent)', color: 'white', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>View Full Roadmap <ArrowRight className="w-5 h-5" /></motion.button>
              <motion.button {...fadeUp(6)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleReset} className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', border: '1px solid rgba(99,102,241,0.3)' }}><RefreshCw className="w-5 h-5" /> Analyze Another</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeUpload;
