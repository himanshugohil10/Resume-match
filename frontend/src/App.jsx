import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Send, FileText, BarChart3, ChevronRight, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

function App() {
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
    const newWeights = { ...weights, [key]: parseFloat(value) };
    // Normalize weights to sum to 1
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    const normalized = {};
    for (let k in newWeights) {
      normalized[k] = newWeights[k] / sum;
    }
    setWeights(normalized);
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3rem', marginBottom: '1rem' }}
        >
          Explainable Resume Ranking
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-muted)' }}
        >
          AI-Powered Semantic Match with Full Transparency
        </motion.p>
      </header>

      <div className="grid">
        {/* Left Column: Input */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} /> Job Specification
          </h2>
          <div className="input-group">
            <label className="input-label">Describe the Role & Requirements</label>
            <textarea
              rows={8}
              placeholder="Paste Job Description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>

          <div className="input-group">
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

          <div className="slider-container" style={{ marginBottom: '2rem' }}>
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

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!results && !loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
              <BarChart3 size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Evaluation results will appear here</p>
            </div>
          )}

          {loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div className="spinner" />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Analyzing resumes with Groq LLM & BERT...</p>
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

                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--glass)', borderRadius: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '3px solid var(--primary)' }}>
                    "{candidate.explanation.critique}"
                  </div>

                  {expandedCandidate === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                        <div className="reasoning-box">
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                            <CheckCircle2 size={16} /> Skill Depth Analysis
                          </h4>
                          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            {candidate.explanation.skill_reasoning}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {candidate.resume_data.skills.map((s, i) => (
                              <div key={i} className="tag tag-neutral" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.5rem 0.75rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{s.proficiency} | {s.context}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="reasoning-box">
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                            <BarChart3 size={16} /> Experience Quality
                          </h4>
                          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            {candidate.explanation.experience_reasoning}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {candidate.resume_data.experience.map((e, i) => (
                              <div key={i} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--glass)', borderRadius: '0.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <strong>{e.role} ({e.years}y)</strong>
                                  <span className={`tag ${e.complexity === 'High' ? 'tag-success' : 'tag-neutral'}`} style={{ fontSize: '0.7rem' }}>{e.complexity} Complexity</span>
                                </div>
                                <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>Impact: {e.impact}</div>
                                {e.is_repetitive && <div style={{ color: 'var(--error)', fontSize: '0.7rem', marginTop: '0.25rem' }}>Note: Identified as repetitive work</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Score Breakdown</h4>
                        {Object.entries(candidate.scores).map(([name, score]) => (
                          <div key={name} style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                              <span style={{ textTransform: 'capitalize' }}>{name}</span>
                              <span>{Math.round(score * 100)}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${score * 100}%`, background: 'var(--primary)' }} />
                            </div>
                          </div>
                        ))}
                      </div>
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
