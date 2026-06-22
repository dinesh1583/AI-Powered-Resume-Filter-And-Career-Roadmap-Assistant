import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Code, Mail, Target, Award, TrendingUp, CheckCircle, Save, Plus, X, Edit3 } from 'lucide-react';
import { AuthContext } from '../App';
import { userAPI } from '../services/api';

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5 }
});

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: '', link: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  
  const [form, setForm] = useState({
    full_name: '',
    about_me: '',
    education: { tenth: '', twelfth: '', graduation: '', post_graduation: '', status: 'pursuing' },
    experience: { level: 'Fresher', years: 0, current_role: '', company: '' },
    skills: [],
  });

  useEffect(() => {
    const stored = localStorage.getItem('analysisResult');
    if (stored) try { setAnalysisResult(JSON.parse(stored)); } catch {}
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      const p = res.data;
      setForm({
        full_name: p.full_name || '',
        about_me: p.about_me || '',
        education: {
          tenth: p.education?.tenth || '',
          twelfth: p.education?.twelfth || '',
          graduation: p.education?.graduation || '',
          post_graduation: p.education?.post_graduation || '',
          status: p.education?.status || 'pursuing',
        },
        experience: {
          level: p.experience?.level || 'Fresher',
          years: p.experience?.years || 0,
          current_role: p.experience?.current_role || '',
          company: p.experience?.company || '',
        },
        skills: p.skills || [],
      });
    } catch (err) {
      console.log('Profile load from API failed, using local data');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    try {
      await userAPI.updateProfile(form);
      setSaveMsg('Profile saved successfully!');
      setIsEditing(false);
      // Update local user data
      const updatedUser = { ...user, full_name: form.full_name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(localStorage.getItem('token'), updatedUser);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Failed to save. Check your connection.');
    }
    setIsSaving(false);
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const addProject = async () => {
    if (!newProject.title.trim()) return;
    try {
      const proj = {
        title: newProject.title,
        description: newProject.description,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
        link: newProject.link,
      };
      await userAPI.addProject(proj);
      setNewProject({ title: '', description: '', technologies: '', link: '' });
      setShowProjectForm(false);
      setSaveMsg('Project added!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('Failed to add project.'); }
  };

  const skills = analysisResult?.skills || form.skills || [];
  const categories = analysisResult?.skill_categories || {};
  const bestMatch = analysisResult?.best_match || {};
  const userName = form.full_name || user?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.85rem', background: 'rgba(15,23,42,0.5)', border: '1px solid var(--border-subtle)',
    borderRadius: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto py-8 px-4">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Your <span className="gradient-text">Profile</span></h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary text-sm flex items-center gap-1.5 px-4 py-2"><Edit3 size={14} /> Edit Profile</button>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2">
                <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {saveMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 mb-6 text-center text-sm font-semibold"
          style={{ color: saveMsg.includes('Failed') ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
          {saveMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column — Avatar & Stats */}
        <div className="space-y-6">
          <motion.div {...fadeUp(1)} className="glass-card p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: 'var(--gradient-accent)', filter: 'blur(40px)' }} />
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black"
                style={{ background: 'var(--gradient-accent)', color: 'white' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              {isEditing ? (
                <input style={inputStyle} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Full Name" className="text-center mb-2" />
              ) : (
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{userName}</h2>
              )}
              <p className="text-sm flex items-center justify-center gap-1 mt-1" style={{ color: 'var(--text-secondary)' }}><Mail size={14} /> {userEmail}</p>
              {bestMatch.title && (
                <div className="mt-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Career Path</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent-indigo)' }}>{bestMatch.title}</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div {...fadeUp(2)} className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Quick Stats</h3>
            {[
              { icon: <Code size={16} />, label: 'Skills', value: skills.length, color: 'var(--accent-indigo)' },
              { icon: <Target size={16} />, label: 'Match Score', value: bestMatch.match_score ? `${bestMatch.match_score}%` : '—', color: 'var(--accent-emerald)' },
              { icon: <TrendingUp size={16} />, label: 'Readiness', value: bestMatch.readiness || '—', color: 'var(--accent-cyan)' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column — Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* About Me */}
          <motion.div {...fadeUp(3)} className="glass-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><User size={14} /> About Me</h3>
            {isEditing ? (
              <textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} value={form.about_me} onChange={e => setForm({...form, about_me: e.target.value})} placeholder="Tell us about yourself, your goals, and interests..." />
            ) : (
              <p className="text-sm" style={{ color: form.about_me ? 'var(--text-primary)' : 'var(--text-muted)' }}>{form.about_me || 'No description added yet.'}</p>
            )}
          </motion.div>

          {/* Education */}
          <motion.div {...fadeUp(4)} className="glass-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><GraduationCap size={14} /> Education</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label style={labelStyle}>10th Standard</label><input style={inputStyle} value={form.education.tenth} onChange={e => setForm({...form, education: {...form.education, tenth: e.target.value}})} placeholder="School name, percentage" /></div>
                <div><label style={labelStyle}>12th Standard</label><input style={inputStyle} value={form.education.twelfth} onChange={e => setForm({...form, education: {...form.education, twelfth: e.target.value}})} placeholder="School name, percentage" /></div>
                <div><label style={labelStyle}>Graduation</label><input style={inputStyle} value={form.education.graduation} onChange={e => setForm({...form, education: {...form.education, graduation: e.target.value}})} placeholder="Degree, University" /></div>
                <div><label style={labelStyle}>Post Graduation</label><input style={inputStyle} value={form.education.post_graduation} onChange={e => setForm({...form, education: {...form.education, post_graduation: e.target.value}})} placeholder="Degree, University" /></div>
                <div><label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={form.education.status} onChange={e => setForm({...form, education: {...form.education, status: e.target.value}})}>
                    <option value="pursuing">Pursuing</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[{l:'Graduation',v:form.education.graduation},{l:'12th',v:form.education.twelfth},{l:'10th',v:form.education.tenth},{l:'Post Grad',v:form.education.post_graduation}].filter(e=>e.v).map(e=>(
                  <div key={e.l} className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{e.l}</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{e.v}</p>
                  </div>
                ))}
                {form.education.status && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Status: <strong className="capitalize">{form.education.status}</strong></p>}
                {!form.education.graduation && !form.education.twelfth && !form.education.tenth && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No education details added. Click Edit to add.</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Experience */}
          <motion.div {...fadeUp(5)} className="glass-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Briefcase size={14} /> Experience</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label style={labelStyle}>Level</label>
                  <select style={inputStyle} value={form.experience.level} onChange={e => setForm({...form, experience: {...form.experience, level: e.target.value}})}>
                    <option value="Fresher">Fresher</option><option value="Experienced">Experienced</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Years of Experience</label><input type="number" style={inputStyle} min="0" max="50" step="0.5" value={form.experience.years} onChange={e => setForm({...form, experience: {...form.experience, years: parseFloat(e.target.value)||0}})} /></div>
                <div><label style={labelStyle}>Current Role</label><input style={inputStyle} value={form.experience.current_role} onChange={e => setForm({...form, experience: {...form.experience, current_role: e.target.value}})} placeholder="e.g. Software Engineer" /></div>
                <div><label style={labelStyle}>Company</label><input style={inputStyle} value={form.experience.company} onChange={e => setForm({...form, experience: {...form.experience, company: e.target.value}})} placeholder="e.g. Google" /></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Level</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{form.experience.level}</p></div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Years</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{form.experience.years}</p></div>
                {form.experience.current_role && <div className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Role</p><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{form.experience.current_role}</p></div>}
              </div>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div {...fadeUp(6)} className="glass-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Code size={14} /> Skills ({skills.length})</h3>
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input style={{...inputStyle, flex:1}} value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill (e.g. Python, React)..." />
                <button onClick={addSkill} className="btn-primary text-sm px-4 py-2 flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
            )}
            {isEditing && form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {form.skills.map(s => (
                  <span key={s} className="skill-tag skill-tag-indigo cursor-pointer group" onClick={() => removeSkill(s)}>
                    {s} <X size={10} className="opacity-50 group-hover:opacity-100" />
                  </span>
                ))}
              </div>
            )}
            {Object.keys(categories).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(categories).map(([cat, catSkills]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {catSkills.map(s => (<span key={s.name} className="skill-tag skill-tag-indigo"><CheckCircle size={10} /> {s.name}</span>))}
                    </div>
                  </div>
                ))}
              </div>
            ) : skills.length > 0 && !isEditing ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => <span key={s} className="skill-tag skill-tag-indigo">{s}</span>)}
              </div>
            ) : !isEditing ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload your resume or add skills manually.</p>
            ) : null}
          </motion.div>

          {/* Add Project */}
          <motion.div {...fadeUp(7)} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Award size={14} /> Projects</h3>
              <button onClick={() => setShowProjectForm(!showProjectForm)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><Plus size={12} /> Add Project</button>
            </div>
            {showProjectForm && (
              <div className="p-4 rounded-xl mb-4 space-y-3" style={{ background: 'rgba(15,23,42,0.3)' }}>
                <input style={inputStyle} value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="Project title" />
                <textarea style={{...inputStyle, minHeight:'60px', resize:'vertical'}} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Brief description" />
                <input style={inputStyle} value={newProject.technologies} onChange={e => setNewProject({...newProject, technologies: e.target.value})} placeholder="Technologies (comma separated)" />
                <input style={inputStyle} value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})} placeholder="Project link (optional)" />
                <div className="flex gap-2">
                  <button onClick={addProject} className="btn-primary text-sm px-4 py-2">Save Project</button>
                  <button onClick={() => setShowProjectForm(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
                </div>
              </div>
            )}
            {bestMatch.title && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.3)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best Career Match</p>
                <p className="text-sm font-bold" style={{ color: 'var(--accent-indigo)' }}>{bestMatch.title} — {bestMatch.match_score}%</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
