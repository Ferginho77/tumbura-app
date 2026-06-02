import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Droplets, ThermometerSun, Sun, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { evaluateEnvironment } from '../utils/engine';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faSun, faSeedling, faTree, faTemperature0, faCloud, faCloudRain, faCloudSunRain, faMoon, faSmog} from "@fortawesome/free-solid-svg-icons";
import './Dashboard.css';
import { GetTanamans } from '../api/TanamanService';
import { KnowledgeBuah } from '../data/KnowledgeBuah';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [crop, setCrop] = useLocalStorage('greenvibe_selectedCrop', 'Melon');
  const [phase, setPhase] = useLocalStorage('greenvibe_phase', 'vegetative');
  const [weather, setWeatherData] = useState(false); 
  const SearchRef = useRef();
  const [tanamans, setTanamans] = useState([]);

  useEffect(() => {
    const fetchTanamans = async () => {
      try {
        const response = await GetTanamans();
        // Asumsi API mengembalikan array: [{ id: 1, nama: 'Melon' }, ...]
        setTanamans(response.data || response); 
        
        // Set default value jika data tersedia
        if (response.length > 0) {
          setCrop(response[0].nama || response[0].name);
        }
        
      } catch (error) {
        console.error("Gagal mengambil data tanaman:", error);
      }
    }
    fetchTanamans();
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
  "01d": faSun,
  "01n": faMoon,
  "02n": faCloud,
  "02d": faCloud,
  "03d": faCloud,
  "03n": faCloud,
  "04n": faCloud,
  "04d": faCloud,
  "09d": faCloudRain, 
  "09n": faCloudRain,
  "10d": faCloudSunRain,
  "10n": faCloudSunRain,
  "50d": faSmog,
  "50n": faSmog,
  // Tambahkan ikon lainnya sesuai kebutuhan
  }

  const [evaluation, setEvaluation] = useState({ score: 100, recommendations: [] });
  const [history, setHistory] = useState({ labels: [], scores: [] });
  const dashboardRef = useRef(null);

  const handleDownloadPNG = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#f8fafc',
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = data;
      link.download = `greenvibe-dashboard-${new Date().getTime()}.png`;
      link.click();
    }
  };

  useEffect(() => {
    const result = evaluateEnvironment(crop, params, phase);
    setEvaluation(result);
    
    // Mock history update on change
    setHistory(prev => {
      const newLabels = [...prev.labels, new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})].slice(-10);
      const newScores = [...prev.scores, result.score].slice(-10);
      return { labels: newLabels, scores: newScores };
    });
  }, [crop, phase, params]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  const search = async (city) =>{
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

  useEffect(()=> {
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
          <button className="btn-primary flex items-center justify-center p-2" onClick={handleDownloadPNG} title="Save as PNG">
            <Download size={20} />
          </button>
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
          <select className="input-field" value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="vegetative">Vegetative</option>
            <option value="generative">Generative</option>
          </select>
        </div>
      </div>
            <input placeholder="Cari Lokasi..." className="input-field" ref={SearchRef} /> <button onClick={() => search(SearchRef.current.value)} className="btn-primary text-white rounded-lg shadow hover:bg-green-600 transition text-sm sm:text-base">Cari</button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 p-4 rounded-xl bg-bg-50" ref={dashboardRef}>
        {/* Left Columns: Sliders */}
        <div className="card flex flex-col gap-6 md:col-span-2 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Environment Controls</h3>
          
          <div className="control-group">
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2"><ThermometerSun className="text-warning"/> Temperature (°C)</label>
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
              <label className="flex items-center gap-2"><Droplets className="text-primary"/> Humidity (%)</label>
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
              <label className="flex items-center gap-2"><Sun className="text-warning"/> Light (Lux)</label>
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
            className="card text-center"
            animate={{ scale: [0.95, 1], opacity: [0.8, 1] }}
            key={evaluation.score}
          >
            <h3 className="text-muted mb-2">Health Score</h3>
            <div className={`text-4xl font-bold ${evaluation.score >= 80 ? 'text-primary' : evaluation.score >= 60 ? 'text-warning' : 'text-[red]'}`}>
              {evaluation.score}%
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
                  {evaluation.score === 100 ? <CheckCircle className="text-primary shrink-0" size={18}/> : <AlertTriangle className="text-warning shrink-0" size={18}/>}
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
    <div className=" p-4 rounded shadow-sm flex items-center gap-4 border border-bg-200">
      
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-primary text-xl" />
      )}

      <div>
        <h3 className="text-muted text-sm">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
      
    </div>
  );
}