import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Droplets, ThermometerSun, Sun, AlertTriangle, CheckCircle, Download, Leaf, Map, Package, CalendarClock } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { evaluateEnvironment } from '../utils/engine';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faSun, faSeedling, faTree, faTemperature0, faCloud, faCloudRain, faCloudSunRain, faMoon, faSmog } from "@fortawesome/free-solid-svg-icons";
import './Dashboard.css';
import { GetTanamans } from '../api/TanamanService';
import { getInventaris } from '../api/InventarisService';
import { getLahan } from '../api/LahanService';
import { getSchedulers } from '../api/SchedulerService';
import { KnowledgeBuah } from '../data/KnowledgeBuah';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const [crop, setCrop] = useLocalStorage('greenvibe_selectedCrop', 'Melon');
  const [phase, setPhase] = useLocalStorage('greenvibe_phase', 'vegetative');
  const [weather, setWeatherData] = useState(false);
  const SearchRef = useRef();
  const [tanamans, setTanamans] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [schedulers, setSchedulers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tanamanRes, invRes, lahanRes, schedRes] = await Promise.all([
          GetTanamans().catch(() => []),
          getInventaris().catch(() => []),
          getLahan().catch(() => []),
          getSchedulers().catch(() => [])
        ]);
        
        const tanamanData = tanamanRes.data || tanamanRes || [];
        setTanamans(tanamanData);
        if (tanamanData.length > 0) {
          setCrop(tanamanData[0].nama || tanamanData[0].name || tanamanData[0].NamaTanaman || 'Melon');
        }
        
        setInventaris(invRes.data || invRes || []);
        setLahans(lahanRes.data || lahanRes || []);
        setSchedulers(schedRes.data || schedRes || []);

      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    }
    fetchDashboardData();
  }, []);

  const [selectedCrop, setSelectedCrop] = useState('');
  const [knowledge, setKnowledge] = useState(null);

  // Setiap kali tanaman dipilih di dropdown
  useEffect(() => {
    if (selectedCrop && KnowledgeBuah[selectedCrop]) {
      // Ambil detail parameter berdasarkan nama tanaman yang dipilih
      setKnowledge(KnowledgeBuah[selectedCrop]);
    } else {
      setKnowledge(null);
    }
  }, [selectedCrop]);

  const [params, setParams] = useState({
    temperature: 25,
    humidity: 65,
    lightIntensity: 35000,
    pH: 6.0,
    PPM: 900,
    EC: 1.5
  });

  const capitalize = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const ApiIcon = {
    "01d": faSun, "01n": faMoon, "02n": faCloud, "02d": faCloud,
    "03d": faCloud, "03n": faCloud, "04n": faCloud, "04d": faCloud,
    "09d": faCloudRain, "09n": faCloudRain, "10d": faCloudSunRain, "10n": faCloudSunRain,
    "50d": faSmog, "50n": faSmog,
  }

  const [evaluation, setEvaluation] = useState({ score: 100, recommendations: [] });
  const [history, setHistory] = useState({ labels: [], scores: [] });
  const dashboardRef = useRef(null);

  useEffect(() => {
    const result = evaluateEnvironment(crop, params, phase);
    setEvaluation(result);

    // Mock history update on change
    setHistory(prev => {
      const newLabels = [...prev.labels, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })].slice(-10);
      const newScores = [...prev.scores, result.score].slice(-10);
      return { labels: newLabels, scores: newScores };
    });
  }, [crop, phase, params]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const search = async (city) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_APP_ID}&lang=id`

      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      const icon = ApiIcon[data.weather[0].icon] || faSun;
      setWeatherData({
        windSpeed: data.wind.speed,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        temperature: Math.floor(data.main.temp - 279.15),
        location: data.name,
        icon: data.weather[0].icon
      })
    } catch (error) {

    }
  }

  useEffect(() => {
    search("Cimahi")
  }, [])

  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTime(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome To TumburaApp</h2>
        </div>
        <div className="controls flex gap-2">
          <select
            className="input-field"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            <option>-- Pilih Tanaman --</option>
            {tanamans.map((item, index) => (
              <option key={item.TanamanId || index} value={item.NamaTanaman || item.NamaTanaman}>
                {item.NamaTanaman || item.NamaTanaman}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <input placeholder="Cari Lokasi..." className="input-field max-w-xs" ref={SearchRef} /> 
        <button onClick={() => search(SearchRef.current.value)} className="btn-primary text-white rounded-lg shadow hover:bg-green-600 transition text-sm sm:text-base px-4">Cari</button>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <SummaryCard 
          title="Total Tanaman" 
          value={tanamans.length} 
          icon={<Leaf size={24} className="text-green-500" />} 
          delay={0.1}
        />
        <SummaryCard 
          title="Total Lahan" 
          value={lahans.length} 
          subtitle={`${lahans.reduce((acc, curr) => acc + (Number(curr.LuasTanah) || 0), 0)} m²`} 
          icon={<Map size={24} className="text-blue-500" />} 
          delay={0.2}
        />
        <SummaryCard 
          title="Item Inventaris" 
          value={inventaris.length} 
          subtitle={`${inventaris.reduce((acc, curr) => acc + (Number(curr.Stok) || 0), 0)} Unit`}
          icon={<Package size={24} className="text-orange-500" />} 
          delay={0.3}
        />
        <SummaryCard 
          title="Tugas Terjadwal" 
          value={schedulers.length} 
          subtitle={`${schedulers.filter(s => s.Status !== 'Selesai').length} Pending`} 
          icon={<CalendarClock size={24} className="text-purple-500" />} 
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 p-4 rounded-xl bg-bg-50" ref={dashboardRef}>
        {/* Left Columns: Sliders */}
        <div className="card flex flex-col gap-6 md:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Plants Parameters Controls</h3>

          <div className="control-group">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2"><ThermometerSun className="text-warning" /> Temperature (°C)</label>
              <span className="font-bold">{params.temperature} °C</span>
            </div>
            <input
              type="range" min="10" max="40" step="1"
              value={params.temperature}
              onChange={(e) => handleParamChange('temperature', e.target.value)}
            />
          </div>

          <div className="control-group mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2"><Droplets className="text-primary" /> Humidity (%)</label>
              <span className="font-bold">{params.humidity} %</span>
            </div>
            <input
              type="range" min="30" max="100" step="1"
              value={params.humidity}
              onChange={(e) => handleParamChange('humidity', e.target.value)}
            />
          </div>

          <div className="control-group mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2"><Sun className="text-warning" /> Light (Lux)</label>
              <span className="font-bold">{params.lightIntensity} Lux</span>
            </div>
            <input
              type="range" min="0" max="80000" step="1000"
              value={params.lightIntensity}
              onChange={(e) => handleParamChange('lightIntensity', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="control-group">
              <div className="flex justify-between items-center mb-2">
                <label>pH Level</label>
                <span className="font-bold">{params.pH}</span>
              </div>
              <input
                type="range" min="4.0" max="8.0" step="0.1"
                value={params.pH}
                onChange={(e) => handleParamChange('pH', e.target.value)}
              />
            </div>
            <div className="control-group">
              <div className="flex justify-between items-center mb-2">
                <label>Nutrient (PPM)</label>
                <span className="font-bold">{params.PPM}</span>
              </div>
              <input
                type="range" min="400" max="2000" step="50"
                value={params.PPM}
                onChange={(e) => handleParamChange('PPM', e.target.value)}
              />
            </div>
            <div className="control-group">
              <div className="flex justify-between items-center mb-2">
                <label>EC Level</label>
                <span className="font-bold">{params.EC}</span>
              </div>
              <input
                type="range" max="3.0" min="0.5" step="0.1"
                value={params.EC}
                onChange={(e) => handleParamChange('EC', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Middle Column: Score and Recommendations */}
        <div className="flex flex-col gap-6 md:col-span-1 lg:col-span-1">
          <motion.div
            className="card text-center flex flex-col items-center justify-center"
            animate={{ scale: [0.95, 1], opacity: [0.8, 1] }}
            key={evaluation.score}
          >
            <h3 className="text-muted font-semibold mb-2">Health Score</h3>
            <div className="w-48 h-24 relative flex justify-center mt-2">
              <Doughnut 
                data={{
                  datasets: [
                    {
                      data: [evaluation.score, 100 - evaluation.score],
                      backgroundColor: [
                        evaluation.score >= 80 ? '#10b981' : evaluation.score >= 60 ? '#f59e0b' : '#ef4444',
                        '#e2e8f0'
                      ],
                      borderWidth: 0,
                      cutout: '80%',
                      circumference: 180,
                      rotation: 270
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { tooltip: { enabled: false }, legend: { display: false } },
                  animation: { duration: 1000, easing: 'easeOutBounce' }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col" style={{ top: '30%' }}>
                <span className={`text-3xl font-bold ${evaluation.score >= 80 ? 'text-primary' : evaluation.score >= 60 ? 'text-warning' : 'text-[red]'}`}>
                  {evaluation.score}%
                </span>
              </div>
            </div>
          </motion.div>

          <div className="card h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Recommendation
            </h3>
            <ul className="recommendation-list">
              {evaluation.recommendations.map((rec, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 text-sm items-start mb-3 p-2 rounded"
                >
                  {evaluation.score === 100 ? <CheckCircle className="text-primary shrink-0" size={18} /> : <AlertTriangle className="text-warning shrink-0" size={18} />}
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: API Data Cards */}
        <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-1">
          <Card
            title="Cuaca"
            value={
              weather?.temperature
                ? `${weather.temperature}°C ${capitalize(weather.description)}`
                : "Data tidak tersedia"
            }
            icon={ApiIcon[weather?.icon] || faSun}
          />
          <Card
            title="Lokasi"
            value={weather?.location || "Lokasi tidak ditemukan"}
            icon={faMapPin}
          />
          <Card
            title="Tanggal"
            value={time}
            icon={faSeedling}
          />
        </div>
      </div>

    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="p-4 rounded-xl shadow-sm flex items-center gap-4 border border-bg-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow"
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={icon} className="text-primary text-2xl" />
        </div>
      )}
      <div className="overflow-hidden">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium truncate">{title}</h3>
        <p className="text-lg font-bold text-gray-800 dark:text-white truncate">{value}</p>
      </div>
    </motion.div>
  );
}

function SummaryCard({ title, value, subtitle, icon, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      className="p-4 rounded-xl shadow-sm flex items-center gap-4 border border-bg-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="overflow-hidden">
        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider truncate">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 dark:text-white truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{subtitle}</p>}
      </div>
    </motion.div>
  );
}