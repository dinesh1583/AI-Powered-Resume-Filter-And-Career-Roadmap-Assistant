import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAnalysis } from '../../context/AnalysisContext';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 text-xs" style={{ border: '1px solid var(--border-glow)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{d.domain}</p>
      <p style={{ color: 'var(--accent-indigo)' }}>Score: <strong>{d.score}%</strong></p>
      <p style={{ color: 'var(--text-muted)' }}>{d.matched}/{d.total} skills matched</p>
    </div>
  );
};

const SkillRadarChart = () => {
  const { hasData, insights, skillCategories } = useAnalysis();

  const radarData = useMemo(() => {
    if (!hasData) return [];

    // Use domain_scores from insights if available
    if (insights?.domain_scores?.length) {
      return insights.domain_scores
        .filter(d => d.score > 0)
        .slice(0, 8)
        .map(d => ({
          domain: d.domain.length > 14 ? d.domain.slice(0, 12) + '…' : d.domain,
          fullDomain: d.domain,
          score: d.score,
          matched: d.matched,
          total: d.total,
        }));
    }

    // Fallback: use skill categories
    return Object.entries(skillCategories).slice(0, 8).map(([cat, skills]) => ({
      domain: cat.length > 14 ? cat.slice(0, 12) + '…' : cat,
      fullDomain: cat,
      score: Math.min(100, skills.length * 20),
      matched: skills.length,
      total: Math.max(skills.length, 5),
    }));
  }, [hasData, insights, skillCategories]);

  if (!hasData || radarData.length < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
        Domain Coverage
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Your skill distribution across industry domains
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(100,116,139,0.15)" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              axisLine={false}
            />
            <Radar
              name="Coverage"
              dataKey="score"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SkillRadarChart;
