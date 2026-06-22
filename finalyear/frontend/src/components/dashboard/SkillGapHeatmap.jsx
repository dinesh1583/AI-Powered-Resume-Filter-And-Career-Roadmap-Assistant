import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAnalysis } from '../../context/AnalysisContext';
import { CheckCircle, XCircle } from 'lucide-react';

const SkillGapHeatmap = () => {
  const { hasData, skills, bestMatch, skillCategories } = useAnalysis();

  const heatmapData = useMemo(() => {
    if (!hasData) return [];

    const acquiredSet = new Set((skills || []).map(s => s.toLowerCase()));
    const missingEssential = new Set((bestMatch?.missing_essential || []).map(s => s.toLowerCase()));
    const missingImportant = new Set((bestMatch?.missing_important || []).map(s => s.toLowerCase()));
    const missingRecommended = new Set((bestMatch?.missing_recommended || []).map(s => s.toLowerCase()));

    // Build a combined list of all skills (acquired + missing)
    const allSkills = [];

    // Add acquired skills
    for (const skill of skills) {
      allSkills.push({
        name: skill,
        status: 'acquired',
        level: 'high',
        color: '#34d399',
        bg: 'rgba(52,211,153,0.15)',
        border: 'rgba(52,211,153,0.3)',
      });
    }

    // Add missing essential
    for (const skill of (bestMatch?.missing_essential || [])) {
      allSkills.push({
        name: skill,
        status: 'missing',
        level: 'essential',
        color: '#fb7185',
        bg: 'rgba(251,113,133,0.15)',
        border: 'rgba(251,113,133,0.3)',
      });
    }

    // Add missing important
    for (const skill of (bestMatch?.missing_important || [])) {
      allSkills.push({
        name: skill,
        status: 'missing',
        level: 'important',
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.15)',
        border: 'rgba(251,191,36,0.3)',
      });
    }

    // Add missing recommended
    for (const skill of (bestMatch?.missing_recommended || [])) {
      allSkills.push({
        name: skill,
        status: 'missing',
        level: 'recommended',
        color: '#818cf8',
        bg: 'rgba(129,140,248,0.15)',
        border: 'rgba(129,140,248,0.3)',
      });
    }

    return allSkills;
  }, [hasData, skills, bestMatch]);

  if (!hasData || heatmapData.length === 0) return null;

  const acquired = heatmapData.filter(s => s.status === 'acquired');
  const missing = heatmapData.filter(s => s.status === 'missing');
  const coverage = Math.round((acquired.length / Math.max(heatmapData.length, 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Skill Gap Analysis
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: coverage >= 70 ? 'rgba(52,211,153,0.12)' : coverage >= 40 ? 'rgba(251,191,36,0.12)' : 'rgba(251,113,133,0.12)',
            color: coverage >= 70 ? '#34d399' : coverage >= 40 ? '#fbbf24' : '#fb7185',
          }}
        >
          {coverage}% Coverage
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Skills for <strong style={{ color: 'var(--text-primary)' }}>{bestMatch?.title || 'target career'}</strong> — {acquired.length} acquired, {missing.length} needed
      </p>

      {/* Coverage Progress */}
      <div className="mb-5">
        <div className="progress-track" style={{ height: '10px' }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${coverage}%` }}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{
              background: coverage >= 70
                ? 'linear-gradient(90deg, #34d399, #22d3ee)'
                : coverage >= 40
                ? 'linear-gradient(90deg, #fbbf24, #fb923c)'
                : 'linear-gradient(90deg, #fb7185, #f43f5e)',
              height: '10px',
            }}
          />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-4">
        {/* Acquired Skills */}
        {acquired.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={12} style={{ color: '#34d399' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#34d399' }}>
                Acquired ({acquired.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {acquired.map((skill, i) => (
                <motion.span
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default transition-all hover:scale-105"
                  style={{ background: skill.bg, color: skill.color, border: `1px solid ${skill.border}` }}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills by priority */}
        {missing.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={12} style={{ color: '#fb7185' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#fb7185' }}>
                Skills to Learn ({missing.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((skill, i) => (
                <motion.span
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.02 }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default transition-all hover:scale-105"
                  style={{ background: skill.bg, color: skill.color, border: `1px solid ${skill.border}` }}
                  title={`Priority: ${skill.level}`}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#fb7185' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Essential</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Important</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: '#818cf8' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Recommended</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SkillGapHeatmap;
