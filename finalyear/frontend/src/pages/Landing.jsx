import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Map, BookOpen, BrainCircuit, Rocket, ArrowRight, CheckCircle, TrendingUp, Zap, Target, Users } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const Landing = () => {
  const features = [
    { icon: <Upload className="w-6 h-6" />, title: 'Smart Resume Analysis', desc: 'Our AI engine extracts exact skills from your resume using advanced NLP — no guesswork.', color: '#6366f1' },
    { icon: <BrainCircuit className="w-6 h-6" />, title: 'AI Career Matching', desc: 'Weighted scoring matches you to 25+ careers with gap analysis and readiness levels.', color: '#8b5cf6' },
    { icon: <Map className="w-6 h-6" />, title: 'Personalized Roadmaps', desc: 'Step-by-step learning paths with timelines, auto-completed based on your skills.', color: '#22d3ee' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Course & Video Recs', desc: 'Curated courses from Udemy, Coursera, YouTube matched to your missing skills.', color: '#34d399' },
    { icon: <Target className="w-6 h-6" />, title: 'Missing Skill Detection', desc: 'Know exactly which skills to learn next with Essential, Important, and Recommended tiers.', color: '#fb7185' },
    { icon: <Rocket className="w-6 h-6" />, title: 'Project Ideas', desc: 'Real-world portfolio projects per career path to showcase your abilities.', color: '#fbbf24' },
  ];

  const stats = [
    { value: '150+', label: 'Skills Tracked' },
    { value: '25+', label: 'Career Paths' },
    { value: '120+', label: 'Courses' },
    { value: '60+', label: 'Roadmap Steps' },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-[100px] opacity-20"
          style={{ background: 'var(--gradient-accent)' }} />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full blur-[100px] opacity-15"
          style={{ background: 'var(--gradient-cool)' }} />

        <motion.div initial="hidden" animate="visible" className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-indigo)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-indigo)' }}>AI-Powered Career Intelligence</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
            <span style={{ color: 'var(--text-primary)' }}>Navigate Your</span>
            <br />
            <span className="gradient-text">Dream Career</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>With AI Precision</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            Upload your resume. Our AI detects your exact skills, matches you to the perfect career, 
            and builds a personalized roadmap with courses, projects, and resources.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3.5 px-8 rounded-2xl inline-flex items-center justify-center gap-2 font-bold">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-3.5 px-8 rounded-2xl inline-flex items-center justify-center gap-2 font-bold">
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to <span className="gradient-text">Level Up</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              From resume analysis to career roadmaps — powered by real data and intelligent matching.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass-card card-shine p-7 group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${feat.color}15`, color: feat.color }}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              How It <span className="gradient-text-cool">Works</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Drop your PDF resume and our NLP engine extracts every skill.', icon: <Upload /> },
              { step: '02', title: 'AI Analysis', desc: 'We match your skills against 25+ career paths with weighted scoring.', icon: <BrainCircuit /> },
              { step: '03', title: 'Get Roadmap', desc: 'Receive a personalized roadmap with courses, projects, and timelines.', icon: <Rocket /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-2xl animate-pulse-glow"
                    style={{ background: 'var(--gradient-accent)', opacity: 0.15 }} />
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)' }}>
                    {item.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: 'var(--gradient-accent)', color: 'white' }}>{item.step}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-10 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px]"
              style={{ background: 'rgba(99, 102, 241, 0.15)' }} />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[80px]"
              style={{ background: 'rgba(139, 92, 246, 0.1)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                Ready to Launch Your Career?
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                Join thousands who've found their path with AI-powered career intelligence.
              </p>
              <Link to="/register" className="btn-primary text-base py-3.5 px-10 rounded-2xl inline-flex items-center gap-2 font-bold">
                Get Started Free <Sparkles className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2026 CareerPulse AI. Built with ❤️ for your career growth.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
