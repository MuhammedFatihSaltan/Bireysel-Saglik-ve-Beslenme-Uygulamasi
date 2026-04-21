import React, { useState, useEffect } from 'react';
import { Quote, Sparkles, Edit2, User, Star, RefreshCw, X } from 'lucide-react';

const Comments = ({ user, userProfile }) => {
  // Comment states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);

  useEffect(() => {
    // Load comments from local storage so they aren't lost on navigation
    const savedComments = localStorage.getItem('health_life_mock_comments');
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch(error) {
        console.error("Yorumlar yüklenirken hata oluştu:", error);
      }
    }
  }, []);

  const handleCloseModal = () => {
    setShowCommentModal(false);
    setEditingCommentIndex(null);
    setCommentText('');
    setRating(0);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText || rating === 0) {
      alert('Lütfen hem yorum alanını doldurun hem de en az bir yıldız verin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = {
        user_id: user.id,
        username: user?.user_metadata?.username || 'Anonim',
        avatar_url: user?.user_metadata?.avatar_url,
        content: commentText,
        rating: rating,
        age: userProfile?.age,
        gender: userProfile?.gender,
        created_at: editingCommentIndex !== null ? comments[editingCommentIndex].created_at : new Date()
      };

      // Save to comments list and localStorage so it persists
      setComments(prev => {
        let updated;
        if (editingCommentIndex !== null) {
          updated = [...prev];
          updated[editingCommentIndex] = newComment;
        } else {
          updated = [newComment, ...prev];
        }
        localStorage.setItem('health_life_mock_comments', JSON.stringify(updated));
        return updated;
      });
      
      // Reset form and close modal
      handleCloseModal();
      alert(editingCommentIndex !== null ? 'Yorumunuz güncellendi!' : 'Yorumunuz başarıyla eklendi!');
    } catch (error) {
      console.error('Comment submission error:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Yorumlar Section ── */}
      <section id="yorumlar" className="flex justify-center px-6 pb-32 relative">
        {/* Arka plan glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-[#2DD4BF]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-[1100px] w-full relative z-10">
          
          <div className="text-left mb-14">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-5 tracking-tight">
              Kullanıcı <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34d399] bg-clip-text text-transparent">Yorumları</span>
            </h2>
            <p className="text-[#8F9BAC] text-base lg:text-lg max-w-2xl leading-relaxed">
              Health & Life'ı sizinle birlikte geliştiriyoruz. Deneyimlerinizi paylaşarak topluluğumuza ilham verin.
            </p>
          </div>

          <div className="w-full bg-[#161a28]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 lg:p-14 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            
            {comments.length === 0 ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="relative w-28 h-28 mb-8 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0D9488]/20 to-[#2DD4BF]/20 rounded-full blur-xl" />
                  <div className="relative w-full h-full rounded-full border border-[#2DD4BF]/20 bg-[#161a28] shadow-[0_0_30px_rgba(45,212,191,0.15)] flex items-center justify-center">
                    <Quote size={40} className="text-[#2DD4BF] opacity-80" />
                  </div>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">İlk Yorumu Sen Yap!</h3>
                <p className="text-[#8F9BAC] text-[15px] max-w-md mx-auto mb-10 leading-relaxed">
                  Uygulama hakkındaki düşüncelerini merak ediyoruz. Deneyimini paylaşarak gelişimimize katkıda bulun.
                </p>
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="group relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-black font-bold text-[15px] shadow-[0_0_24px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_rgba(45,212,191,0.5)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-glow" />
                  <Sparkles size={18} className="relative z-10" />
                  <span className="relative z-10">Hemen Yorum Bırak</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">
                  {comments.map((c, i) => {
                    const isOwner = user && c.user_id === user.id;
                    const displayUsername = isOwner ? (user?.user_metadata?.username || 'Anonim') : c.username;
                    const displayAvatar = isOwner ? user?.user_metadata?.avatar_url : c.avatar_url;
                    const displayAge = isOwner ? userProfile?.age : c.age;
                    const displayGender = isOwner ? userProfile?.gender : c.gender;

                    return (
                    <div key={i} className="group relative bg-[#0e1120]/80 border border-white/5 p-7 rounded-3xl flex flex-col gap-5 shadow-lg hover:border-[#2DD4BF]/30 transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Quote size={40} className="text-[#2DD4BF]" />
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => {
                            setEditingCommentIndex(i);
                            setCommentText(c.content);
                            setRating(c.rating);
                            setShowCommentModal(true);
                          }}
                          className="absolute bottom-4 right-4 p-2 rounded-full bg-[#161a28] border border-white/5 hover:bg-[#2DD4BF]/20 text-gray-400 hover:text-[#2DD4BF] transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-20 shadow-lg"
                          title="Yorumu Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#2DD4BF]/20 group-hover:border-[#2DD4BF]/50 transition-colors shrink-0 bg-[#161a28]">
                          {displayAvatar ? <img src={displayAvatar} alt="" className="w-full h-full object-cover" /> : <User className="text-gray-500 w-full h-full p-2.5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-[15px] font-bold">{displayUsername}</span>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} size={12} fill={idx < c.rating ? "#2DD4BF" : "none"} className={idx < c.rating ? "text-[#2DD4BF]" : "text-gray-600"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-[14px] leading-relaxed relative z-10">"{c.content}"</p>
                      <div className="mt-auto pt-4 border-t border-white/5 flex gap-3 text-[10px] text-[#8F9BAC] uppercase tracking-widest font-bold">
                        <span>{displayAge ? `${displayAge} YAŞ` : 'YAŞ BELİRTİLMEDİ'}</span>
                        <span>•</span>
                        <span>{displayGender || 'CİNSİYET BELİRTİLMEDİ'}</span>
                      </div>
                    </div>
                  )})}
                </div>
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="group relative flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[15px] hover:bg-white/10 hover:border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} className="text-[#2DD4BF]" />
                  <span>Yeni Yorum Ekle</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Yorum Ekle Modalı ── */}
      {showCommentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => handleCloseModal()}
            style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
          />
          
          {/* Modal Kart */}
          <div 
            className="relative w-full max-w-lg bg-[#161a28] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,1)] overflow-hidden"
            style={{ animation: 'popInScale 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards' }}
          >
            {/* Header / Kullanıcı Bilgileri */}
            <div className="p-8 pb-6 border-b border-white/5 flex items-start gap-6 relative">
              <button 
                onClick={() => handleCloseModal()}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                title="Kapat"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#2DD4BF]/30 shadow-[0_0_20px_rgba(45,212,191,0.2)] shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-500 w-full h-full p-4" fill="currentColor" />
                )}
              </div>

              <div className="flex flex-col gap-1 pr-8">
                <h3 className="text-white text-xl font-bold">{user?.user_metadata?.username || 'Kullanıcı'}</h3>
                <p className="text-[#8F9BAC] text-sm break-all">{user?.email}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {userProfile?.age ? `${userProfile.age} Yaş` : 'Yaş Yok'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {userProfile?.gender || 'Cinsiyet Yok'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddComment} className="p-8 flex flex-col gap-6">
              {/* Yıldız Puanı */}
              <div className="flex flex-col gap-3 items-center text-center">
                <span className="text-[#8F9BAC] text-[13px] font-bold uppercase tracking-widest">Değerlendirme</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-all duration-200 hover:scale-125"
                    >
                      <Star 
                        size={32} 
                        fill={rating >= star ? "#2DD4BF" : "none"} 
                        className={rating >= star ? "text-[#2DD4BF] drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" : "text-gray-600"} 
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && <span className="text-[#2DD4BF] text-xs font-bold">{rating} / 5 Yıldız</span>}
              </div>

              {/* Yorum Alanı */}
              <div className="flex flex-col gap-2">
                <label className="text-[#8F9BAC] text-[13px] font-bold uppercase tracking-widest">{editingCommentIndex !== null ? 'Yorumunuzu Güncelleyin' : 'Görüşünüz'}</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Health & Life hakkında ne düşünüyorsun? Görüşlerini buraya yazabilirsin..."
                  className="w-full h-32 bg-[#0B0D17] border border-white/10 rounded-2xl p-4 text-white text-[15px] resize-none focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
                />
              </div>

              {/* Action Butonları */}
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-[#2DD4BF] text-black font-extrabold text-sm shadow-[0_10px_30px_rgba(45,212,191,0.2)] hover:shadow-[0_15px_40px_rgba(45,212,191,0.4)] disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {editingCommentIndex !== null ? 'Güncelle' : 'Yorum Ekle'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Comments;
