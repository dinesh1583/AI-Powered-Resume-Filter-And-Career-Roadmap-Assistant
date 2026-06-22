import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Lightbulb, DollarSign, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';

const TypingText = ({ text, speed = 15, delay = 0 }) => {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started || !text) return;
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return (
    <span>
      {displayed}
      {started && displayed.length < (text?.length || 0) && (
        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: 'var(--accent-indigo)' }} />
      )}
    </span>
  );
};

const InsightCard = ({ icon, title, items, color, bgColor, delay = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.12, duration: 0.5 }}
      className="glass-card overflow-hidden relative group"
    >
      {/* Glow border effect */}
      <div className="absolute inset-0 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 30px ${bgColor}` }}
      />
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: bgColor, color }}>
            {icon}
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <span className="badge" style={{ background: bgColor, color, border: `1px solid ${color}30` }}>
            {items.length}
          </span>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
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
            <div className="px-5 pb-5 space-y-2.5">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(15,23,42,0.3)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AIInsightsPanel = () => {
  const { hasData, insights, bestMatch } = useAnalysis();

  if (!hasData || !insights) return null;

  const mainInsight = insights.main_insight || '';
  const salaryPrediction = insights.salary_prediction || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Main AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-[var(--radius-xl)] p-px">
          <div className="absolute inset-0 rounded-[var(--radius-xl)] animate-gradient"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3), rgba(34,211,238,0.3), rgba(99,102,241,0.3))', backgroundSize: '300% 300%' }}
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-pulse-glow"
              style={{ background: 'var(--gradient-accent)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-indigo)' }}>
              AI Career Intelligence
            </h3>
            <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <TypingText text={mainInsight} speed={12} delay={400} />
          </p>

          {/* Salary Prediction */}
          {salaryPrediction.current_range && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-4 flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <DollarSign size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Current Range:</span>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-emerald)' }}>{salaryPrediction.current_range}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <TrendingUp size={14} style={{ color: 'var(--accent-violet)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Potential:</span>
                <span className="text-xs font-bold" style={{ color: 'var(--accent-violet)' }}>{salaryPrediction.potential_range}</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard
          icon={<TrendingUp size={18} />}
          title="Strengths"
          items={insights.strengths}
          color="#34d399"
          bgColor="rgba(52,211,153,0.12)"
          delay={1}
        />
        <InsightCard
          icon={<TrendingDown size={18} />}
          title="Areas to Improve"
          items={insights.weaknesses}
          color="#fb7185"
          bgColor="rgba(251,113,133,0.12)"
          delay={2}
        />
        <InsightCard
          icon={<Lightbulb size={18} />}
          title="AI Suggestions"
          items={insights.improvement_suggestions}
          color="#fbbf24"
          bgColor="rgba(251,191,36,0.12)"
          delay={3}
        />
      </div>
    </motion.div>
  );
};

export default AIInsightsPanel;
