import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Sparkles, Salad, Target, HeartPulse, Refrigerator, AlertTriangle, Loader2, Flame, List, Search, Download, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Save, CheckCircle, BrainCircuit, Eraser, ClipboardList, X } from 'lucide-react';

const BeslenmePlaniPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [analyzeId, setAnalyzeId] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null); // tarihe tıklanınca yüklenen kayıt
  const ITEMS_PER_PAGE = 5;

  // Form State
  const [formData, setFormData] = useState({
    dietPreference: 'Normal',
    mealCount: '3',
    snack: 'Evet',
    cookingSetup: 'Mutfak var',
    budget: 'Orta',
    waterIntake: '',
    goal: 'Kilo koruma',
    chronicDiseases: '',
    allergies: '',
    medications: '',
    fridgeItems: '',
    calorieGoal: '',
    calorieIntake: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchHistory(user.id);
      } else {
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchHistory = async (uid) => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (!error) setHistory(data || []);
    } catch (e) {
      console.error('Geçmiş yüklenemedi:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Bu planı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('nutrition_plans').delete().eq('id', id);
    if (!error) setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveManual = async () => {
    if (!user) return;
    if (!formData.calorieGoal && !formData.calorieIntake) {
      setSaveMsg({ type: 'error', text: 'Lütfen en az bir kalori değeri girin.' });
      setTimeout(() => setSaveMsg(null), 3000);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('nutrition_plans')
        .insert([{
          user_id: user.id,
          diet_preference: formData.dietPreference,
          meal_count: parseInt(formData.mealCount),
          budget: formData.budget,
          goal: formData.goal,
          medical_history: JSON.stringify({
            chronic: formData.chronicDiseases,
            allergies: formData.allergies,
            medications: formData.medications,
          }),
          calorie_goal: formData.calorieGoal ? parseInt(formData.calorieGoal) : null,
          calorie_intake: formData.calorieIntake ? parseInt(formData.calorieIntake) : null,
          ai_response: null,
        }]);
      if (error) throw error;
      setSaveMsg({ type: 'success', text: 'Veriler başarıyla kaydedildi!' });
      fetchHistory(user.id);
    } catch (e) {
      setSaveMsg({ type: 'error', text: 'Kayıt başarısız: ' + e.message });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleClearForm = () => {
    setFormData({
      dietPreference: 'Normal',
      mealCount: '3',
      snack: 'Evet',
      cookingSetup: 'Mutfak var',
      budget: 'Orta',
      waterIntake: '',
      goal: 'Kilo koruma',
      chronicDiseases: '',
      allergies: '',
      medications: '',
      fridgeItems: '',
      calorieGoal: '',
      calorieIntake: '',
    });
    setSelectedRecord(null);
    setAiResponse('');
  };
  // Tarihe tıklayınca o kaydın verilerini forma yükle
  const handleLoadRecord = (h) => {
    const medical = (() => { try { return JSON.parse(h.medical_history || '{}'); } catch { return {}; } })();
    setFormData(prev => ({
      ...prev,
      dietPreference: h.diet_preference || 'Normal',
      mealCount:      String(h.meal_count || '3'),
      budget:         h.budget || 'Orta',
      goal:           h.goal || 'Kilo koruma',
      calorieGoal:    h.calorie_goal ? String(h.calorie_goal) : '',
      calorieIntake:  h.calorie_intake ? String(h.calorie_intake) : '',
      chronicDiseases: medical.chronic || '',
      allergies:       medical.allergies || '',
      medications:     medical.medications || '',
    }));
    setSelectedRecord(h);
    setAiResponse('');
    // Sayfanın üstüne kayır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeRecord = async (h) => {
    if (analyzeId === h.id) return;
    setAnalyzeId(h.id);
    // Zaten analiz varsa tekrar çekme
    if (analysisResults[h.id]) { setAnalyzeId(null); setExpandedId(h.id); return; }
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('hl_groq_api_key') || '';
      if (!apiKey) throw new Error('Groq API Key bulunamadı.');

      const medical = (() => { try { return JSON.parse(h.medical_history || '{}'); } catch { return {}; } })();

      const prompt = `
Sen profesyonel bir diyetisyen ve beslenme uzmanısın. Kullanıcının kalori takip verilerini analiz et ve kişiselleştirilmiş, pratik geri bildirim ver.

KULLANICI VERİLERİ:
- Hedef: ${h.goal || 'Belirtilmemiş'}
- Diyet Tercihi: ${h.diet_preference || 'Normal'}
- Bütçe: ${h.budget || 'Orta'}
- Öğün Sayısı: ${h.meal_count || 3} öğün
- Günlük Kalori Hedefi: ${h.calorie_goal ? h.calorie_goal + ' kcal' : 'Girilmemiş'}
- Bugün Alınan Kalori: ${h.calorie_intake ? h.calorie_intake + ' kcal' : 'Girilmemiş'}
- Fark: ${h.calorie_goal && h.calorie_intake ? (Number(h.calorie_intake) - Number(h.calorie_goal)) + ' kcal' : 'Hesaplanamadı'}
${medical.chronic ? '- Kronik Hastalık: ' + medical.chronic : ''}
${medical.allergies ? '- Alerjiler: ' + medical.allergies : ''}

Lütfen şunları Türkçe, madde madde ve kısa-öz yaz:
1. Bu güne ait kalori durumunun değerlendirmesi (hedefe göre iyi mi, fazla mı, eksik mi?)
2. Bu hedefe ve diyet tipine uygun 3 pratik besin önerisi
3. Motivasyon cümlesi
`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Sen profesyonel bir Türk diyetisyen ve beslenme uzmanısın. Her zaman Türkçe yanıt ver.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message || res.statusText); }
      const data = await res.json();
      const text = data.choices[0]?.message?.content || 'Analiz alınamadı.';
      setAnalysisResults(prev => ({ ...prev, [h.id]: text }));
      setExpandedId(h.id);
    } catch (e) {
      setAnalysisResults(prev => ({ ...prev, [h.id]: 'Hata: ' + e.message }));
    } finally {
      setAnalyzeId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setAiResponse('');
    
    try {
      // Groq API - fetch ile doğrudan çağrı (ekstra paket gerekmez)
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('hl_groq_api_key') || '';
      
      if (!apiKey) {
        throw new Error('Groq API Key bulunamadı. Lütfen .env.local dosyasına VITE_GROQ_API_KEY ekleyin.');
      }

      const prompt = `
Sen profesyonel bir diyetisyen ve beslenme uzmanısın. Kullanıcının verdiği bilgilere göre ona özel, sağlıklı, uygulanabilir ve standartlaştırılmış kalori verilerine dayanan bir beslenme planı hazırlamalısın.

LÜTFEN ŞU KURALLARA DİKKAT ET:
1. Bu bir tıbbi tavsiye değildir, sadece rehber niteliğindedir. (Planın en başında bunu belirt).
2. Porsiyonların kalori değerlerini verirken çok dikkatli ol. Halüsinasyon yapma. Gerçekçi ve standart veri tabanlarına uygun kaloriler ver (Örn: 1 dilim tam buğday ekmeği ~70 kcal).
3. Kullanıcının alerjileri ve hastalıkları varsa bunları KESİNLİKLE dikkate al, tehlikeli olabilecek besinleri önerme.
4. Çıktıyı Türkçe olarak ve okunması kolay, temiz bir düz metin formatında ver. Madde işaretleri için tire (-) kullan.

KULLANICI BİLGİLERİ:
- Diyet Tercihi: ${formData.dietPreference}
- Öğün Sayısı: ${formData.mealCount} ana öğün, Ara öğün: ${formData.snack}
- Pişirme İmkanı: ${formData.cookingSetup}
- Bütçe: ${formData.budget}
- Günlük Su Tüketimi: ${formData.waterIntake} Litre
- Hedef: ${formData.goal}
- Kronik Hastalıklar: ${formData.chronicDiseases || 'Yok'}
- Alerjiler/İntoleranslar: ${formData.allergies || 'Yok'}
- Kullanılan İlaçlar: ${formData.medications || 'Yok'}
- Buzdolabındaki Malzemeler: ${formData.fridgeItems || 'Belirtilmedi'}

Lütfen kahvaltı, öğle yemeği, akşam yemeği (ve varsa ara öğünler) için detaylı bir günlük örnek menü ve genel tavsiyeler oluştur.
`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Sen profesyonel bir Türk diyetisyen ve beslenme uzmanısın. Her zaman Türkçe yanıt ver.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!groqRes.ok) {
        const errData = await groqRes.json();
        throw new Error(`Groq API Hatası: ${errData?.error?.message || groqRes.statusText}`);
      }

      const groqData = await groqRes.json();
      const responseText = groqData.choices[0]?.message?.content || '';
      
      setAiResponse(responseText);

      // Save to Supabase — seçili kayıttan plan üretiliyorsa tekrar kaydetme
      if (user && !selectedRecord) {
        const { error } = await supabase
          .from('nutrition_plans')
          .insert([
            {
              user_id: user.id,
              diet_preference: formData.dietPreference,
              meal_count: parseInt(formData.mealCount),
              budget: formData.budget,
              goal: formData.goal,
              medical_history: JSON.stringify({
                chronic: formData.chronicDiseases,
                allergies: formData.allergies,
                medications: formData.medications
              }),
              calorie_goal: formData.calorieGoal ? parseInt(formData.calorieGoal) : null,
              calorie_intake: formData.calorieIntake ? parseInt(formData.calorieIntake) : null,
              ai_response: responseText,
            }
          ]);
        
        if (error) {
          console.error("Supabase kaydetme hatası:", error);
        } else {
          fetchHistory(user.id);
        }
      }

    } catch (error) {
      console.error(error);
      setAiResponse(`Bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex justify-center">
        <div className="max-w-[900px] w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400 hover:text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#34d399] flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <Salad size={20} className="text-black" />
              </div>
              <div>
                <h1 className="text-white font-bold text-[18px] leading-tight">Beslenme Planı</h1>
                <p className="text-gray-400 text-[13px]">AI Destekli Kişiselleştirilmiş Plan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] w-full mx-auto px-6 py-10 flex flex-col gap-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Alışkanlıklar */}
          <div className="bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-lg">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="p-2 bg-[#34d399]/10 rounded-lg">
                <Salad className="text-[#34d399]" size={20} />
              </div>
              <h2 className="text-white font-bold text-lg">Alışkanlıklar & Tercihler</h2>
            </div>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Diyet Tercihi</label>
                <select name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                  <option value="Normal">Normal</option>
                  <option value="Vejetaryen">Vejetaryen</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pesketaryen">Pesketaryen</option>
                  <option value="Ketojenik">Ketojenik</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Aralıklı Oruç (IF)">Aralıklı Oruç (IF)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Öğün Sayısı</label>
                  <select name="mealCount" value={formData.mealCount} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                    <option value="2">2 Öğün</option>
                    <option value="3">3 Öğün</option>
                    <option value="4">4 Öğün</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Ara Öğün İsteği</label>
                  <select name="snack" value={formData.snack} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                    <option value="Evet">Evet</option>
                    <option value="Hayır">Hayır</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Pişirme İmkanı</label>
                <select name="cookingSetup" value={formData.cookingSetup} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                  <option value="Mutfak var, zamanım geniş">Mutfak var, zamanım geniş</option>
                  <option value="Mutfak var, hızlı tarifler (15-20 dk)">Mutfak var, hızlı tarifler</option>
                  <option value="Sınırlı imkan (Yurt, Ofis)">Sınırlı imkan (Yurt, Ofis vb.)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Bütçe</label>
                  <select name="budget" value={formData.budget} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                    <option value="Öğrenci Bütçesi">Öğrenci</option>
                    <option value="Orta">Orta</option>
                    <option value="Lüks">Esnek / Lüks</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Su Tüketimi (Lt)</label>
                  <input type="number" name="waterIntake" value={formData.waterIntake} onChange={handleChange} placeholder="Örn: 2.5" step="0.1" min="0" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* Section 2: Hedefler */}
            <div className="bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-lg">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="p-2 bg-[#34d399]/10 rounded-lg">
                  <Target className="text-[#34d399]" size={20} />
                </div>
                <h2 className="text-white font-bold text-lg">Hedefler & Motivasyon</h2>
              </div>
              
              <div>
                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors appearance-none">
                  <option value="Kilo Verme">Kilo Verme</option>
                  <option value="Kilo Alma">Kilo Alma</option>
                  <option value="Kilo Koruma">Kilo Koruma</option>
                  <option value="Kas Kütlesi Artırma">Kas Kütlesi Artırma</option>
                  <option value="Yağ Oranı Düşürme">Yağ Oranı Düşürme</option>
                  <option value="Genel Sağlık & Bağışıklık">Genel Sağlık & Bağışıklık</option>
                  <option value="Yarışma Hazırlığı">Yarışma Hazırlığı</option>
                </select>
              </div>
            </div>

            {/* Section 3: Sağlık */}
            <div className="bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-lg flex-1">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="p-2 bg-[#34d399]/10 rounded-lg">
                  <HeartPulse className="text-[#34d399]" size={20} />
                </div>
                <h2 className="text-white font-bold text-lg">Sağlık & Tıbbi Geçmiş</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Kronik Hastalıklar <span className="text-gray-600 text-xs">(Opsiyonel)</span></label>
                  <input type="text" name="chronicDiseases" value={formData.chronicDiseases} onChange={handleChange} placeholder="Örn: Diyabet, Tansiyon, PCOS..." className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Alerjiler & İntoleranslar <span className="text-gray-600 text-xs">(Opsiyonel)</span></label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Örn: Gluten, Laktoz, Yer Fıstığı..." className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Kullanılan İlaçlar <span className="text-gray-600 text-xs">(Opsiyonel)</span></label>
                  <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="Besin etkileşimi için önemlidir" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Akıllı Öğün Planlayıcı */}
          <div className="bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-lg md:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="p-2 bg-[#34d399]/10 rounded-lg">
                <Refrigerator className="text-[#34d399]" size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Akıllı Öğün Planlayıcı</h2>
                <p className="text-gray-400 text-xs mt-1">Elinizdeki malzemeleri girin, israfı önleyelim ve pratik tarifler üretelim.</p>
              </div>
            </div>
            
            <textarea
              name="fridgeItems"
              value={formData.fridgeItems}
              onChange={handleChange}
              placeholder="Örn: Dolapta 3 yumurta, biraz ıspanak, yarım kalıp beyaz peynir ve domates var..."
              className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors min-h-[120px] resize-y"
            ></textarea>
          </div>

          {/* Section 5: Kalori Takibi */}
          <div className="bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 shadow-lg md:col-span-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="p-2 bg-[#34d399]/10 rounded-lg">
                <Flame className="text-[#34d399]" size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Kalori Takibi</h2>
                <p className="text-gray-400 text-xs mt-1">Günlük hedef ve gerçek kalori alımınızı girerek grafikle karşılaştırın.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Günlük Hedef Kalori (kcal)</label>
                <input
                  type="number"
                  name="calorieGoal"
                  value={formData.calorieGoal}
                  onChange={handleChange}
                  placeholder="Örn: 2000"
                  min="500" max="6000"
                  className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Bugün Aldığım Kalori (kcal)</label>
                <input
                  type="number"
                  name="calorieIntake"
                  value={formData.calorieIntake}
                  onChange={handleChange}
                  placeholder="Örn: 1450"
                  min="0" max="8000"
                  className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#34d399]/50 transition-colors"
                />
              </div>
            </div>

            {/* Grafik Karşılaştırma */}
            {(formData.calorieGoal || formData.calorieIntake) && (
              <div className="bg-[#0B0D17] rounded-2xl p-6 border border-white/5">
                <h3 className="text-white font-bold text-[15px] mb-6">Kalori Grafik Analizi</h3>
                <div className="flex flex-col gap-5">
                  {/* Hedef Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-medium">Hedef Kalori</span>
                      <span className="text-[#34d399] font-bold">{formData.calorieGoal ? `${Number(formData.calorieGoal).toLocaleString()} kcal` : '—'}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-[#34d399] transition-all duration-700"
                        style={{ width: formData.calorieGoal ? '100%' : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Alınan Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-medium">Alınan Kalori</span>
                      <span
                        className={`font-bold ${
                          formData.calorieGoal && formData.calorieIntake
                            ? Number(formData.calorieIntake) > Number(formData.calorieGoal)
                              ? 'text-red-400'
                              : 'text-[#34d399]'
                            : 'text-gray-400'
                        }`}
                      >
                        {formData.calorieIntake ? `${Number(formData.calorieIntake).toLocaleString()} kcal` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: formData.calorieGoal && formData.calorieIntake
                            ? `${Math.min((Number(formData.calorieIntake) / Number(formData.calorieGoal)) * 100, 100)}%`
                            : '0%',
                          background: formData.calorieGoal && formData.calorieIntake && Number(formData.calorieIntake) > Number(formData.calorieGoal)
                            ? 'linear-gradient(to right, #f97316, #ef4444)'
                            : 'linear-gradient(to right, #0D9488, #34d399)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Özet Tablo */}
                  {formData.calorieGoal && formData.calorieIntake && (
                    <div className="mt-2 grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Hedef</p>
                        <p className="text-white font-bold text-lg">{Number(formData.calorieGoal).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Alınan</p>
                        <p className={`font-bold text-lg ${
                          Number(formData.calorieIntake) > Number(formData.calorieGoal) ? 'text-red-400' : 'text-[#34d399]'
                        }`}>{Number(formData.calorieIntake).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">kcal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs mb-1">Fark</p>
                        <p className={`font-bold text-lg ${
                          Number(formData.calorieIntake) > Number(formData.calorieGoal) ? 'text-red-400' : 'text-[#34d399]'
                        }`}>
                          {Number(formData.calorieIntake) > Number(formData.calorieGoal) ? '+' : ''}
                          {(Number(formData.calorieIntake) - Number(formData.calorieGoal)).toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">kcal</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kaydet Butonu */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 min-h-[28px]">
                {saveMsg && (
                  <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl animate-pulse ${
                    saveMsg.type === 'success'
                      ? 'bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {saveMsg.type === 'success'
                      ? <CheckCircle size={15} />
                      : <AlertTriangle size={15} />
                    }
                    {saveMsg.text}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClearForm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 font-semibold text-sm transition-all duration-200 hover:text-white"
                >
                  <Eraser size={16} /> Temizle
                </button>
                <button
                  onClick={handleSaveManual}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#34d399] text-black font-semibold text-sm shadow-[0_0_16px_rgba(52,211,153,0.25)] hover:shadow-[0_0_24px_rgba(52,211,153,0.4)] hover:scale-[1.03] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</>
                  ) : (
                    <><Save size={16} /> Geçmişe Kaydet</>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* AI Sonuç Alanı */}
        {aiResponse && (
          <div className="mt-8 bg-[#161a28] border border-[#34d399]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(52,211,153,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0D9488] to-[#34d399]"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-[#34d399]/15 rounded-xl border border-[#34d399]/30">
                <Sparkles className="text-[#34d399]" size={24} />
              </div>
              <h2 className="text-2xl font-black text-white">Sana Özel Beslenme Planı</h2>
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-300 prose-strong:text-[#34d399] whitespace-pre-wrap text-[15px]">
              {aiResponse}
            </div>
          </div>
        )}

        {/* Veri Geçmişi */}
        <div className="mt-10 bg-[#161a28] border border-white/5 rounded-2xl p-6 flex flex-col gap-6 hover:border-[#34d399]/20 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#34d399]/15 flex items-center justify-center">
                <List size={20} className="text-[#34d399]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Veri Geçmişi</h2>
                <p className="text-[#8F9BAC] text-sm">Önceki oluşturduğunuz planları inceleyin.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Hedef veya diyet ara..."
                  value={historySearch}
                  onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                  className="pl-9 pr-4 py-2 bg-[#0e1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#34d399] transition-colors w-full sm:w-48"
                />
              </div>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
                  const a = document.createElement('a'); a.setAttribute('href', dataStr); a.setAttribute('download', 'beslenme_planlari.json'); document.body.appendChild(a); a.click(); a.remove();
                }}
                title="JSON olarak dışa aktar"
                className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-4 border-[#34d399]/30 border-t-[#34d399] rounded-full animate-spin" />
            </div>
          ) : (() => {
            const filtered = history.filter(h =>
              (h.goal || '').toLowerCase().includes(historySearch.toLowerCase()) ||
              (h.diet_preference || '').toLowerCase().includes(historySearch.toLowerCase())
            );
            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
            const current = filtered.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs uppercase bg-[#0e1120] text-gray-500 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Tarih</th>
                        <th className="px-4 py-3">Hedef</th>
                        <th className="px-4 py-3">Kalori Hedefi</th>
                        <th className="px-4 py-3">Alınan Kalori</th>
                        <th className="px-4 py-3">Diyet</th>
                        <th className="px-4 py-3">Bütçe</th>
                        <th className="px-4 py-3">Öğün</th>
                        <th className="px-4 py-3 text-right rounded-tr-lg">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-10 text-gray-500">Henüz kaydedilmiş plan bulunmuyor.</td>
                        </tr>
                      ) : current.map((h) => (
                        <React.Fragment key={h.id}>
                          <tr className={`border-b border-white/5 transition-colors ${
                            selectedRecord?.id === h.id
                              ? 'bg-[#34d399]/5 border-l-2 border-l-[#34d399]/40'
                              : 'hover:bg-white/5'
                          }`}>
                            <td
                              className="px-4 py-3 font-medium text-white cursor-pointer group"
                              onClick={() => handleLoadRecord(h)}
                              title="Forma yükle ve plan oluştur"
                            >
                              <div className="flex items-center gap-2">
                                <span className={selectedRecord?.id === h.id ? 'text-[#34d399]' : ''}>
                                  {new Date(h.created_at).toLocaleDateString('tr-TR')}
                                </span>
                                <ClipboardList
                                  size={13}
                                  className={`transition-opacity ${
                                    selectedRecord?.id === h.id
                                      ? 'text-[#34d399] opacity-100'
                                      : 'text-gray-600 opacity-0 group-hover:opacity-100'
                                  }`}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">{h.goal || '-'}</td>
                            <td className="px-4 py-3">
                              {h.calorie_goal
                                ? <span className="text-[#34d399] font-semibold">{Number(h.calorie_goal).toLocaleString()} kcal</span>
                                : <span className="text-gray-600">—</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              {h.calorie_intake
                                ? <span className={`font-semibold ${
                                    h.calorie_goal && Number(h.calorie_intake) > Number(h.calorie_goal)
                                      ? 'text-red-400'
                                      : 'text-[#34d399]'
                                  }`}>{Number(h.calorie_intake).toLocaleString()} kcal</span>
                                : <span className="text-gray-600">—</span>
                              }
                            </td>
                            <td className="px-4 py-3">{h.diet_preference || '-'}</td>
                            <td className="px-4 py-3">{h.budget || '-'}</td>
                            <td className="px-4 py-3">{h.meal_count || '-'} öğün</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                {/* AI Analiz Butonu */}
                                <button
                                  onClick={() => handleAnalyzeRecord(h)}
                                  disabled={analyzeId === h.id}
                                  title="AI ile Analiz Et"
                                  className="text-gray-500 hover:text-purple-400 transition-colors p-1 disabled:opacity-50"
                                >
                                  {analyzeId === h.id
                                    ? <Loader2 size={16} className="animate-spin text-purple-400" />
                                    : <BrainCircuit size={16} />
                                  }
                                </button>
                                <button
                                  onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}
                                  title="Planı Görüntüle"
                                  className="text-gray-500 hover:text-[#34d399] transition-colors p-1"
                                >
                                  {expandedId === h.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteHistory(h.id)}
                                  title="Sil"
                                  className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedId === h.id && (
                            <tr>
                              <td colSpan="8" className="px-4 pb-4 pt-2">
                                <div className="bg-[#0B0D17] border border-[#34d399]/20 rounded-xl p-5 text-gray-300 text-[13px] leading-relaxed">
                                  {/* Kalori Özet Tablosu */}
                                  {h.calorie_goal && h.calorie_intake && (
                                    <div className="flex gap-6 mb-4 pb-4 border-b border-white/10">
                                      <div className="text-center">
                                        <p className="text-gray-500 text-[11px] mb-0.5">Kalori Hedefi</p>
                                        <p className="text-[#34d399] font-bold">{Number(h.calorie_goal).toLocaleString()} kcal</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-500 text-[11px] mb-0.5">Alınan Kalori</p>
                                        <p className={`font-bold ${Number(h.calorie_intake) > Number(h.calorie_goal) ? 'text-red-400' : 'text-[#34d399]'}`}>
                                          {Number(h.calorie_intake).toLocaleString()} kcal
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-500 text-[11px] mb-0.5">Fark</p>
                                        <p className={`font-bold ${Number(h.calorie_intake) > Number(h.calorie_goal) ? 'text-red-400' : 'text-[#34d399]'}`}>
                                          {Number(h.calorie_intake) > Number(h.calorie_goal) ? '+' : ''}
                                          {(Number(h.calorie_intake) - Number(h.calorie_goal)).toLocaleString()} kcal
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Analiz Sonucu */}
                                  {analysisResults[h.id] && (
                                    <div className="mb-4 pb-4 border-b border-purple-500/20">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-purple-500/15 rounded-lg border border-purple-500/20">
                                          <BrainCircuit size={14} className="text-purple-400" />
                                        </div>
                                        <span className="text-purple-300 font-semibold text-[13px]">AI Analiz</span>
                                      </div>
                                      <div className="whitespace-pre-wrap text-gray-300 text-[13px] leading-relaxed">
                                        {analysisResults[h.id]}
                                      </div>
                                    </div>
                                  )}

                                  {/* AI Beslenme Planı Metni */}
                                  {h.ai_response && (
                                    <div className="whitespace-pre-wrap">
                                      {h.ai_response}
                                    </div>
                                  )}
                                  {!h.ai_response && !analysisResults[h.id] && (
                                    <p className="text-gray-600 italic">Henüz AI planı veya analizi yok. “AI Analiz” butonuna tıklayın.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-xs text-gray-500">Sayfa {historyPage} / {totalPages}</span>
                    <div className="flex gap-2">
                      <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)} className="p-1.5 rounded-lg bg-[#0e1120] border border-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white"><ChevronLeft size={16} /></button>
                      <button disabled={historyPage === totalPages} onClick={() => setHistoryPage(p => p + 1)} className="p-1.5 rounded-lg bg-[#0e1120] border border-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Butonlar - En Altta */}
        <div className="flex flex-col items-center gap-4 mt-6 pb-6">

          {/* Seçili kayıt bildirimi */}
          {selectedRecord && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#34d399]/10 border border-[#34d399]/25 text-sm">
              <ClipboardList size={16} className="text-[#34d399] shrink-0" />
              <span className="text-gray-300">
                <span className="text-[#34d399] font-semibold">
                  {new Date(selectedRecord.created_at).toLocaleDateString('tr-TR')}
                </span>
                {' '}tarihli kayıt yüklendi — Bu veriler için plan oluşturulacak.
              </span>
              <button
                onClick={() => { setSelectedRecord(null); }}
                className="ml-1 text-gray-500 hover:text-white transition-colors"
                title="Seçimi kaldır"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#0D9488] to-[#34d399] text-black font-bold text-lg shadow-[0_0_24px_rgba(52,211,153,0.35)] hover:shadow-[0_0_36px_rgba(52,211,153,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <><Loader2 size={24} className="animate-spin" /> Plan Oluşturuluyor...</>
              ) : (
                <><Sparkles size={24} /> AI Beslenme Planı Oluştur</>
              )}
            </button>

            {aiResponse && (
              <button
                onClick={() => setAiResponse('')}
                className="flex items-center gap-2 px-6 py-4 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-semibold text-base hover:bg-red-500/20 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300"
              >
                <Eraser size={20} />
                Temizle
              </button>
            )}
          </div>
          <div className="flex items-start justify-center gap-2 text-gray-500 max-w-2xl px-4 text-center">
            <p className="text-[12px] leading-relaxed">
              <AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />
              <strong className="text-gray-400">Tıbbi Sorumluluk Reddi:</strong> Bu uygulama bir tıp doktoru veya kayıtlı bir diyetisyen değildir. Planlar genel rehberlik amaçlıdır. Diyabet, böbrek hastalığı veya kronik rahıtsızlıklarınız varsa mutlaka doktorunuza danışınız.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default BeslenmePlaniPage;
