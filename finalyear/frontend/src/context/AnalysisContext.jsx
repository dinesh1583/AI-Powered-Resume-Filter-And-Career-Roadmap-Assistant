import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { userAPI } from '../services/api';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userAPI.getAnalysis();
      if (res.data && res.data.skills && res.data.skills.length > 0) {
        setAnalysis(res.data);
        localStorage.setItem('analysisResult', JSON.stringify(res.data));
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.warn('Analysis API error:', err.message);
      }
    }
    // Fallback to localStorage
    const stored = localStorage.getItem('analysisResult');
    if (stored) {
      try { setAnalysis(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadAnalysis();
    } else {
      setLoading(false);
    }
  }, [loadAnalysis]);

  const updateAnalysis = useCallback((data) => {
    setAnalysis(data);
    localStorage.setItem('analysisResult', JSON.stringify(data));
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    localStorage.removeItem('analysisResult');
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analysis,
      loading,
      error,
      hasData: !!analysis,
      loadAnalysis,
      updateAnalysis,
      clearAnalysis,
      // Convenience accessors
      skills: analysis?.skills || [],
      bestMatch: analysis?.best_match || {},
      matchedCareers: analysis?.matched_careers || [],
      alternateCareers: analysis?.alternate_careers || [],
      skillCategories: analysis?.skill_categories || {},
      roadmap: analysis?.roadmap || {},
      recommendations: analysis?.recommendations || {},
      insights: analysis?.insights || null,
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
}

export default AnalysisContext;
