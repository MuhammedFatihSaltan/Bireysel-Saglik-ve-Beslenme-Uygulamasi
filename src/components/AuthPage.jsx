import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMSG('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/home');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        if (error) throw error;
        // Depending on supabase settings, signup might require email confirmation.
        // But for development, assuming auto-login or redirecting to home anyway.
        // Re-attempt sign in right after sign up:
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (!signInError) {
             navigate('/home');
        } else {
             setErrorMSG("Kayıt başarılı ancak giriş yapılamadı. Lütfen giriş yapmayı deneyin.");
             setIsLogin(true);
        }
      }
    } catch (error) {
      setErrorMSG(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center p-4">
      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left Side (Marketing Copy) */}
        <div className="space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Health&Life</h2>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">
              Sağlığınızı Akıllı<br />Şekilde Yönetin
            </h1>
            <p className="text-[#8F9BAC] text-lg leading-relaxed pt-2">
              Kişiselleştirilmiş beslenme planları, AI destekli öneriler ve 
              detaylı ilerleme takibi ile sağlıklı yaşam hedeflerinize ulaşın.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-medium text-primary">1000+ Mutlu Kullanıcı</span>
          </div>
        </div>

        {/* Right Side (Auth Form Card) */}
        <div className="w-full max-w-[480px] mx-auto lg:ml-auto">
          <div className="bg-card rounded-2xl p-8 border border-white/5 shadow-2xl">
            
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-background rounded-xl mb-8 border border-white/5">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all
                  ${isLogin ? 'bg-white text-black shadow-sm' : 'text-[#8F9BAC] hover:text-white hover:bg-white/5'}
                `}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all
                  ${!isLogin ? 'bg-white text-black shadow-sm' : 'text-[#8F9BAC] hover:text-white hover:bg-white/5'}
                `}
              >
                Kayıt Ol
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8F9BAC]">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-background border border-[#2A2E3D] rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8F9BAC]">E-posta</label>
                <input
                  type="email"
                  required
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-[#2A2E3D] rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8F9BAC]">Şifre</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-[#2A2E3D] rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {errorMSG && (
                <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                  {errorMSG}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/80 text-[#D1D5DB] font-medium py-3.5 rounded-xl transition-colors duration-200 mt-2 disabled:opacity-50"
              >
                {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 pt-6 border-t border-[#2A2E3D]">
              <p className="text-[13px] text-[#5F6A7C] leading-relaxed">
                Şifre Supabase Auth ile güvenli şekilde yönetilir; uygulama şifreyi
                veritabanında düz metin olarak saklamaz.
              </p>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthPage;
