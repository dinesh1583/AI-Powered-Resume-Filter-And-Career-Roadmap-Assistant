import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import {
  PersonalizedGreeting,
  QuickStats,
  AIInsightsPanel,
  SkillRadarChart,
  ReadinessGauge,
  CareerMatchEngine,
  SkillGapHeatmap,
  DynamicRoadmapPreview,
  QuickActions,
} from '../components/dashboard';

const Dashboard = () => {
  const { loading, hasData } = useAnalysis();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={40} style={{ color: 'var(--accent-indigo)' }} />
        </motion.div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading your career intelligence...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Personalized Greeting */}
      <PersonalizedGreeting />

      {/* 2. Upload CTA or Quick Actions */}
      <QuickActions />

      {/* 3. Animated Stats Grid */}
      <QuickStats />

      {hasData && (
        <>
          {/* 4. Readiness Gauges */}
          <ReadinessGauge />

          {/* 5. AI Insights Panel */}
          <AIInsightsPanel />

          {/* 6. Charts Row: Radar + Skill Gap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkillRadarChart />
            <SkillGapHeatmap />
          </div>

          {/* 7. Career Match Engine */}
          <CareerMatchEngine />

          {/* 8. Roadmap Preview */}
          <DynamicRoadmapPreview />
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
