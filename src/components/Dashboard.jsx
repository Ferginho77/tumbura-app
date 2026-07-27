import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Map, Package, CalendarClock, TrendingUp, TrendingDown, PackageCheck, Sprout } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faSun, faSeedling, faCloud, faCloudRain, faCloudSunRain, faMoon, faSmog, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import './Dashboard.css';
import { GetTanamans, CreateTanaman, DeleteTanaman, EditTanaman } from '../api/TanamanService';
import { getLahan } from '../api/LahanService';
import { getSchedulers } from '../api/SchedulerService';
import { getProduksi } from '../api/ProduksiService';

export default function Dashboard() {
  const [crop, setCrop] = useLocalStorage();
  const [weather, setWeatherData] = useState(false);
  const SearchRef = useRef();
  const [tanamans, setTanamans] = useState([]);
  const [lahans, setLahans] = useState([]);
  const [schedulers, setSchedulers] = useState([]);
  const [productions, setProductions] = useState([]);
  const [modalType, setModalType] = useState("tanaman");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTanamanId, setCurrentTanamanId] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [tanamanRes, lahanRes, schedRes, prodRes] = await Promise.all([
        GetTanamans().catch(() => []),
        getLahan().catch(() => []),
        getSchedulers().catch(() => []),
        getProduksi().catch(() => [])
      ]);

      const tanamanData = Array.isArray(tanamanRes?.data) ? tanamanRes.data : (Array.isArray(tanamanRes) ? tanamanRes : []);
      setTanamans(tanamanData);
      if (tanamanData.length > 0) {
        setCrop(tanamanData[0].nama || tanamanData[0].name || tanamanData[0].NamaTanaman || 'Melon');
      }

      setLahans(Array.isArray(lahanRes?.data) ? lahanRes.data : (Array.isArray(lahanRes) ? lahanRes : []));
      setSchedulers(Array.isArray(schedRes?.data) ? schedRes.data : (Array.isArray(schedRes) ? schedRes : []));
      setProductions(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
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
    "50d": faSmog, "50n": faSmog, "11d": faEdit, "11n": faTrash
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

  const totalVarietas = tanamans.length;

  const tanamanAktif = tanamans.filter(
    (item) => item.Status !== "Selesai"
  ).length;

  const tanamanPanen = tanamans.filter(
    (item) => item.Status === "Panen"
  ).length;

const [tanamanFormData, setTanamanFormData] = useState({
    NamaTanaman: "",
    Deskripsi: "",
    UmurPanen: "",
  });

  const resetTanamanForm = () => {
    setTanamanFormData({ NamaTanaman: "", Deskripsi: "", UmurPanen: "" });
  };

  const openTanamanForm = () => {
    setModalType("tanaman");
    setCurrentTanamanId(null);
    resetTanamanForm();
    setIsModalOpen(true);
  };

  const openEditTanamanForm = (tanaman) => {
    setModalType("tanaman");
    setCurrentTanamanId(tanaman.TanamanId);
    setTanamanFormData({
      NamaTanaman: tanaman.NamaTanaman || "",
      Deskripsi: tanaman.Deskripsi || "",
      UmurPanen: String(tanaman.UmurPanen),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTanamanId(null);
    setModalType("tanaman");
  };

  const handleSubmitTanaman = async (e) => {
    e.preventDefault();

    const payload = {
      ...tanamanFormData,
      NamaTanaman: tanamanFormData.NamaTanaman.trim(),
      Deskripsi: tanamanFormData.Deskripsi.trim(),
      UmurPanen: Number.parseInt(tanamanFormData.UmurPanen, 10) || 0,
    };

    if (!payload.NamaTanaman || !payload.UmurPanen) {
      alert("Nama tanaman dan umur panen harus diisi.");
      return;
    }

    try {
      if (currentTanamanId) {
        await EditTanaman(currentTanamanId, payload);
      } else {
        await CreateTanaman(payload);
      }
      await loadDashboardData();
      closeModal();
    } catch (error) {
      console.error("Error saving tanaman:", error);
      alert(error.message || "Gagal menyimpan tanaman.");
    }
  };

  const handleTanamanChange = (e) => {
    const { name, value } = e.target;
    setTanamanFormData((prev) => ({ ...prev, [name]: value }));
  };

   const handleDeleteTanaman = async (TanamanId) => {
      try {
        const success = await DeleteTanaman(TanamanId);
        if (success) {
          setTanamans((current) => current.filter((t) => t.TanamanId !== TanamanId));
        }
      } catch (error) {
        console.error("Error deleting tanaman:", error);
      }
    };
  


  return (
    <div className="dashboard">
      <div className="dashboard-header flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Welcome To TumburaApp</h2>
        </div>

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
          title="Tugas Terjadwal"
          value={schedulers.length}
          subtitle={`${schedulers.filter(s => s.Status !== 'Selesai').length} Pending`}
          icon={<CalendarClock size={24} className="text-purple-500" />}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6 mt-6 p-4 rounded-xl bg-bg-50" ref={dashboardRef}>
      <div className="card p-5 flex flex-col gap-5">

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
    <div>
      <h2 className="text-sm font-semibold text-primary">
        Informasi Produksi Panen
      </h2>
      <p className="text-xs text-text-muted mt-1">
        Ringkasan produksi dan data varietas semangka.
      </p>
    </div>

    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        isIncreasing
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {isIncreasing ? (
        <TrendingUp size={16} />
      ) : (
        <TrendingDown size={16} />
      )}
      {trendLabel}
    </div>
  </div>

  {/* Statistik Produksi */}
  <div className="grid grid-cols-3 gap-3">

    <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
      <p className="text-xs uppercase tracking-wide text-text-muted">
        Total Panen
      </p>

      <p className="mt-2 text-lg font-bold text-text-dark">
        {totalPanen.toLocaleString("id-ID")} kg
      </p>
    </div>

    <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
      <p className="text-xs uppercase tracking-wide text-text-muted">
        Rata-rata
      </p>

      <p className="mt-2 text-lg font-bold text-text-dark">
        {rataPanen.toLocaleString("id-ID")} kg
      </p>
    </div>

    <div className="rounded-xl border border-bg-200 bg-bg-50 p-3">
      <p className="text-xs uppercase tracking-wide text-text-muted">
        Panen Terakhir
      </p>

      <p className="mt-2 text-lg font-bold text-text-dark">
        {latestProduction
          ? `${Number(latestProduction.TotalPanen).toLocaleString(
              "id-ID"
            )} kg`
          : "-"}
      </p>
    </div>

  </div>

  {/* Daftar Tanaman */}
  <div>

    <div className="flex justify-between items-center mb-3">

      <h3 className="text-sm font-semibold text-text-dark">
        Daftar Tanaman
      </h3>
    </div>

    <div className="overflow-y-auto max-h-56 rounded-xl border border-bg-200">
      <table className="w-full text-sm">
        <thead className="sticky top-0 shadow-sm">
          <tr className="text-left">
            <th className="px-4 py-3">
              Tanaman
            </th>
            <th className="px-4 py-3 text-center">
              Umur Panen
            </th>
            <th className="px-4 py-3 text-center">
              Aksi
            </th>
            
          </tr>
        </thead>
        <tbody>
          {tanamans.length > 0 ? (
            tanamans.map((item) => (
              <tr
                key={item.TanamanId}
                className="border-t border-bg-200 hover:bg-bg-50 transition"
              >

                <td className="px-4 py-3 font-medium">
                  {item.NamaTanaman}
                </td>

                <td className="px-4 py-3 text-center">
                  {item.UmurPanen || "-"} hari
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => openEditTanamanForm(item)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="text-red-500 hover:text-red-700 ml-2"
                  onClick={() => {
                  if (confirm("Hapus tanaman ini?")) {
                  handleDeleteTanaman(item.TanamanId);
                   }
                  }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="text-center py-6 text-text-muted"
              >
                Belum ada data tanaman.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Riwayat Panen */}
  <div>

    <h3 className="text-sm font-semibold text-text-dark mb-3">
      Riwayat Panen Terbaru
    </h3>

    <div className="space-y-2">

      {sortedProductions.slice(0, 3).map((item, index) => (

        <div
          key={item.ProduksiId || index}
          className="flex justify-between items-center rounded-lg border border-bg-200 px-3 py-2"
        >

          <div>

            <p className="font-semibold">
              {Number(item.TotalPanen).toLocaleString("id-ID")} kg
            </p>

            <p className="text-xs text-text-muted">
              {formatTanggal(item.Tanggal)}
            </p>

          </div>

          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              Number(item.TotalPanen) >=
              (sortedProductions[index + 1]?.TotalPanen || 0)
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {Number(item.TotalPanen) >=
            (sortedProductions[index + 1]?.TotalPanen || 0)
              ? "Naik"
              : "Turun"}
          </span>

        </div>

      ))}

      {sortedProductions.length === 0 && (
        <div className="border border-dashed border-bg-200 rounded-lg p-4 text-center text-sm text-text-muted">
          Belum ada data panen.
        </div>
      )}

    </div>

  </div>

</div>

        <div className="flex flex-col gap-4">
           <div className="flex gap-2">
              <input placeholder="Cari Lokasi..." className="input-field max-w-xs" ref={SearchRef} />
              <button onClick={() => search(SearchRef.current.value)} className="btn-primary text-white rounded-lg shadow hover:bg-green-600 transition text-sm sm:text-base px-4">Cari</button>
              <button
                onClick={openTanamanForm}
                className="btn-primary text-white rounded-lg shadow hover:bg-green-600 transition text-sm sm:text-base px-4">
                Tanaman Baru
              </button>
            </div>
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col border border-bg-200"
            >
              <div className="p-4 border-b border-bg-200 flex justify-between items-center bg-bg-50">
                <h3 className="text-lg font-bold text-text-dark">
                  {currentTanamanId ? "Edit Tanaman" : "Tambah Tanaman Baru"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-dark transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                <form className="space-y-4" onSubmit={handleSubmitTanaman}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                      Nama Tanaman
                    </label>
                    <input
                      type="text"
                      name="NamaTanaman"
                      value={tanamanFormData.NamaTanaman}
                      onChange={handleTanamanChange}
                      placeholder="Masukkan nama tanaman"
                      className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                      Deskripsi
                    </label>
                    <textarea
                      name="Deskripsi"
                      value={tanamanFormData.Deskripsi}
                      onChange={handleTanamanChange}
                      placeholder="Deskripsikan tanaman singkat"
                      className="w-full min-h-[110px] p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                      Umur Panen (hari)
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="UmurPanen"
                      value={tanamanFormData.UmurPanen}
                      onChange={handleTanamanChange}
                      placeholder="Masukkan umur panen"
                      className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-dark transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                    >
                      {currentTanamanId ? "Simpan Perubahan" : "Simpan Tanaman"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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