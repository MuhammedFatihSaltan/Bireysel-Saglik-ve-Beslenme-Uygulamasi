import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error.message);
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
              <span className="text-[#2DD4BF] font-bold tracking-[0.15em] text-sm leading-tight">HEALTH&LIFE</span>
              <span className="text-gray-400 text-xs mt-0.5">Akıllı Sağlık ve Beslenme</span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center bg-[#161a28] rounded-full px-8 py-3 shadow-sm border border-white/5">
            <ul className="flex items-center gap-8 text-[15px] text-gray-300">
              <li className="text-white font-medium cursor-pointer">Anasayfa</li>
              <li className="hover:text-white transition-colors cursor-pointer">Özellikler</li>
              <li className="hover:text-white transition-colors cursor-pointer">Yorumlar</li>
              <li className="hover:text-white transition-colors cursor-pointer">İletişim</li>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 object-contain">
        <div className="bg-card p-10 rounded-3xl border border-white/5 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
          
          <h1 className="text-4xl font-bold text-white tracking-tight">Hoş Geldiniz!</h1>
          <p className="text-[#8F9BAC] text-lg leading-relaxed">
            Başarıyla giriş yaptınız. Bu alan daha sonra uygulamanızın ana özellikleriyle doldurulacaktır.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

