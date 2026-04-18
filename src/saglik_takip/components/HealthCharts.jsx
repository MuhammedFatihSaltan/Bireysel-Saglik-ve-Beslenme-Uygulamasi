import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HealthCharts = ({ metrics }) => {
  const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedMetrics.map(m => {
    const d = new Date(m.date);
    return `${d.getDate()}/${d.getMonth()+1}`;
  });

  const weightData = {
    labels,
    datasets: [
      {
        label: 'Kilo (kg)',
        data: sortedMetrics.map(m => m.weight),
        borderColor: '#2DD4BF',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const heartRateData = {
    labels,
    datasets: [
      {
        label: 'Nabız (bpm)',
        data: sortedMetrics.map(m => m.heart_rate),
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8, 145, 178, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8F9BAC', font: { family: 'Inter, sans-serif' } }
      },
      tooltip: {
        backgroundColor: '#161a28',
        titleColor: '#fff',
        bodyColor: '#2DD4BF',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8F9BAC' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8F9BAC' }
      }
    }
  };

  return (
    <div className="bg-[#161a28] border border-white/5 rounded-2xl p-6 group hover:border-[#a78bfa]/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center">
          <TrendingUp size={20} className="text-[#a78bfa]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Trend Analizi</h2>
          <p className="text-[#8F9BAC] text-sm">Gelişiminizi grafikler üzerinden takip edin.</p>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="h-64 bg-[#0e1120] rounded-xl border border-white/5 flex items-center justify-center text-gray-500">
          Grafik oluşturmak için veri girin.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-[#0e1120] rounded-xl p-4 border border-white/5 relative">
            <Line data={weightData} options={chartOptions} />
          </div>
          <div className="h-64 bg-[#0e1120] rounded-xl p-4 border border-white/5 relative">
            <Line data={heartRateData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthCharts;
