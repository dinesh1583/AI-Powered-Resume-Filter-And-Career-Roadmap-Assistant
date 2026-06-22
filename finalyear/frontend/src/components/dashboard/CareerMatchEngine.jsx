import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';

const demandColor = (level) => {
  const l = (level || '').toLowerCase();
  if (l === 'high' || l === 'very high') return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  if (l === 'medium') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  return { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' };
};

const readinessStyle = (r) => {
  if (r === 'Job Ready') return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  if (r === 'Almost Ready') return { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' };
  if (r === 'On Track') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  return { color: '#fb7185', bg: 'rgba(251,113,133,0.12)' };
};

const CareerCard = ({ career, rank, delay }) => {
  const [expanded, setExpanded] = useState(false);
  const readiness = readinessStyle(career.readiness);
  const demand = demandColor(career.demand_level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className="glass-card overflow-hidden group"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
            style={{ background: 'var(--gradient-accent)', color: 'white' }}>
            #{rank}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {career.title}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="badge" style={{ background: demand.bg, color: demand.color, border: `1px solid ${demand.color}25` }}>
                {career.demand_level} Demand
              </span>
              {career.avg_salary && career.avg_salary !== 'N/A' && (
                <span className="badge badge-info">{career.avg_salary}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: readiness.color }}>{career.match_score}%</div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: readiness.bg, color: readiness.color }}>
              {career.readiness}
            </span>
          </div>
          {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Description */}
              {career.description && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {career.description}
                </p>
              )}

              {/* Match Reason */}
              <div className="p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} style={{ color: 'var(--accent-emerald)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-emerald)' }}>Why You Match</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  You have {career.acquired_count || 0} of {career.total_skills || 0} required skills
                  ({career.match_score}% weighted match).
                  {career.growth_rate && career.growth_rate !== 'N/A' && ` This field is growing at ${career.growth_rate}.`}
                </p>
              </div>

              {/* Acquired Skills */}
              {career.acquired_skills?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-emerald)' }}>
                    ✓ Your Matching Skills ({career.acquired_skills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {career.acquired_skills.map(s => (
                      <span key={s} className="skill-tag skill-tag-emerald text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {career.missing_skills?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--accent-rose)' }}>
                    <AlertTriangle size={12} className="inline mr-1" />
                    Missing Skills ({career.missing_skills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {career.missing_essential?.map(s => (
                      <span key={s} className="skill-tag skill-tag-rose text-xs">{s}</span>
                    ))}
                    {career.missing_important?.map(s => (
                      <span key={s} className="skill-tag skill-tag-amber text-xs">{s}</span>
                    ))}
                    {career.missing_recommended?.map(s => (
                      <span key={s} className="skill-tag skill-tag-indigo text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Skill Coverage</span>
                  <span className="text-xs font-bold" style={{ color: readiness.color }}>{career.match_score}%</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${career.match_score}%` }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    style={{
                      background: `linear-gradient(90deg, ${readiness.color}, ${readiness.color}90)`,
                      boxShadow: `0 0 10px ${readiness.color}40`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CareerMatchEngine = () => {
  const { hasData, matchedCareers } = useAnalysis();

  if (!hasData || !matchedCareers.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Smart Career Matches
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Top {matchedCareers.length} careers matched to your skill profile
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <Target size={12} style={{ color: 'var(--accent-indigo)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--accent-indigo)' }}>{matchedCareers.length} Matches</span>
        </div>
      </div>
      {matchedCareers.map((career, i) => (
        <CareerCard key={career.title} career={career} rank={i + 1} delay={i} />
      ))}
    </motion.div>
  );
};

export default CareerMatchEngine;
