import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, BookOpen, ExternalLink, ChevronDown, ChevronUp, Award, Loader2, TrendingUp, Zap } from 'lucide-react';
import { roadmapAPI } from '../services/api';
import { useAnalysis } from '../context/AnalysisContext';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5 }
});

const Roadmap = () => {
  const { hasData: hasAnalysis, roadmap: ctxRoadmap, bestMatch, recommendations, insights } = useAnalysis();
  const [data, setData] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStep, setUpdatingStep] = useState(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    setLoading(true);

    // Try fetching from backend API first
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        const res = await roadmapAPI.get(user.email);
        if (res.data && res.data.steps && res.data.steps.length > 0) {
          setData({
            career: res.data.target_career || 'Unknown Career',
            steps: res.data.steps || [],
            total_steps: res.data.total_steps || res.data.steps.length,
            completed_steps: res.data.completed_steps || res.data.steps.filter(s => s.is_completed).length,
            total_duration_weeks: res.data.total_duration_weeks || 0,
            projects: res.data.projects || [],
            match_score: res.data.match_percentage || 0,
            recommendations: res.data.recommendations || {},
          });
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('No roadmap from API, checking localStorage');
    }

    // Fallback to AnalysisContext data
    if (hasAnalysis && ctxRoadmap && ctxRoadmap.steps && ctxRoadmap.steps.length > 0) {
      setData({
        career: ctxRoadmap.career || bestMatch?.title || 'Unknown Career',
        steps: ctxRoadmap.steps || [],
        total_steps: ctxRoadmap.total_steps || 0,
        completed_steps: ctxRoadmap.completed_steps || 0,
        total_duration_weeks: ctxRoadmap.total_duration_weeks || 0,
        projects: ctxRoadmap.projects || recommendations?.projects || [],
        match_score: bestMatch?.match_score || 0,
        readiness: bestMatch?.readiness || insights?.career_readiness_label || 'Getting Started',
      });
    } else {
      // Last fallback: localStorage
      const stored = localStorage.getItem('analysisResult');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const roadmap = parsed.roadmap;
          if (roadmap && roadmap.steps && roadmap.steps.length > 0) {
            setData({
              career: roadmap.career || parsed.best_match?.title || 'Unknown Career',
              steps: roadmap.steps || [],
              total_steps: roadmap.total_steps || 0,
              completed_steps: roadmap.completed_steps || 0,
              total_duration_weeks: roadmap.total_duration_weeks || 0,
              projects: roadmap.projects || parsed.recommendations?.projects || [],
              match_score: parsed.best_match?.match_score || 0,
              readiness: parsed.best_match?.readiness || 'Getting Started',
            });
          }
        } catch {}
      }
    }
    setLoading(false);
  };

  const handleToggleStep = async (stepId, currentStatus) => {
    setUpdatingStep(stepId);
    try {
      await roadmapAPI.updateStep({ step_id: stepId, is_completed: !currentStatus });
      // Update local state
      setData(prev => {
        if (!prev) return prev;
        const updatedSteps = prev.steps.map(s =>
          s.id === stepId ? { ...s, is_completed: !currentStatus } : s
        );
        return {
          ...prev,
          steps: updatedSteps,
          completed_steps: updatedSteps.filter(s => s.is_completed).length,
        };
      });
    } catch (err) {
      console.error('Failed to update step:', err);
    }
    setUpdatingStep(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={40} style={{ color: 'var(--accent-indigo)' }} />
        </motion.div>
      </div>
    );
  }

  if (!data) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-16 px-4 text-center">
      <div className="glass-panel p-12">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>No Roadmap Yet</h2>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Upload your resume to get a personalized career roadmap with step-by-step learning paths.</p>
        <a href="/upload" className="btn-primary inline-flex items-center gap-2">Upload Resume <ExternalLink size={16} /></a>
      </div>
    </motion.div>
  );

  const progressPercent = data.total_steps > 0 ? Math.round((data.completed_steps / data.total_steps) * 100) : 0;

  const toggleStep = (id) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="glass-panel p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px]" style={{ background: 'rgba(99,102,241,0.08)' }} />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent-indigo)' }}>
                <Zap size={12} className="inline mr-1" /> Your Career Roadmap
              </p>
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{data.career}</h1>
              {(data.readiness || insights?.career_readiness_label) && (
                <span className="inline-flex items-center gap-1 text-xs font-bold mt-1 px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--accent-emerald)' }}>
                  <TrendingUp size={12} /> {data.readiness || insights?.career_readiness_label}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-indigo)' }}>{data.match_score}%</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Match</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(34,211,238,0.1)' }}>
                <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-cyan)' }}>{data.total_duration_weeks}w</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Duration</div>
              </div>
              {insights?.hiring_probability && (
                <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-emerald)' }}>{insights.hiring_probability}%</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Hire Prob.</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="progress-track flex-1">
              <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
            <span className="text-sm font-bold shrink-0 tabular-nums" style={{ color: 'var(--accent-indigo)' }}>
              {data.completed_steps}/{data.total_steps} Steps
            </span>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'var(--border-subtle)' }} />

        {data.steps.map((step, index) => (
          <motion.div key={step.id} {...fadeUp(index + 1)} className="relative pl-16 pb-8 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => handleToggleStep(step.id, step.is_completed)}
              style={{
                background: step.is_completed ? 'var(--accent-emerald)' : 'var(--bg-secondary)',
                border: step.is_completed ? 'none' : '2px solid var(--border-subtle)',
                boxShadow: step.is_completed ? '0 0 12px rgba(52,211,153,0.3)' : 'none',
                opacity: updatingStep === step.id ? 0.5 : 1,
              }}>
              {step.is_completed && <CheckCircle className="w-3 h-3 text-white" />}
            </div>

            <div className="glass-card p-5 cursor-pointer" onClick={() => toggleStep(step.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ background: step.is_completed ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.1)', color: step.is_completed ? 'var(--accent-emerald)' : 'var(--accent-indigo)' }}>
                      Step {step.order || index + 1}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {step.duration_weeks}w
                    </span>
                    {step.is_completed && <span className="badge badge-success">✓ Done</span>}
                  </div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                </div>
                <div className="ml-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {expandedStep === step.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {step.skills.map(skill => {
                  const acquired = (step.acquired_in_step || []).includes(skill);
                  return (
                    <span key={skill} className={`skill-tag ${acquired ? 'skill-tag-emerald' : 'skill-tag-rose'}`}>
                      {acquired ? <CheckCircle size={10} /> : <Circle size={10} />} {skill}
                    </span>
                  );
                })}
              </div>

              {/* Expanded content */}
              {expandedStep === step.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {step.resources && step.resources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-indigo)' }}>
                        📚 Resources
                      </h4>
                      {step.resources.map((res, i) => (
                        <a key={i} href={res.link} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group text-sm">
                          <span className="text-xs px-1.5 py-0.5 rounded uppercase font-bold"
                            style={{
                              background: res.type === 'youtube' ? 'rgba(251,113,133,0.1)' : 'rgba(99,102,241,0.1)',
                              color: res.type === 'youtube' ? 'var(--accent-rose)' : 'var(--accent-indigo)'
                            }}>
                            {res.type}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>{res.title}</span>
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 ml-auto" style={{ color: 'var(--text-muted)' }} />
                        </a>
                      ))}
                    </div>
                  )}
                  {step.missing_in_step && step.missing_in_step.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-amber)' }}>⚠️ Skills to Learn</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {step.missing_in_step.map(s => <span key={s} className="skill-tag skill-tag-amber">{s}</span>)}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <motion.div {...fadeUp(data.steps.length + 1)} className="mt-10">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award size={20} style={{ color: 'var(--accent-amber)' }} /> Portfolio Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.projects.map((project, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
                  <span className="badge badge-info">{project.difficulty}</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(project.technologies || []).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Roadmap;
