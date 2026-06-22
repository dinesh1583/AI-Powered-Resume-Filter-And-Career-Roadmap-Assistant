import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, Briefcase, Heart, Map, Zap, BrainCircuit, Sparkles } from 'lucide-react';
import { useAnalysis } from '../../context/AnalysisContext';

const UploadCTA = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15, duration: 0.5 }}
  >
    <Link to="/upload" className="block glass-card p-8 group relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))' }} />
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[50px] opacity-30"
        style={{ background: 'var(--gradient-accent)' }} />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--gradient-accent)', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}
        >
          <BrainCircuit className="w-10 h-10 text-white" />
        </motion.div>
        <div className="text-center md:text-left flex-1">
          <h3 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            Upload Your Resume
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Get AI-powered skill extraction, career matching, personalized roadmaps, and salary insights — all in seconds.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
            {['NLP Skill Detection', 'Career Matching', 'ATS Score', 'Salary Prediction'].map(f => (
              <span key={f} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Sparkles size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" style={{ color: 'var(--accent-indigo)' }} />
      </div>
    </Link>
  </motion.div>
);

const QuickLink = ({ to, icon, title, subtitle, color, bgColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.08, duration: 0.4 }}
  >
    <Link to={to} className="glass-card p-4 flex items-center justify-between group block">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: bgColor, color }}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h4>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-muted)' }} />
    </Link>
  </motion.div>
);

const QuickActions = () => {
  const { hasData } = useAnalysis();

  if (!hasData) return <UploadCTA />;

  const links = [
    { to: '/upload', icon: <Upload size={18} />, title: 'Re-Analyze Resume', subtitle: 'Update your skill profile', color: 'var(--accent-indigo)', bgColor: 'rgba(99,102,241,0.1)' },
    { to: '/roadmap', icon: <Map size={18} />, title: 'View Full Roadmap', subtitle: 'Step-by-step career path', color: 'var(--accent-cyan)', bgColor: 'rgba(34,211,238,0.1)' },
    { to: '/jobs', icon: <Briefcase size={18} />, title: 'Browse Jobs', subtitle: 'AI-matched opportunities', color: 'var(--accent-amber)', bgColor: 'rgba(251,191,36,0.1)' },
    { to: '/passion', icon: <Heart size={18} />, title: 'Passion Guide', subtitle: 'Turn hobbies into careers', color: 'var(--accent-rose)', bgColor: 'rgba(251,113,133,0.1)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {links.map((link, i) => (
        <QuickLink key={link.to} {...link} delay={i + 10} />
      ))}
    </div>
  );
};

export default QuickActions;
