import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, X, HeartPulse, Salad, Dumbbell, ChevronRight, ChevronLeft, Sparkles, Activity, Flame, Moon, Footprints, Apple, Beef, Wheat, Droplets, Timer, TrendingUp, ScanLine, BrainCircuit, Star, RefreshCw, MessageSquareQuote, Quote, Edit2, Mail, Phone, Github, Linkedin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import laptopMockup from '../assets/laptop_mockup.png';
import imgSaglik from '../assets/feature_saglik_takip.png';
import imgBeslenme from '../assets/feature_beslenme.png';
import imgEgzersiz from '../assets/feature_egzersiz.png';
import imgAiKalori from '../assets/feature_ai_kalori.png';
import Comments from '../components/Comments';

const featureCards = [
  {
    img: imgSaglik,
    title: 'Sağlık Takip',
    desc: 'Kalp atışı, adım sayısı ve uyku verilerini anlık olarak izle.',
    color: 'from-[#0D9488] to-[#2DD4BF]',
    route: '/saglik-takip',
  },
  {
    img: imgBeslenme,
    title: 'Beslenme Planlama',
    desc: 'Hedeflerine özel günlük öğün ve kalori planı oluştur.',
    color: 'from-[#0D9488] to-[#34d399]',
    route: '/beslenme',
  },
  {
    img: imgEgzersiz,
    title: 'Egzersiz Rehberim',
    desc: 'Seviyene uygun antrenman programları ile forma gir.',
    color: 'from-[#0891b2] to-[#2DD4BF]',
    route: '/egzersiz',
  },
  {
    img: imgAiKalori,
    title: 'AI Kalori Analiz',
    desc: 'Yapay zeka ile yemeğinin kalorisini ve besin değerini öğren.',
    color: 'from-[#7c3aed] to-[#2DD4BF]',
    route: '/ai-kalori',
  },
];

const features = [
  {
    icon: <HeartPulse size={20} className="text-[#2DD4BF]" />,
    title: 'Sağlık Takip',
    desc: 'Kalp atışı, adım sayısı, uyku düzeni ve günlük aktivitelerini tek ekranda izle.',
  },
  {
    icon: <Salad size={20} className="text-[#2DD4BF]" />,
    title: 'Beslenme Planı',
    desc: 'Kişisel hedeflerine göre özelleştirilmiş günlük öğün ve kalori planı oluştur.',
  },
  {
    icon: <Dumbbell size={20} className="text-[#2DD4BF]" />,
    title: 'Egzersiz Rehberi',
    desc: 'Seviyene uygun antrenman programları ve video destekli hareketlerle forma gir.',
  },
  {
    icon: <Sparkles size={20} className="text-[#2DD4BF]" />,
    title: 'AI Kalori Analiz',
    desc: 'Yapay zeka destekli kalori analizi ile yediğin yemeklerin besin değerini anında öğren ve günlük hedeflerin doğrultusunda beslen.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [dashDate, setDashDate] = useState(new Date());

  // Comment states removed

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevDay = () => {
    const d = new Date(dashDate);
    d.setDate(d.getDate() - 1);
    setDashDate(d);
  };

  const nextDay = () => {
    const d = new Date(dashDate);
    d.setDate(d.getDate() + 1);
    const next = new Date(d);
    next.setHours(0, 0, 0, 0);
    if (next <= today) setDashDate(d);
  };

  const isToday = () => {
    const d = new Date(dashDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const formatDate = (date) =>
    date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch age and gender from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  const scrollToSection = (id) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        // Adjust scroll position slightly higher for sticky header (optional)
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex justify-center">
        <div className="max-w-[1100px] w-full flex flex-wrap items-center justify-between px-6 py-4">
          
          {/* Left: Logo Area */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <span className="text-black font-black text-2xl">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#2DD4BF] font-bold tracking-[0.15em] text-sm leading-tight">HEALTH&amp;LIFE</span>
              <span className="text-gray-400 text-xs mt-0.5">Akıllı Sağlık ve Beslenme</span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center bg-[#161a28] rounded-full px-8 py-3 shadow-sm border border-white/5">
            <ul className="flex items-center gap-8 text-[15px] text-gray-300">
              <li onClick={() => scrollToSection('top')} className="text-white font-medium cursor-pointer">Anasayfa</li>
              <li onClick={() => scrollToSection('ozellikler')} className="hover:text-white transition-colors cursor-pointer">Özellikler</li>
              <li onClick={() => scrollToSection('dashboard')} className="hover:text-white transition-colors cursor-pointer">Dashboard</li>
              <li onClick={() => scrollToSection('yorumlar')} className="hover:text-white transition-colors cursor-pointer">Yorumlar</li>
              <li onClick={() => scrollToSection('iletisim')} className="hover:text-white transition-colors cursor-pointer">İletişim</li>
            </ul>
          </nav>

          {/* Right: User Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full border border-white/10 bg-transparent lg:bg-[#161a28]/40 cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-white/20 transition-all shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-500" size={24} fill="currentColor" />
                )}
              </div>
              <div className="flex flex-col items-start pr-1">
                <span className="text-white text-[15px] font-semibold leading-tight">{user?.user_metadata?.username || 'Kullanıcı'}</span>
                <span className="text-gray-400 text-[12px] leading-tight mt-0.5">Hoş geldin</span>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-transparent hover:bg-red-500/10 text-[#8F9BAC] hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
              title="Çıkış Yap"
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-[1100px] w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT: Text + Button ── */}
          <div className="flex flex-col gap-7 relative">
            {/* Site Adı */}
            <div>
              <span className="inline-block text-[#2DD4BF] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
                Health &amp; Life
              </span>
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                Sağlık bir reçete<br />
                <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34d399] bg-clip-text text-transparent">
                  değil, yolculuktur.
                </span>
              </h1>
            </div>

            {/* Alıntı */}
            <p className="text-[#8F9BAC] text-lg leading-relaxed max-w-md">
              Sağlık reçete değil, kişisel bir yolculuk. Sana özel haritanı birlikte çizelim.
            </p>

            {/* Neler Yapabilirsin Butonu */}
            <div className="relative w-fit">
              <button
                id="features-btn"
                onClick={() => setShowPopup(prev => !prev)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-black font-bold text-[15px] shadow-[0_0_24px_rgba(45,212,191,0.35)] hover:shadow-[0_0_36px_rgba(45,212,191,0.5)] hover:scale-105 transition-all duration-300"
              >
                Neler Yapabilirsin
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── Modal Overlay ── */}
            {showPopup && (
              <>
                {/* Karanlık arka plan — tıklayınca kapanır */}
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  onClick={() => setShowPopup(false)}
                  style={{ animation: 'fadeIn 0.18s ease both' }}
                />

                {/* Modal Kart — ekran ortasında sabit */}
                <div
                  id="features-popup"
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[480px] bg-[#161a28] border border-[#2DD4BF]/20 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] z-50 overflow-hidden"
                  style={{ animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
                >
                  {/* Başlık + Kapat */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
                        <Sparkles size={14} className="text-black" />
                      </div>
                      <span className="text-white font-bold text-[16px]">Neler Yapabilirsin?</span>
                    </div>
                    <button
                      id="close-popup-btn"
                      onClick={() => setShowPopup(false)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Maddeler */}
                  <ul className="flex flex-col gap-1 px-5 py-5">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-[#0D9488]/15 flex items-center justify-center">
                          {f.icon}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-[14px] leading-tight">{f.title}</p>
                          <p className="text-gray-400 text-[13px] leading-snug mt-1">{f.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT: Laptop Mockup ── */}
          <div className="flex items-center justify-center relative">
            {/* Arka plan parlaması */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-[#2DD4BF]/10 blur-[80px]" />
            </div>
            <img
              src={laptopMockup}
              alt="Health & Life uygulama önizlemesi"
              className="relative w-full max-w-[560px] object-contain drop-shadow-2xl"
              style={{ animation: 'floatY 4s ease-in-out infinite' }}
            />
          </div>

        </div>
      </main>

      {/* ── Özellikler Section ── */}
      <section id="ozellikler" className="flex justify-center px-6 pb-24">
        <div className="max-w-[1100px] w-full">

          {/* Başlık */}
          <div className="text-left mb-12">
            <span className="inline-block text-[#2DD4BF] text-2xl font-black tracking-[0.15em] uppercase mb-4">Özellikler</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Sağlığını yönetmek
              <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34d399] bg-clip-text text-transparent"> bu kadar kolay.</span>
            </h2>
            <p className="text-[#8F9BAC] mt-4 text-base max-w-xl">
              Health &amp; Life'ın sunduğu akıllı araçlarla sağlıklı yaşamın her adımında yanındayız.
            </p>
          </div>

          {/* Kart Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="group flex flex-col bg-[#161a28] border border-white/5 rounded-2xl overflow-hidden hover:border-[#2DD4BF]/30 hover:shadow-[0_0_32px_rgba(45,212,191,0.12)] transition-all duration-300"
              >
                {/* Görsel */}
                <div className="relative h-56 overflow-hidden bg-[#0e1120]">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Üst gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                </div>

                {/* İçerik */}
                <div className="flex flex-col flex-1 p-6 gap-3">
                  <h3 className="text-white font-bold text-[17px] leading-tight">{card.title}</h3>
                  <p className="text-[#8F9BAC] text-[13px] leading-relaxed flex-1">{card.desc}</p>

                  {/* Buton */}
                  {card.route === '/saglik-takip' || card.route === '/beslenme' ? (
                    <button
                      onClick={() => navigate(card.route)}
                      className={`mt-1 w-full py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-r ${card.color} text-black shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] transition-all duration-300 hover:scale-[1.02]`}
                    >
                      Hemen Başla
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Yakında aktif olacak"
                      className="mt-1 w-full py-2.5 rounded-xl text-[13px] font-semibold bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed select-none"
                    >
                      Yakında Aktif
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Dashboard Section ── */}
      <section id="dashboard" className="flex justify-center px-6 pb-28">
        <div className="max-w-[1100px] w-full">

          {/* Başlık + Tarih Navigasyon */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[#2DD4BF] text-2xl font-black tracking-[0.15em] uppercase mb-3">Dashboard</span>
              <p className="text-[#8F9BAC] text-sm max-w-md">
                Özellik sayfaları aktif olduğunda buradaki veriler otomatik olarak güncellenecek.
              </p>
            </div>

            {/* Gün Navigasyon */}
            <div className="flex items-center gap-3 bg-[#161a28] border border-white/5 rounded-2xl px-4 py-3 self-start sm:self-auto">
              <button
                onClick={prevDay}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-white text-sm font-semibold min-w-[200px] text-center capitalize">
                {isToday() ? '📅 Bugün' : formatDate(dashDate)}
              </span>
              <button
                onClick={nextDay}
                disabled={isToday()}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Kaydırmalı Kart Alanı */}
          <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2DD4BF22 transparent' }}>
            <div className="flex gap-5 min-w-max">

              {/* ── Kart 1: Sağlık Takip ── */}
              <div className="w-72 bg-[#161a28] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 shrink-0 hover:border-[#2DD4BF]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0D9488]/15 flex items-center justify-center">
                    <HeartPulse size={20} className="text-[#2DD4BF]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">Sağlık Takip</p>
                    <p className="text-gray-500 text-[11px]">{formatDate(dashDate)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Kalp Atışı */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Activity size={14} className="text-[#2DD4BF]" /> Kalp Atışı
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  {/* Adım */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Footprints size={14} className="text-[#2DD4BF]" /> Adım Sayısı
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  {/* Uyku */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Moon size={14} className="text-[#2DD4BF]" /> Uyku Kalitesi
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <span className="text-[11px] text-[#2DD4BF]/60 flex items-center gap-1">
                    <TrendingUp size={11} /> Sağlık Takip aktif olunca dolar
                  </span>
                </div>
              </div>

              {/* ── Kart 2: Beslenme ── */}
              <div className="w-72 bg-[#161a28] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 shrink-0 hover:border-[#34d399]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0D9488]/15 flex items-center justify-center">
                    <Salad size={20} className="text-[#34d399]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">Beslenme Planlama</p>
                    <p className="text-gray-500 text-[11px]">{formatDate(dashDate)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Apple size={14} className="text-[#34d399]" /> Kalori Alımı
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Beef size={14} className="text-[#34d399]" /> Protein
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Wheat size={14} className="text-[#34d399]" /> Karbonhidrat
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Droplets size={14} className="text-[#34d399]" /> Yağ
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <span className="text-[11px] text-[#34d399]/60 flex items-center gap-1">
                    <TrendingUp size={11} /> Beslenme Planlama aktif olunca dolar
                  </span>
                </div>
              </div>

              {/* ── Kart 3: Egzersiz ── */}
              <div className="w-72 bg-[#161a28] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 shrink-0 hover:border-[#0891b2]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0891b2]/15 flex items-center justify-center">
                    <Dumbbell size={20} className="text-[#0891b2]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">Egzersiz Rehberim</p>
                    <p className="text-gray-500 text-[11px]">{formatDate(dashDate)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Timer size={14} className="text-[#0891b2]" /> Antrenman Süresi
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Flame size={14} className="text-[#0891b2]" /> Yakılan Kalori
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <TrendingUp size={14} className="text-[#0891b2]" /> Tamamlanan Set
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <span className="text-[11px] text-[#0891b2]/60 flex items-center gap-1">
                    <TrendingUp size={11} /> Egzersiz Rehberim aktif olunca dolar
                  </span>
                </div>
              </div>

              {/* ── Kart 4: AI Kalori ── */}
              <div className="w-72 bg-[#161a28] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 shrink-0 hover:border-[#7c3aed]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center">
                    <BrainCircuit size={20} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">AI Kalori Analiz</p>
                    <p className="text-gray-500 text-[11px]">{formatDate(dashDate)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <ScanLine size={14} className="text-[#a78bfa]" /> Analiz Edilen
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Flame size={14} className="text-[#a78bfa]" /> Toplam Kalori
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                      <Sparkles size={14} className="text-[#a78bfa]" /> AI Önerisi
                    </div>
                    <span className="text-gray-500 text-[13px] italic">— Veri yok</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <span className="text-[11px] text-[#a78bfa]/60 flex items-center gap-1">
                    <TrendingUp size={11} /> AI Kalori Analiz aktif olunca dolar
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bilgi Notu */}
          <div className="mt-6 flex items-start gap-3 bg-[#161a28]/60 border border-[#2DD4BF]/10 rounded-xl px-5 py-4">
            <Sparkles size={16} className="text-[#2DD4BF] mt-0.5 shrink-0" />
            <p className="text-gray-400 text-[13px] leading-relaxed">
              <span className="text-white font-semibold">Otomatik Entegrasyon:</span> Özellikler bölümündeki her sayfa aktif hale geldiğinde, buraya girilen günlük veriler otomatik olarak bu Dashboard'a yansıyacak.
            </p>
          </div>

        </div>
      </section>

      <Comments user={user} userProfile={userProfile} />

      {/* ── İletişim & SSS Section ── */}
      <section id="iletisim" className="flex justify-center px-6 pb-28 relative">
        {/* Glow Arkası */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-[#2DD4BF]/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-[1100px] w-full flex flex-col items-center relative z-10">
          
          <div className="text-left mb-14 w-full">
            <span className="inline-block text-[#2DD4BF] text-2xl font-black tracking-[0.15em] uppercase mb-4">İletişim</span>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
              Aklına takılan <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34d399] bg-clip-text text-transparent">her şeyi sor</span>
            </h2>
            <p className="text-[#8F9BAC] text-base lg:text-lg max-w-2xl leading-relaxed">
              Sana özel çözümler için buradayız. Tüm mesajlara 24 saat içinde dönüş yapıyoruz.
            </p>
          </div>

          {/* İletişim Kutuları */}
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mb-20">
            <div className="flex-1 bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 lg:p-10 flex flex-col items-center text-center gap-5 hover:border-[#2DD4BF]/30 hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0D9488]/20 to-[#2DD4BF]/20 flex items-center justify-center border border-[#2DD4BF]/20 shadow-inner">
                <Mail className="text-[#2DD4BF]" size={28} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[#8F9BAC] text-[13px] font-bold uppercase tracking-widest mb-1.5">E-Posta</p>
                <p className="text-white text-xl font-bold tracking-wide">fthsltn23@gmail.com</p>
              </div>
            </div>
            
            <div className="flex-1 bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 lg:p-10 flex flex-col items-center text-center gap-5 hover:border-[#2DD4BF]/30 hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0D9488]/20 to-[#2DD4BF]/20 flex items-center justify-center border border-[#2DD4BF]/20 shadow-inner">
                <Phone className="text-[#2DD4BF]" size={28} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[#8F9BAC] text-[13px] font-bold uppercase tracking-widest mb-1.5">Telefon</p>
                <p className="text-white text-xl font-bold tracking-wide">0553 710 7223</p>
              </div>
            </div>
          </div>

          {/* SSS Kısmı */}
          <div className="w-full max-w-3xl mb-16">
            <div className="flex flex-col items-center text-center mb-10">
               <h3 className="text-3xl font-black text-white">Sık Sorulan Sorular</h3>
               <div className="w-16 h-1 bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] rounded-full mt-4" />
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Soru 1 */}
              <div className="bg-[#161a28]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-[#161a28] hover:border-[#2DD4BF]/20 transition-all duration-300">
                <h4 className="text-white font-bold text-[17px] mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0" />
                  Uygulama üzerinden uzman diyetisyenlerle görüşebilir miyim?
                </h4>
                <p className="text-[#8F9BAC] text-[14px] leading-relaxed pl-5">Şu an için uygulama içerisinde size özel AI analizleri üzerinden beslenme yönlendirmeleri sağlıyoruz. İlerleyen güncellemelerde birebir uzman diyetisyen entegrasyonu da planlanmaktadır.</p>
              </div>
              
              {/* Soru 2 */}
              <div className="bg-[#161a28]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-[#161a28] hover:border-[#2DD4BF]/20 transition-all duration-300">
                <h4 className="text-white font-bold text-[17px] mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0" />
                  Kişisel verilerim güvende mi?
                </h4>
                <p className="text-[#8F9BAC] text-[14px] leading-relaxed pl-5">Güvenliğiniz bizim için birinci öncelik. Verileriniz endüstri standartlarında yüksek güvenlikli altyapılarla korunmakta olup kesinlikle 3. şahıslarla paylaşılmaz.</p>
              </div>

              {/* Soru 3 */}
              <div className="bg-[#161a28]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-[#161a28] hover:border-[#2DD4BF]/20 transition-all duration-300">
                <h4 className="text-white font-bold text-[17px] mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0" />
                  Egzersiz planı kendime göre nasıl özelleştirilir?
                </h4>
                <p className="text-[#8F9BAC] text-[14px] leading-relaxed pl-5">Uygulamadaki 'Egzersiz Rehberim' sekmesi üzerinden profil (yaş, kilo) ve hedef bilgilerinizi girerek yapay zeka destekli size özel bir plan oluşturabilirsiniz.</p>
              </div>
            </div>
          </div>

          {/* Sosyal Butonlar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <a 
              href="https://github.com/MuhammedFatihSaltan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 w-[200px] rounded-2xl bg-[#0B0D17] border border-white/10 text-white font-bold text-[15px] hover:-translate-y-1 hover:border-gray-500 hover:bg-[#24292e] hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] transition-all duration-300 relative group overflow-hidden"
            >
              <Github size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">GitHub</span>
            </a>
            <a 
              href="https://www.linkedin.com/in/fatih-saltan?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 w-[200px] rounded-2xl bg-[#0B0D17] border border-white/10 text-white font-bold text-[15px] hover:-translate-y-1 hover:border-[#0077b5] hover:bg-[#0077b5] hover:shadow-[0_10px_30px_rgba(0,119,181,0.2)] transition-all duration-300 relative group overflow-hidden"
            >
              <Linkedin size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">LinkedIn</span>
            </a>
          </div>

        </div>
      </section>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.9); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes popInScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes slant-glow {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;

