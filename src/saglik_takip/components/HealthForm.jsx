import React, { useState } from 'react';
import { Activity, Plus, AlertCircle } from 'lucide-react';

const HealthForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    heart_rate: '',
    blood_sugar: '',
    weight: '',
    height: '',
    spo2: '',
    temperature: '',
    sleep_hours: '',
    steps: ''
  });

  const [errors, setErrors] = useState({});

  const validate = (name, value) => {
    let error = '';
    const num = Number(value);
    
    if (value !== '') {
      switch (name) {
        case 'heart_rate':
          if (num < 30 || num > 220) error = 'Nabız 30-220 arası olmalıdır.';
          break;
        case 'blood_sugar':
          if (num < 20 || num > 600) error = 'Kan şekeri 20-600 arası olmalıdır.';
          break;
        case 'weight':
          if (num < 20 || num > 300) error = 'Kilo 20-300 kg arası olmalıdır.';
          break;
        case 'height':
          if (num < 50 || num > 250) error = 'Boy 50-250 cm arası olmalıdır.';
          break;
        case 'spo2':
          if (num < 50 || num > 100) error = 'SpO2 %50-100 arası olmalıdır.';
          break;
        case 'temperature':
          if (num < 30 || num > 43) error = 'Ateş 30-43°C arası olmalıdır.';
          break;
        case 'sleep_hours':
          if (num < 0 || num > 24) error = 'Uyku süresi 0-24 saat arası olmalıdır.';
          break;
        case 'steps':
          if (num < 0 || num > 100000) error = 'Geçerli bir adım sayısı girin.';
          break;
        default:
          break;
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validate(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'date') {
        const err = validate(key, formData[key]);
        if (err) newErrors[key] = err;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let bmi = null;
    if (formData.weight && formData.height) {
      const heightInMeters = Number(formData.height) / 100;
      bmi = Number((Number(formData.weight) / (heightInMeters * heightInMeters)).toFixed(2));
    }

    const submissionData = { ...formData, bmi };
    
    Object.keys(submissionData).forEach(key => {
      if (submissionData[key] === '') submissionData[key] = null;
      else if (key !== 'date' && submissionData[key] !== null) submissionData[key] = Number(submissionData[key]);
    });

    onSubmit(submissionData);
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      heart_rate: '',
      blood_sugar: '',
      weight: '',
      height: '',
      spo2: '',
      temperature: '',
      sleep_hours: '',
      steps: ''
    });
  };

  const inputClasses = "w-full bg-[#0e1120] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2DD4BF] transition-colors";

  return (
    <div className="bg-[#161a28] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#2DD4BF]/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0D9488]/15 flex items-center justify-center">
          <Activity size={20} className="text-[#2DD4BF]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Veri Girişi</h2>
          <p className="text-[#8F9BAC] text-sm">Günlük sağlık metriklerinizi kaydedin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Tarih *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClasses} />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Nabız (bpm)</label>
            <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} placeholder="Örn: 72" className={inputClasses} />
            {errors.heart_rate && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.heart_rate}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Kan Şekeri (mg/dL)</label>
            <input type="number" name="blood_sugar" value={formData.blood_sugar} onChange={handleChange} placeholder="Örn: 95" className={inputClasses} />
            {errors.blood_sugar && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.blood_sugar}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Kilo (kg)</label>
            <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} placeholder="Örn: 70.5" className={inputClasses} />
            {errors.weight && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.weight}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Boy (cm)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Örn: 175" className={inputClasses} />
            {errors.height && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.height}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">SpO2 (%)</label>
            <input type="number" name="spo2" value={formData.spo2} onChange={handleChange} placeholder="Örn: 98" className={inputClasses} />
            {errors.spo2 && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.spo2}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Ateş (°C)</label>
            <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Örn: 36.6" className={inputClasses} />
            {errors.temperature && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.temperature}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Uyku Süresi (Saat)</label>
            <input type="number" step="0.5" name="sleep_hours" value={formData.sleep_hours} onChange={handleChange} placeholder="Örn: 7.5" className={inputClasses} />
            {errors.sleep_hours && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.sleep_hours}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-400 font-medium ml-1">Adım Sayısı</label>
            <input type="number" name="steps" value={formData.steps} onChange={handleChange} placeholder="Örn: 8000" className={inputClasses} />
            {errors.steps && <span className="text-red-400 text-xs flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.steps}</span>}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || Object.values(errors).some(e => e !== '')}
          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-black font-bold text-[15px] shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={18} strokeWidth={2.5} /> Kaydet
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default HealthForm;
