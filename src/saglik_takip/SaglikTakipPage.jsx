import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { healthService } from './services/healthService';
import HealthForm from './components/HealthForm';
import HealthList from './components/HealthList';
import HealthCharts from './components/HealthCharts';
import AIRecommendation from './components/AIRecommendation';

const SaglikTakipPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [aiTriggerMetric, setAiTriggerMetric] = useState(null);
  const aiRef = React.useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/'); 
        return;
      }
      setUser(user);
      loadMetrics(user.id);
    } catch (error) {
      console.error("Auth error:", error);
      setIsLoading(false);
    }
  };

  const loadMetrics = async (userId) => {
    try {
      const data = await healthService.getMetrics(userId);
      setMetrics(data || []);
    } catch (error) {
      console.error("Veriler yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMetric = async (metricData) => {
    setIsLoading(true);
    try {
      const newMetric = await healthService.addMetric(user.id, metricData);
      setMetrics(prev => [newMetric, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      alert('Veri kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMetric = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    
    setIsLoading(true);
    try {
      await healthService.deleteMetric(id);
      setMetrics(prev => prev.filter(m => m.id !== id));
      
      healthService.cacheData(`metrics_${user.id}`, metrics.filter(m => m.id !== id));
    } catch (error) {
      alert('Kayıt silinirken hata: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiClick = (metric) => {
    setAiTriggerMetric({ metric, timestamp: Date.now() });
    if (aiRef.current) {
      aiRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const themeClass = isDarkMode 
    ? "min-h-screen bg-background text-white p-6 transition-colors duration-500" 
    : "min-h-screen bg-gray-50 text-gray-900 p-6 transition-colors duration-500 [&_div.bg-[#161a28]]:bg-white [&_div.bg-[#161a28]]:border-gray-200 [&_div.bg-[#0e1120]]:bg-gray-50 [&_input]:bg-white [&_input]:border-gray-300 [&_input]:text-gray-900 [&_.text-white]:text-gray-900 [&_.text-gray-400]:text-gray-600 [&_th]:text-gray-700";

  return (
    <div className={themeClass}>
      <div className="max-w-[1200px] mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/home')}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition-colors"
            >
              <ArrowLeft size={20} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]">
                Sağlık Takip
              </h1>
              <p className={isDarkMode ? "text-[#8F9BAC] text-sm mt-1" : "text-gray-500 text-sm mt-1"}>
                Tüm sağlık verilerinizi tek bir yerden yönetin ve analiz edin.
              </p>
            </div>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-gray-400" /> : <Moon size={20} className="text-gray-600" />}
          </button>
        </header>

        {isLoading && metrics.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#2DD4BF]/30 border-t-[#2DD4BF] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full">
              <HealthForm onSubmit={handleAddMetric} isLoading={isLoading} />
            </div>
            
            <div className="w-full">
              <HealthList metrics={metrics} onDelete={handleDeleteMetric} onAiClick={handleAiClick} />
            </div>

            <div className="w-full">
              <HealthCharts metrics={metrics} />
            </div>

            <div className="w-full" ref={aiRef}>
              <AIRecommendation metrics={metrics} triggerMetric={aiTriggerMetric} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaglikTakipPage;
