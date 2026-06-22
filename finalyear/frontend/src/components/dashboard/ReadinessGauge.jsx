import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';
import { useAnalysis } from '../../context/AnalysisContext';

const GaugeMeter = ({ score, label, size = 180 }) => {
  const animatedScore = useCountUp(score, 1800);
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (val) => {
    if (val >= 80) return '#34d399';
    if (val >= 60) return '#22d3ee';
    if (val >= 40) return '#fbbf24';
    return '#fb7185';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="rgba(30,41,59,0.8)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Animated fill arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.8s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${color}50)`,
          }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="28"
          fontWeight="900"
          fontFamily="Inter, system-ui"
        >
          {animatedScore}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          fill={color}
          fontSize="10"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.1em"
          fontFamily="Inter, system-ui"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

const ReadinessGauge = () => {
  const { hasData, insights, bestMatch } = useAnalysis();

  const readinessScore = insights?.career_readiness_score || 0;
  const readinessLabel = insights?.career_readiness_label || 'N/A';
  const atsScore = insights?.ats_score || 0;
  const resumeStrength = insights?.resume_strength || 0;
  const resumeStrLabel = insights?.resume_strength_label || 'N/A';

  if (!hasData) return null;

  const metrics = [
    { label: 'Career Readiness', score: readinessScore, sublabel: readinessLabel },
    { label: 'ATS Compatibility', score: atsScore, sublabel: atsScore >= 70 ? 'Optimized' : 'Needs Work' },
    { label: 'Resume Strength', score: resumeStrength, sublabel: resumeStrLabel },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
        Readiness Gauges
      </h3>
      <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Composite scores based on your skills, resume quality & career alignment
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex flex-col items-center p-3 rounded-xl"
            style={{ background: 'rgba(15,23,42,0.3)' }}
          >
            <GaugeMeter score={m.score} label={m.sublabel} size={160} />
            <p className="text-xs font-bold mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
              {m.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReadinessGauge;
