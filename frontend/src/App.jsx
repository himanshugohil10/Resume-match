import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Send, FileText, BarChart3, ChevronRight, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, Sun, Moon, Briefcase, PieChart } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

const HoverCard = ({ icon, title, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      style={{ 
        background: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'var(--glass)', 
        border: '1px solid var(--glass-border)',
        borderRadius: '0.75rem',
        padding: '1.25rem', 
        marginBottom: '1rem', 
        cursor: 'default',
        transition: 'background 0.3s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: isHovered ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', transition: 'color 0.3s ease' }}>
        {icon} <span style={{ fontSize: '1.1rem' }}>{title}</span>
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function App() {
  const [theme, setTheme] = useState("dark");
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [jdText, setJdText] = useState("");
  const [resumes, setResumes] = useState([]);
  const [weights, setWeights] = useState({
    skills: 0.4,
    experience: 0.3,
    education: 0.1,
    tools: 0.2
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Maximum 10 resumes allowed.");
      return;
    }
    setResumes(files);
  };

  const handleEvaluate = async () => {
    if (!jdText || resumes.length === 0) {
      alert("Please provide a Job Description and at least one resume.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("jd_text", jdText);
    resumes.forEach((file) => formData.append("files", file));
    formData.append("weights", JSON.stringify(weights));

    try {
      const response = await axios.post(`${API_BASE}/evaluate`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error evaluating resumes:", error);
      alert("Error evaluating resumes. Check if the backend is running and Groq API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    setWeights({ ...weights, [key]: parseFloat(value) });
  };

  return (
    <div className="container">
      <div className="grid">
        {/* Left Column: Command Center */}
        <div className="left-panel">
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: '1.2' }}
              >
                Resume Match
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: 'var(--text-muted)' }}
              >
                AI-Powered Semantic Match with Full Transparency
              </motion.p>
            </div>
            <button 
              className="btn" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              style={{ padding: '0.75rem', borderRadius: '50%', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <FileText size={20} /> Job Specification
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Describe the Role & Requirements</label>
              <textarea
                rows={8}
                placeholder="Paste Job Description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Upload Resumes (Max 10)</label>
              <div
                style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.875rem' }}>Click or drag PDF/DOCX files</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
              {resumes.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {resumes.length} files selected:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {resumes.map((f, i) => (
                      <span key={i} className="tag tag-neutral">{f.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="slider-container" style={{ marginTop: 0, marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Weightage Adjustment</h3>
              {Object.keys(weights).map((key) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    <span>{Math.round(weights[key] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleEvaluate}
            disabled={loading}
          >
            {loading ? "Processing..." : (
              <>
                <Send size={18} /> Evaluate Candidates
              </>
            )}
          </button>
          </div>
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="right-panel">
          {!results && !loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
              <BarChart3 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Evaluation results will appear here</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ paddingBottom: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'var(--primary)', borderWidth: '2px' }} />
                <span>Analyzing resumes with Groq LLM & BERT...</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '50%' }}>
                      <div className="skeleton" style={{ height: '1.5rem', width: '80%' }}></div>
                      <div className="skeleton" style={{ height: '1rem', width: '40%' }}></div>
                    </div>
                    <div className="skeleton" style={{ height: '2.5rem', width: '4rem', borderRadius: '0.5rem' }}></div>
                  </div>
                  <div className="skeleton" style={{ height: '3rem', width: '100%', marginTop: '0.5rem' }}></div>
                </div>
              ))}
            </div>
          )}

          {results && (
            <AnimatePresence>
              {results.rankings.map((candidate, idx) => (
                <motion.div
                  key={candidate.candidate_name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card"
                  style={{
                     padding: '1.5rem',
                     cursor: 'pointer',
                     borderLeft: `4px solid ${candidate.final_score > 0.7 ? 'var(--success)' : candidate.final_score > 0.4 ? 'var(--warning)' : 'var(--error)'}`
                  }}
                  onClick={() => setExpandedCandidate(expandedCandidate === idx ? null : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem' }}>{candidate.candidate_name}</h3>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <span>Rank #{idx + 1}</span>
                        <span>{candidate.explanation.recruiter_verdict}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {Math.round(candidate.final_score * 100)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match Score</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--glass)', borderRadius: '0.5rem', fontSize: '1.05rem', fontStyle: 'italic', borderLeft: '4px solid var(--primary)', lineHeight: '1.6', fontWeight: 500 }}>
                    "{candidate.explanation.critique}"
                  </div>

                  {expandedCandidate === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}
                    >
                      <HoverCard icon={<CheckCircle2 size={18} />} title="Skill Depth Analysis">
                        <p style={{ fontSize: '1.05rem', marginBottom: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                          {candidate.explanation.skill_reasoning}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {candidate.resume_data.skills.map((s, i) => (
                            <div key={i} className="tag tag-neutral" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.5rem 1rem', margin: 0 }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.name}</span>
                              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{s.proficiency} | {s.context}</span>
                            </div>
                          ))}
                        </div>
                      </HoverCard>

                      <HoverCard icon={<Briefcase size={18} />} title="Experience Quality">
                        <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                          {candidate.explanation.experience_reasoning}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {candidate.resume_data.experience.map((e, i) => (
                            <div key={i} style={{ fontSize: '0.9rem', paddingBottom: '1rem', borderBottom: i < candidate.resume_data.experience.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '1.05rem' }}>{e.role} ({e.years}y)</strong>
                                <span className={`tag ${e.complexity === 'High' ? 'tag-success' : 'tag-neutral'}`} style={{ fontSize: '0.8rem', margin: 0, padding: '0.2rem 0.6rem' }}>{e.complexity} Complexity</span>
                              </div>
                              <div style={{ marginTop: '0.5rem', opacity: 0.9, lineHeight: '1.5' }}>Impact: {e.impact}</div>
                              {e.is_repetitive && <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 500 }}>Note: Identified as repetitive work</div>}
                            </div>
                          ))}
                        </div>
                      </HoverCard>

                      <HoverCard icon={<PieChart size={18} />} title="Score Breakdown">
                        <div style={{ paddingTop: '0.5rem' }}>
                          {Object.entries(candidate.scores).map(([name, score]) => (
                            <div key={name} style={{ marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                <span style={{ textTransform: 'capitalize' }}>{name}</span>
                                <span>{Math.round(score * 100)}%</span>
                              </div>
                              <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score * 100}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  style={{ height: '100%', background: 'var(--primary)' }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </HoverCard>
                    </motion.div>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    {expandedCandidate === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
