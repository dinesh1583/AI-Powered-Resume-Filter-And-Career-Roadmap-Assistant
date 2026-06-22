import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AuthContext } from '../../App';
import { useAnalysis } from '../../context/AnalysisContext';

const PersonalizedGreeting = () => {
  const { user } = useContext(AuthContext);
  const { hasData, bestMatch, insights } = useAnalysis();

  const userName = user?.full_name || user?.email?.split('@')[0] || 'there';
  const firstName = userName.split(' ')[0];
  const readinessScore = insights?.career_readiness_score || 0;
  const readinessLabel = insights?.career_readiness_label || '';
  const careerTitle = bestMatch?.title || '';
  const motivational = insights?.motivational_message || '';

  const getSubtitle = () => {
    if (!hasData) return 'Upload your resume to unlock AI-powered career intelligence.';
    if (readinessScore >= 80) return `You're ${readinessScore}% ready for ${careerTitle} roles. You're industry-ready! 🚀`;
    if (readinessScore >= 60) return `You're ${readinessScore}% ready for ${careerTitle} roles. Almost there! 💪`;
    if (readinessScore >= 40) {
      const remaining = Math.ceil((60 - readinessScore) / 10);
      return `You're ${readinessScore}% ready for ${careerTitle} roles. Complete ${remaining} more skill areas to level up.`;
    }
    return `You're ${readinessScore}% ready for ${careerTitle} roles. Let's build your skills together!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
              Welcome, <span className="gradient-text">{firstName}</span> 👋
            </h1>
            {hasData && readinessLabel && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="badge badge-success flex items-center gap-1 text-xs"
              >
                <Sparkles size={10} />
                {readinessLabel}
              </motion.span>
            )}
          </div>
          <p className="text-sm md:text-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {getSubtitle()}
          </p>
          {hasData && motivational && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-medium mt-1"
              style={{ color: 'var(--accent-cyan)' }}
            >
              {motivational}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalizedGreeting;
