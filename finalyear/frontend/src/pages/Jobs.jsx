import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Building, ExternalLink, Search, Filter, Loader2, AlertCircle, CheckCircle, XCircle, TrendingUp, Zap, ChevronDown, ChevronUp, Star, Sparkles } from 'lucide-react';
import { jobsAPI } from '../services/api';
import { useAnalysis } from '../context/AnalysisContext';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.5 }
});

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [expandedJob, setExpandedJob] = useState(null);
  const [sortBy, setSortBy] = useState('match');

  const { hasData, bestMatch, skills, insights } = useAnalysis();
  const bestCareer = bestMatch?.title || '';

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (career = '', location = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsAPI.get(career || bestCareer, location);
      setJobs(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view jobs.');
      } else {
        setError(err.response?.data?.detail || 'Failed to load jobs. Please ensure the backend is running.');
      }
      setJobs([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchJobs(searchTerm || bestCareer, locationFilter);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const sortedJobs = useMemo(() => {
    const sorted = [...jobs];
    if (sortBy === 'match') sorted.sort((a, b) => (b.match || 0) - (a.match || 0));
    else if (sortBy === 'latest') sorted.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    return sorted;
  }, [jobs, sortBy]);

  const matchColor = (m) => {
    if (m >= 85) return 'var(--accent-emerald)';
    if (m >= 70) return 'var(--accent-cyan)';
    if (m >= 50) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const matchLabel = (m) => {
    if (m >= 85) return 'Excellent Match';
    if (m >= 70) return 'Strong Match';
    if (m >= 50) return 'Good Match';
    return 'Partial Match';
  };

  const totalMatched = jobs.reduce((sum, j) => sum + (j.matched_skills?.length || 0), 0);
  const avgMatch = jobs.length > 0 ? Math.round(jobs.reduce((sum, j) => sum + (j.match || 0), 0) / jobs.length) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-indigo)' }}>
              <Sparkles size={12} className="inline mr-1" /> AI-Powered Job Matching
            </p>
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
              Recommended <span className="gradient-text">Jobs</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Real job listings matched to your skills
              {bestCareer && <> for <strong style={{ color: 'var(--accent-indigo)' }}>{bestCareer}</strong></>}
            </p>
          </div>

          {/* Quick Stats */}
          {hasData && jobs.length > 0 && (
            <div className="flex gap-3">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-indigo)' }}>{jobs.length}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Jobs Found</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(52,211,153,0.1)' }}>
                <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-emerald)' }}>{avgMatch}%</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Avg Match</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: 'rgba(34,211,238,0.1)' }}>
                <div className="text-xl font-black tabular-nums" style={{ color: 'var(--accent-cyan)' }}>{totalMatched}</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Skills Matched</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(1)} className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              id="job-search-input"
              className="input-dark text-sm"
              placeholder="Search by career or job title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              id="job-location-input"
              className="input-dark text-sm"
              placeholder="Location..."
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select
              id="job-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer outline-none"
              style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <option value="match">Best Match</option>
              <option value="latest">Latest</option>
            </select>
            <button id="job-filter-btn" onClick={handleSearch} className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 shrink-0">
              <Filter size={14} /> Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* AI Match Banner */}
      {hasData && insights && !loading && jobs.length > 0 && (
        <motion.div {...fadeUp(1.5)} className="glow-card p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-accent)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Match Score: {insights.hiring_probability || avgMatch}% hiring probability
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Based on your {skills.length} detected skills and {insights.experience_level || 'current'} experience level
            </p>
          </div>
          {insights.salary_prediction && (
            <div className="text-right shrink-0 hidden sm:block">
              <div className="text-xs font-bold" style={{ color: 'var(--accent-emerald)' }}>Expected Salary</div>
              <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{insights.salary_prediction.current_range}</div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error State */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 size={32} style={{ color: 'var(--accent-indigo)' }} />
          </motion.div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Finding your best matches...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Jobs Found</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Upload your resume first to get personalized job matches, or try a different search.
          </p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && (
        <div className="space-y-4">
          {sortedJobs.map((job, index) => {
            const isExpanded = expandedJob === job.id;
            return (
              <motion.div
                key={job.id}
                {...fadeUp(index * 0.5)}
                className="glass-card p-5 md:p-6 group hover-lift"
                layout
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: `${matchColor(job.match)}15`, color: matchColor(job.match) }}>
                      <Briefcase size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><Building size={12} style={{ color: 'var(--text-muted)' }} /> {job.company}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} style={{ color: 'var(--text-muted)' }} /> {job.location}</span>
                      </div>

                      {/* Matched/Missing Skills */}
                      {job.matched_skills && job.matched_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.matched_skills.slice(0, isExpanded ? undefined : 4).map(skill => (
                            <span key={skill} className="skill-tag skill-tag-emerald" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                              <CheckCircle size={10} /> {skill}
                            </span>
                          ))}
                          {job.missing_skills && job.missing_skills.slice(0, isExpanded ? undefined : 2).map(skill => (
                            <span key={skill} className="skill-tag skill-tag-rose" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                              <XCircle size={10} /> {skill}
                            </span>
                          ))}
                          {!isExpanded && ((job.matched_skills?.length || 0) > 4 || (job.missing_skills?.length || 0) > 2) && (
                            <button onClick={() => setExpandedJob(job.id)} className="text-xs font-semibold px-2 py-0.5 rounded-md"
                              style={{ color: 'var(--accent-indigo)', background: 'rgba(99,102,241,0.08)' }}>
                              +{(job.matched_skills.length - 4) + Math.max(0, (job.missing_skills?.length || 0) - 2)} more
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)' }}>{job.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--accent-indigo)' }}>{job.experience_level}</span>
                      </div>

                      {/* Description (expandable) */}
                      {job.description && (
                        <p className={`text-xs mt-2 ${isExpanded ? '' : 'line-clamp-2'}`} style={{ color: 'var(--text-muted)' }}>{job.description}</p>
                      )}

                      {/* Expand/Collapse */}
                      <button
                        onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        className="text-xs font-semibold mt-2 flex items-center gap-1 transition-colors"
                        style={{ color: 'var(--accent-indigo)' }}
                      >
                        {isExpanded ? <><ChevronUp size={14} /> Less details</> : <><ChevronDown size={14} /> More details</>}
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-black tabular-nums" style={{ color: matchColor(job.match) }}>{job.match}%</div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{matchLabel(job.match)}</div>
                    </div>
                    {/* Match progress ring */}
                    <div className="relative w-12 h-12 hidden sm:block">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(30,41,59,0.8)" strokeWidth="3" />
                        <motion.circle
                          cx="24" cy="24" r="20" fill="none"
                          stroke={matchColor(job.match)}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - (job.match || 0) / 100) }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </svg>
                      <Star size={14} className="absolute inset-0 m-auto" style={{ color: matchColor(job.match) }} />
                    </div>
                    {job.apply_url && (
                      <a href={job.apply_url} target="_blank" rel="noreferrer"
                        className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 no-underline">
                        Apply <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Jobs;
