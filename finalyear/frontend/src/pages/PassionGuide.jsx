import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Compass, ArrowRight, ArrowLeft, ChevronRight, BookOpen, TrendingUp, Sparkles, Loader2, AlertCircle, CheckCircle, Star, Palette, Monitor, Utensils, Dumbbell, Plane, GraduationCap, TreePine, Gamepad2 } from 'lucide-react';
import { passionAPI } from '../services/api';

const CATEGORY_ICONS = {
  'Creative Arts': <Palette size={20} />,
  'Technology': <Monitor size={20} />,
  'Lifestyle': <Heart size={20} />,
  'Nature': <TreePine size={20} />,
  'Social Impact': <Star size={20} />,
  'Science': <Sparkles size={20} />,
  'Intellectual': <BookOpen size={20} />,
  'Communication': <GraduationCap size={20} />,
};

const CATEGORY_COLORS = {
  'Creative Arts': { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc' },
  'Technology': { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  'Lifestyle': { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#f472b6' },
  'Nature': { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
  'Social Impact': { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  'Science': { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#38bdf8' },
  'Intellectual': { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa' },
  'Communication': { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c' },
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
});

const PassionGuide = () => {
  const [view, setView] = useState('browse');
  const [passions, setPassions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [careers, setCareers] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedPassion, setSelectedPassion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [suggestText, setSuggestText] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => { fetchPassions(); }, []);

  const fetchPassions = async () => {
    setLoading(true); setError(null);
    try {
      const res = await passionAPI.getPassions();
      setPassions(res.data.passions || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Please log in first.' : 'Failed to load passions.');
    }
    setLoading(false);
  };

  const explorePassion = async (passionName) => {
    setLoading(true); setError(null); setSelectedPassion(passionName);
    try {
      const res = await passionAPI.explore(passionName);
      setCareers(res.data.careers || []);
      setView('careers');
    } catch (err) { setError('Failed to load careers.'); }
    setLoading(false);
  };

  const viewRoadmap = async (passionId) => {
    setLoading(true); setError(null);
    try {
      const res = await passionAPI.getRoadmap(passionId);
      setRoadmap(res.data.roadmap);
      setView('roadmap');
    } catch (err) { setError('Failed to load roadmap.'); }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchPassions(); setView('browse'); return; }
    setLoading(true); setError(null);
    try {
      const res = await passionAPI.search(searchQuery);
      setCareers(res.data.results || []);
      setSelectedPassion(`Search: "${searchQuery}"`);
      setView('careers');
    } catch (err) { setError('Search failed.'); }
    setLoading(false);
  };

  const goBack = () => {
    if (view === 'roadmap') { setView('careers'); setRoadmap(null); }
    else { setView('browse'); setCareers([]); setSelectedPassion(''); }
    setError(null);
  };

  const handleSmartSuggest = async () => {
    if (!suggestText.trim() || suggestText.trim().length < 3) return;
    setSuggestLoading(true); setError(null);
    try {
      const res = await passionAPI.smartSuggest(suggestText);
      setSuggestions(res.data);
    } catch (err) {
      setError('Smart suggestion failed. Please try again.');
    }
    setSuggestLoading(false);
  };

  const filteredPassions = activeCategory === 'All'
    ? passions
    : passions.filter(p => p.category === activeCategory);

  const demandColor = (level) => {
    if (level === 'Very High') return 'var(--accent-emerald)';
    if (level === 'High') return 'var(--accent-cyan)';
    return 'var(--accent-amber)';
  };

  // ═══════ BROWSE VIEW ═══════
  const renderBrowse = () => (
    <>
      <motion.div {...fadeUp(0)} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)' }}>
          <Heart size={14} style={{ color: '#f472b6' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f472b6' }}>Optional Feature</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
          Follow Your <span className="gradient-text-warm">Passion</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Discover how to turn your hobbies and passions into a rewarding career with step-by-step roadmaps
        </p>
      </motion.div>

      {/* Search */}
      <motion.div {...fadeUp(1)} className="glass-card p-4 mb-8 flex gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input className="input-dark text-sm" placeholder="Search passions... e.g. photography, coding, cooking"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        </div>
        <button onClick={handleSearch} className="btn-primary text-sm py-2 px-5 rounded-xl flex items-center gap-1.5 shrink-0">
          <Search size={14} /> Explore
        </button>
      </motion.div>

      {/* Smart Suggest — Describe Your Hobbies */}
      <motion.div {...fadeUp(1.5)} className="glass-card p-5 mb-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: 'var(--accent-violet)' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-violet)' }}>Smart Career Finder</span>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          Describe your hobbies and interests in your own words — we'll match them to career paths.
        </p>
        <div className="flex gap-3">
          <textarea
            className="input-dark text-sm flex-1" style={{ paddingLeft: '0.75rem', minHeight: '44px', resize: 'none' }}
            placeholder='e.g. "I love photography, editing videos, and building things with electronics"'
            value={suggestText}
            onChange={e => setSuggestText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSmartSuggest(); } }}
            rows={1}
          />
          <button onClick={handleSmartSuggest} disabled={suggestLoading || suggestText.trim().length < 3}
            className="btn-primary text-sm py-2 px-5 rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50">
            {suggestLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={14} />}
            Suggest
          </button>
        </div>

        {/* Smart Suggest Results */}
        {suggestions && suggestions.matches && suggestions.matches.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                Keywords: {suggestions.keywords_extracted.slice(0, 8).map(kw => (
                  <span key={kw} className="skill-tag skill-tag-indigo ml-1" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>{kw}</span>
                ))}
              </span>
            </div>
            {suggestions.matches.slice(0, 4).map((match) => {
              const colors = CATEGORY_COLORS[match.category] || CATEGORY_COLORS['Technology'];
              return (
                <div key={match.passion_id} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => viewRoadmap(match.passion_id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.bg, color: colors.text }}>
                      {CATEGORY_ICONS[match.category] || <Compass size={16} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{match.career_title}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>via {match.passion} · {match.relevance_score}% match</p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              );
            })}
          </div>
        )}
        {suggestions && suggestions.matches && suggestions.matches.length === 0 && (
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>No matches found. Try different words.</p>
        )}
      </motion.div>

      {/* Category Filters */}
      <motion.div {...fadeUp(2)} className="flex flex-wrap justify-center gap-2 mb-8">
        <button onClick={() => setActiveCategory('All')}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
          style={{ background: activeCategory === 'All' ? 'var(--gradient-accent)' : 'rgba(99,102,241,0.08)',
            color: activeCategory === 'All' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeCategory === 'All' ? 'transparent' : 'var(--border-subtle)'}` }}>
          All
        </button>
        {categories.map(cat => {
          const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Technology'];
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300"
              style={{ background: isActive ? colors.bg : 'rgba(99,102,241,0.05)',
                color: isActive ? colors.text : 'var(--text-secondary)',
                border: `1px solid ${isActive ? colors.border : 'var(--border-subtle)'}` }}>
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          );
        })}
      </motion.div>

      {/* Passion Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPassions.map((passion, i) => {
          const colors = CATEGORY_COLORS[passion.category] || CATEGORY_COLORS['Technology'];
          return (
            <motion.button key={passion.name} {...fadeUp(i * 0.5 + 3)}
              onClick={() => explorePassion(passion.name)}
              className="glass-card p-5 text-left group cursor-pointer"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: colors.bg, color: colors.text }}>
                {CATEGORY_ICONS[passion.category] || <Compass size={20} />}
              </div>
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{passion.name}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{passion.career_count} career path{passion.career_count > 1 ? 's' : ''}</p>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.text }}>
                Explore <ChevronRight size={12} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );

  // ═══════ CAREERS VIEW ═══════
  const renderCareers = () => (
    <>
      <motion.div {...fadeUp(0)} className="mb-8">
        <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
          style={{ color: 'var(--accent-indigo)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-violet)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-indigo)'}>
          <ArrowLeft size={16} /> Back to Passions
        </button>
        <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
          Career Paths for <span className="gradient-text-warm">{selectedPassion}</span>
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {careers.length} career option{careers.length !== 1 ? 's' : ''} — choose one to see the full roadmap
        </p>
      </motion.div>

      <div className="space-y-4">
        {careers.map((career, i) => {
          const colors = CATEGORY_COLORS[career.category] || CATEGORY_COLORS['Technology'];
          return (
            <motion.div key={career.id} {...fadeUp(i + 1)} className="glass-card p-6 group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: colors.bg, color: colors.text }}>
                      {CATEGORY_ICONS[career.category] || <Compass size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{career.career_title}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{career.career_description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {career.key_skills.slice(0, 6).map(skill => (
                      <span key={skill} className="skill-tag skill-tag-indigo" style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem' }}>{skill}</span>
                    ))}
                    {career.key_skills.length > 6 && (
                      <span className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', color: 'var(--text-muted)', background: 'rgba(100,116,139,0.1)' }}>+{career.key_skills.length - 6} more</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1" style={{ color: demandColor(career.demand_level) }}>
                      <TrendingUp size={12} /> {career.demand_level} Demand
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--accent-emerald)' }}>
                      <Sparkles size={12} /> {career.growth_rate} Growth
                    </span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <BookOpen size={12} /> {career.roadmap_steps.length} Steps
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button onClick={() => viewRoadmap(career.id)}
                    className="btn-primary text-sm py-2.5 px-5 rounded-xl flex items-center gap-2 whitespace-nowrap">
                    View Roadmap <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {careers.length === 0 && !loading && (
          <div className="glass-panel p-12 text-center">
            <Compass size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Careers Found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try a different passion or search term.</p>
          </div>
        )}
      </div>
    </>
  );

  // ═══════ ROADMAP VIEW ═══════
  const renderRoadmap = () => {
    if (!roadmap) return null;
    return (
      <>
        <motion.div {...fadeUp(0)} className="mb-8">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
            style={{ color: 'var(--accent-indigo)' }}>
            <ArrowLeft size={16} /> Back to Careers
          </button>
          <div className="glass-card p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-[60px]" style={{ background: 'rgba(236,72,153,0.15)' }} />
            <div className="relative z-10">
              <span className="badge badge-info mb-3">{roadmap.demand_level} Demand</span>
              <h1 className="text-2xl md:text-3xl font-black mb-2 gradient-text-warm">{roadmap.career_title}</h1>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{roadmap.career_description}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-1" style={{ color: 'var(--accent-emerald)' }}>
                  <TrendingUp size={14} /> {roadmap.growth_rate} Growth Rate
                </span>
                <span className="flex items-center gap-1" style={{ color: 'var(--accent-cyan)' }}>
                  <BookOpen size={14} /> {roadmap.total_steps} Steps
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {roadmap.key_skills.map(skill => (
                  <span key={skill} className="skill-tag skill-tag-indigo" style={{ fontSize: '0.75rem' }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div {...fadeUp(1)} className="mb-8">
          <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">Step-by-Step</span> Roadmap
          </h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, var(--accent-indigo), var(--accent-violet), var(--accent-rose))' }} />
            <div className="space-y-4">
              {roadmap.steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.3 }}
                  className="relative pl-14">
                  <div className="absolute left-3 top-4 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black z-10"
                    style={{ background: 'var(--gradient-accent)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
                    {step.order}
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</h4>
                    {step.description && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Resources */}
        {roadmap.resources && roadmap.resources.length > 0 && (
          <motion.div {...fadeUp(2)} className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              📚 Recommended Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roadmap.resources.map((res, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}>
                    <BookOpen size={14} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{res}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 px-4">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 mb-6 flex items-start gap-3" style={{ borderColor: 'rgba(251,113,133,0.3)' }}>
          <AlertCircle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-rose)' }} />
          <div>
            <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--accent-rose)' }}>Error</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={36} style={{ color: 'var(--accent-indigo)' }} />
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'browse' && <motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderBrowse()}</motion.div>}
          {view === 'careers' && <motion.div key="careers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderCareers()}</motion.div>}
          {view === 'roadmap' && <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderRoadmap()}</motion.div>}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default PassionGuide;
