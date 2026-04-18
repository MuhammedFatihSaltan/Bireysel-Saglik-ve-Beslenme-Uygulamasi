import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('hl_gemini_api_key') || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  getRecommendation: async (metrics) => {
    if (!API_KEY) {
      throw new Error("Gemini API anahtarı bulunamadı. Lütfen ayarlar kısmından API anahtarınızı girin veya .env dosyasını yapılandırın.");
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
Sen profesyonel bir sağlık ve yaşam koçusun. Kullanıcının son sağlık verilerini inceleyerek, ona kişiselleştirilmiş, motive edici ve aksiyona dönüştürülebilir tavsiyeler ver.

Kullanıcının Verileri:
${JSON.stringify(metrics, null, 2)}

Lütfen şu formatta yanıt ver (Markdown kullanarak):
1. **Genel Değerlendirme:** Verilerin kısa bir özeti ve genel durum.
2. **Dikkat Çeken Noktalar:** Olumlu veya riskli olabilecek metrikler (Örn: Nabız yüksek, uyku az vs.).
3. **Kişisel Tavsiyeler:** (Örn: "Daha fazla su iç", "Uykunu şu şekilde düzene sok").
4. **Faydalı Kaynaklar:** Önerdiğin tavsiyelerle ilgili Dünya Sağlık Örgütü (WHO) vb. kaynaklara yönlendirmeler.

Cevabın destekleyici ve teşvik edici bir tonda olmalı. Tıbbi tavsiye olmadığını, sadece genel sağlık prensipleri çerçevesinde bir rehberlik olduğunu da kısaca belirt.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Recommendation error:", error);
      throw error;
    }
  }
};
