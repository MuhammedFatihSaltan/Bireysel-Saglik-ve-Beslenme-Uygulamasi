import React, { useState } from 'react';
import { List, Search, Download, Trash2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const HealthList = ({ metrics, onDelete, onAiClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMetrics = metrics.filter(m => 
    m.date.includes(searchTerm) || 
    (m.heart_rate && m.heart_rate.toString().includes(searchTerm)) ||
    (m.weight && m.weight.toString().includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage);
  const currentMetrics = filteredMetrics.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "health_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-[#161a28] border border-white/5 rounded-2xl p-6 h-full flex flex-col group hover:border-[#0891b2]/20 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0891b2]/15 flex items-center justify-center">
            <List size={20} className="text-[#0891b2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Veri Geçmişi</h2>
            <p className="text-[#8F9BAC] text-sm">Önceki kayıtlarınızı inceleyin.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Tarih veya değer ara..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-[#0e1120] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#2DD4BF] transition-colors w-full sm:w-48"
            />
          </div>
          <button 
            onClick={exportToJson}
            title="JSON olarak dışa aktar"
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs uppercase bg-[#0e1120] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Tarih</th>
              <th className="px-4 py-3">Nabız</th>
              <th className="px-4 py-3">Kilo</th>
              <th className="px-4 py-3">Uyku</th>
              <th className="px-4 py-3">Adım</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {currentMetrics.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">Henüz veri bulunmuyor.</td>
              </tr>
            ) : (
              currentMetrics.map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{m.date}</td>
                  <td className="px-4 py-3">{m.heart_rate || '-'}</td>
                  <td className="px-4 py-3">{m.weight || '-'}</td>
                  <td className="px-4 py-3">{m.sleep_hours || '-'}</td>
                  <td className="px-4 py-3">{m.steps || '-'}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => onAiClick(m)}
                      title="Bu veri için AI Tavsiyesi al"
                      className="text-gray-500 hover:text-[#a78bfa] transition-colors p-1"
                    >
                      <Sparkles size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(m.id)}
                      title="Sil"
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs text-gray-500">
            Sayfa {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg bg-[#0e1120] border border-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg bg-[#0e1120] border border-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthList;
