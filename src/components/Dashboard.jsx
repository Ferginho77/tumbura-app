import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Map, Package, CalendarClock, TrendingUp, TrendingDown, PackageCheck } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faSun, faSeedling, faCloud, faCloudRain, faCloudSunRain, faMoon, faSmog } from "@fortawesome/free-solid-svg-icons";
import './Dashboard.css';
import { GetTanamans } from '../api/TanamanService';
import { getInventaris } from '../api/InventarisService';
import { getLahan } from '../api/LahanService';
import { getSchedulers } from '../api/SchedulerService';
import { getProduksi } from '../api/ProduksiService';

export default function Dashboard() {
  const [crop, setCrop] = useLocalStorage('greenvibe_selectedCrop', 'Melon');
  const [weather, setWeatherData] = useState(false);
  const SearchRef = useRef();
  const [tanamans, setTanamans] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [schedulers, setSchedulers] = useState([]);
  const [productions, setProductions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tanamanRes, invRes, lahanRes, schedRes, prodRes] = await Promise.all([
          GetTanamans().catch(() => []),
          getInventaris().catch(() => []),
          getLahan().catch(() => []),
          getSchedulers().catch(() => []),
          getProduksi().catch(() => [])
        ]);

        const tanamanData = tanamanRes.data || tanamanRes || [];
        setTanamans(tanamanData);
        if (tanamanData.length > 0) {
          setCrop(tanamanData[0].nama || tanamanData[0].name || tanamanData[0].NamaTanaman || 'Melon');
        }

        setInventaris(invRes.data || invRes || []);
        setLahans(lahanRes.data || lahanRes || []);
        setSchedulers(schedRes.data || schedRes || []);
        setProductions(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      }
    }
    fetchDashboardData();
  }, []);

  const capitalize = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const sortedProductions = [...productions].sort((a, b) => new Date(b.Tanggal || 0) - new Date(a.Tanggal || 0));
  const latestProduction = sortedProductions[0];
  const previousProduction = sortedProductions[1];
  const totalPanen = productions.reduce((acc, item) => acc + (Number(item.TotalPanen) || 0), 0);
  const rataPanen = productions.length ? totalPanen / productions.length : 0;
  const previousValue = Number(previousProduction?.TotalPanen || 0);
  const latestValue = Number(latestProduction?.TotalPanen || 0);
  const trendPercent = previousValue > 0 ? ((latestValue - previousValue) / previousValue) * 100 : 0;
  const isIncreasing = latestProduction && previousProduction ? latestValue > previousValue : false;
  const trendLabel = latestProduction && previousProduction
    ? `${isIncreasing ? 'Kenaikan' : 'Penurunan'} ${Math.abs(trendPercent).toFixed(1)}%`
    : 'Belum ada pembanding';

  const ApiIcon = {
    "01d": faSun, "01n": faMoon, "02n": faCloud, "02d": faCloud,
    "03d": faCloud, "03n": faCloud, "04n": faCloud, "04d": faCloud,
    "09d": faCloudRain, "09n": faCloudRain, "10d": faCloudSunRain, "10n": faCloudSunRain,
    "50d": faSmog, "50n": faSmog,
  }

  const dashboardRef = useRef(null);
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

  const formatTanggal = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome To TumburaApp</h2>
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6 mt-6 p-4 rounded-xl bg-bg-50" ref={dashboardRef}>
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-primary">Informasi Produksi Panen</h2>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${isIncreasing ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {isIncreasing ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trendLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Total panen</p>
              <p className="mt-2 text-lg font-bold text-text-dark">{totalPanen.toLocaleString('id-ID')} kg</p>
            </div>
            <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Rata-rata panen</p>
              <p className="mt-2 text-lg font-bold text-text-dark">{rataPanen.toLocaleString('id-ID')} kg</p>
            </div>
            <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Panen terakhir</p>
              <p className="mt-2 text-lg font-bold text-text-dark">{latestProduction ? `${Number(latestProduction.TotalPanen || 0).toLocaleString('id-ID')} kg` : 'Belum ada'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-dark">Riwayat panen terbaru</p>
            <div className="space-y-2">
              {sortedProductions.slice(0, 3).map((item, index) => (
                <div key={item.ProduksiId || index} className="flex items-center justify-between rounded-lg border border-bg-200 bg-dark px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-text-dark">{Number(item.TotalPanen || 0).toLocaleString('id-ID')} kg</p>
                    <p className="text-xs text-text-muted">{formatTanggal(item.Tanggal)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${Number(item.TotalPanen || 0) >= (sortedProductions[index + 1]?.TotalPanen || 0) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {Number(item.TotalPanen || 0) >= (sortedProductions[index + 1]?.TotalPanen || 0) ? 'Naik' : 'Turun'}
                  </span>
                </div>
              ))}
              {sortedProductions.length === 0 && (
                <p className="rounded-lg border border-dashed border-bg-200 p-3 text-sm text-text-muted">Belum ada data panen untuk ditampilkan.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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