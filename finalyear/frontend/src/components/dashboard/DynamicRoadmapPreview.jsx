import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Map, CheckCircle, Circle, Clock, ArrowRight } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';
import { useCountUp } from '../../hooks/useCountUp';

const DynamicRoadmapPreview = () => {
  const { hasData, roadmap, bestMatch } = useAnalysis();

  if (!hasData || !roadmap?.steps?.length) return null;

  const steps = roadmap.steps || [];
  const completed = roadmap.completed_steps || 0;
  const total = roadmap.total_steps || steps.length;
  const remaining = roadmap.total_duration_weeks || 0;
  const progressPct = Math.round((completed / Math.max(total, 1)) * 100);
  const animatedPct = useCountUp(progressPct, 1500);

  // Determine level
  const getLevel = () => {
    if (progressPct >= 80) return { label: 'Advanced', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (progressPct >= 40) return { label: 'Intermediate', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    return { label: 'Beginner', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' };
  };
  const level = getLevel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-20"
        style={{ background: 'var(--gradient-accent)' }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Career Roadmap
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Path to <strong style={{ color: 'var(--text-primary)' }}>{roadmap.career || bestMatch?.title}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge" style={{ background: level.bg, color: level.color, border: `1px solid ${level.color}25` }}>
              {level.label}
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
              <Clock size={10} className="inline mr-1" />
              {remaining}w left
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {completed}/{total} steps completed
            </span>
            <span className="text-sm font-black" style={{ color: level.color }}>{animatedPct}%</span>
          </div>
          <div className="progress-track" style={{ height: '8px' }}>
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.5, delay: 0.3 }}
              style={{ height: '8px' }}
            />
          </div>
        </div>

        {/* Steps Preview */}
        <div className="space-y-2 mb-4">
          {steps.slice(0, 5).map((step, i) => (
            <motion.div
              key={step.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
              style={{
                background: step.is_completed ? 'rgba(52,211,153,0.06)' : 'rgba(15,23,42,0.3)',
                border: `1px solid ${step.is_completed ? 'rgba(52,211,153,0.15)' : 'transparent'}`,
              }}
            >
              {step.is_completed ? (
                <CheckCircle size={16} style={{ color: '#34d399' }} className="shrink-0" />
              ) : (
                <Circle size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate"
                  style={{ color: step.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: step.is_completed ? 'line-through' : 'none' }}>
                  {step.title}
                </p>
                {!step.is_completed && step.skills?.length > 0 && (
                  <div className="flex gap-1 mt-1 overflow-hidden">
                    {step.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', fontSize: '10px' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
                {step.duration_weeks}w
              </span>
            </motion.div>
          ))}
          {steps.length > 5 && (
            <p className="text-xs text-center py-1" style={{ color: 'var(--text-muted)' }}>
              +{steps.length - 5} more steps
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          to="/roadmap"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Map size={16} />
          View Full Roadmap
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
};

export default DynamicRoadmapPreview;
