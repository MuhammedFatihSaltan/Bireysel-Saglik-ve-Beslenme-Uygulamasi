import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Avatar states
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [randomAvatars, setRandomAvatars] = useState({ female: '', male: '' });

  // Profile form states
  const [profile, setProfile] = useState({ gender: '', age: '', height: '', weight: '' });
  const [hasProfile, setHasProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Load user data on mount
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setUser(user);
      setCurrentAvatar(user.user_metadata?.avatar_url || null);
      generateRandomAvatars(); // Initialize random avatars

      // Fetch user profile from the profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile({
          gender: profileData.gender || '',
          age: profileData.age || '',
          height: profileData.height || '',
          weight: profileData.weight || ''
        });
        setHasProfile(true);
      }

      setLoading(false);
    };
    
    fetchUserAndProfile();
  }, [navigate]);

  // Generate new random avatars utilizing random API seeds
  const generateRandomAvatars = () => {
    const randomFemaleId = Math.floor(Math.random() * 99);
    const randomMaleId = Math.floor(Math.random() * 99);
    
    setRandomAvatars({
      female: `https://randomuser.me/api/portraits/women/${randomFemaleId}.jpg`,
      male: `https://randomuser.me/api/portraits/men/${randomMaleId}.jpg`
    });
  };

  // Handle selecting and saving a new avatar
  const handleSelectAvatar = async (avatarUrl) => {
    setSaving(true);
    setCurrentAvatar(avatarUrl);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (error) throw error;
      setUser(data.user);
    } catch (error) {
      console.error('Error updating avatar:', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle removing the avatar
  const handleRemoveAvatar = async () => {
    setSaving(true);
    setCurrentAvatar(null);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: null } /* Nullifying the metadata field */
      });
      if (error) throw error;
      setUser(data.user);
    } catch (error) {
      console.error('Error removing avatar:', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Profile Form Input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle Saving the Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const profileData = {
        id: user.id,
        username: user.user_metadata?.username,
        gender: profile.gender,
        age: profile.age ? parseInt(profile.age, 10) : null,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null,
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      setHasProfile(true);
      setProfileMessage({ type: 'success', text: 'Profil bilgileri başarıyla kaydedildi!' });
      
      // Auto-hide success message
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error.message);
      setProfileMessage({ type: 'error', text: 'Kayıt sırasında bir hata oluştu.' });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans flex justify-center">
      <div className="max-w-3xl w-full">
        
        {/* Header: Back button and Title */}
        <div className="flex items-center gap-4 mb-10">
          <Link 
            to="/home" 
            className="w-10 h-10 rounded-full bg-[#161a28] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profilim</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Avatar Section */}
          <div className="space-y-10">
            {/* Current Avatar Section */}
            <div className="flex items-center gap-5">
              {/* Large Avatar Display */}
              <div className="w-20 h-20 rounded-full bg-[#161a28] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                {currentAvatar ? (
                  <img 
                    src={currentAvatar} 
                    alt="Current profile" 
                    className={`w-full h-full object-cover ${saving ? 'opacity-50 blur-sm' : ''} transition-all duration-300`} 
                  />
                ) : (
                  <User size={36} className="text-gray-500" fill="currentColor" />
                )}
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-[17px] font-semibold text-white mb-0.5">Profil resmi</h2>
                <p className="text-[14px] text-[#8F9BAC]">
                  Aşağıdan kadın veya erkek avatarlarından birini seçebilirsiniz.
                </p>
              </div>
            </div>

            {/* Selection Area Controls */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-medium text-white">Rastgele avatarlar</h3>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={saving || !currentAvatar}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 text-red-500/80 text-[13px] hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    Sil
                  </button>
                  <button
                    onClick={generateRandomAvatars}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-[13px] font-medium text-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={saving ? "animate-spin" : ""} />
                    Değiştir
                  </button>
                </div>
              </div>

              {/* Avatar Options Container */}
              <div className="flex flex-wrap gap-3">
                {/* Female Avatar Option */}
                <button
                  onClick={() => handleSelectAvatar(randomAvatars.female)}
                  disabled={saving}
                  className={`flex items-center gap-3 p-1.5 pr-5 rounded-[2rem] border transition-all duration-300 hover:-translate-y-0.5
                    ${currentAvatar === randomAvatars.female 
                      ? 'bg-primary/5 border-primary text-white shadow-[0_0_15px_rgba(50,215,75,0.05)]' 
                      : 'bg-transparent border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-black/20 overflow-hidden shrink-0">
                     <img src={randomAvatars.female} alt="Female avatar option" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-[13px]">Kadın avatar</span>
                </button>

                {/* Male Avatar Option */}
                <button
                  onClick={() => handleSelectAvatar(randomAvatars.male)}
                  disabled={saving}
                  className={`flex items-center gap-3 p-1.5 pr-5 rounded-[2rem] border transition-all duration-300 hover:-translate-y-0.5
                    ${currentAvatar === randomAvatars.male 
                      ? 'bg-primary/5 border-primary text-white shadow-[0_0_15px_rgba(50,215,75,0.05)]' 
                      : 'bg-transparent border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-black/20 overflow-hidden shrink-0">
                     <img src={randomAvatars.male} alt="Male avatar option" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-[13px]">Erkek avatar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Information Form Section */}
          <div className="bg-[#161a28]/60 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-semibold mb-6">Kişisel Bilgiler</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-5">
              
              {/* Username (Disabled) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8F9BAC]">Kullanıcı Adı</label>
                <input
                  type="text"
                  disabled
                  value={user?.user_metadata?.username || ''}
                  className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8F9BAC]">Cinsiyet</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setProfile({...profile, gender: 'Kadın'})}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200
                      ${profile.gender === 'Kadın' 
                        ? 'bg-primary border-primary text-black' 
                        : 'bg-[#0B0D17] border-white/10 text-gray-300 hover:border-white/30'
                      }
                    `}
                  >
                    Kadın
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({...profile, gender: 'Erkek'})}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200
                      ${profile.gender === 'Erkek' 
                        ? 'bg-primary border-primary text-black' 
                        : 'bg-[#0B0D17] border-white/10 text-gray-300 hover:border-white/30'
                      }
                    `}
                  >
                    Erkek
                  </button>
                </div>
              </div>

              {/* Age, Height, Weight Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8F9BAC]">Yaş</label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="120"
                    placeholder="25"
                    value={profile.age}
                    onChange={handleProfileChange}
                    className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8F9BAC]">Boy <span className="text-xs text-gray-500">(cm)</span></label>
                  <input
                    type="number"
                    name="height"
                    min="50"
                    max="250"
                    placeholder="170"
                    value={profile.height}
                    onChange={handleProfileChange}
                    className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8F9BAC]">Kilo <span className="text-xs text-gray-500">(kg)</span></label>
                  <input
                    type="number"
                    name="weight"
                    min="20"
                    max="300"
                    step="0.1"
                    placeholder="65.5"
                    value={profile.weight}
                    onChange={handleProfileChange}
                    className="w-full bg-[#0B0D17] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#5F6A7C] focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              
              {/* Result Message */}
              {profileMessage.text && (
                <div className={`p-3 rounded-lg text-sm border ${profileMessage.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {profileMessage.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-black font-semibold py-3.5 rounded-xl transition-all duration-200 mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {savingProfile && <RefreshCw size={16} className="animate-spin" />}
                {savingProfile ? 'İşleniyor...' : (hasProfile ? 'Güncelle' : 'Kaydet')}
              </button>
            </form>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
