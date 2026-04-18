import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIRecommendation = ({ metrics, triggerMetric }) => {
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendation = async (specificMetrics = null) => {
    const targetMetrics = specificMetrics || metrics;
    
    if (targetMetrics.length === 0) {
      setError("Tavsiye alabilmek için en az bir günlük veri girmelisiniz.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let recentMetrics;
      if (specificMetrics) {
        recentMetrics = specificMetrics;
      } else {
        recentMetrics = [...metrics]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7);
      }
        
      const result = await aiService.getRecommendation(recentMetrics);
      setRecommendation(result);
    } catch (err) {
      setError(err.message || "Tavsiye alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (triggerMetric && triggerMetric.metric) {
      handleGetRecommendation([triggerMetric.metric]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerMetric]);

  return (
    <div className="bg-gradient-to-br from-[#161a28] to-[#1e1b4b]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#a78bfa]/30 transition-all duration-300">
      {/* Arka plan glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#a78bfa]/10 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center">
            <BrainCircuit size={20} className="text-[#a78bfa]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Sağlık Asistanı 
              <span className="px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa] text-[10px] uppercase font-bold tracking-widest">Beta</span>
            </h2>
            <p className="text-[#8F9BAC] text-sm">Gemini ile verilerinizi analiz edin.</p>
          </div>
        </div>

        <button 
          onClick={handleGetRecommendation}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white font-bold text-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles size={16} className="text-[#a78bfa]" />
          )}
          <span>{isLoading ? 'Analiz Ediliyor...' : 'Tavsiye Al'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 mb-4 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {recommendation ? (
        <div className="bg-[#0e1120]/80 backdrop-blur-sm border border-white/5 rounded-xl p-6 text-gray-300 text-sm leading-relaxed relative z-10">
          <div className="prose prose-invert max-w-none whitespace-pre-wrap font-sans">
            {recommendation}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={12} className="text-[#a78bfa]" /> AI tarafından üretilmiştir. Doğruluğunu teyit ediniz.
          </div>
        </div>
      ) : (
        !isLoading && !error && (
          <div className="h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 text-sm">
            Verilerinizi analiz etmek için "Tavsiye Al" butonuna tıklayın.
          </div>
        )
      )}
    </div>
  );
};

export default AIRecommendation;
