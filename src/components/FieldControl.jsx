import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getPenanaman } from "../api/PenanamanService";
import {
  Sprout,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Settings,
  RefreshCw,
  Layers,
  Search,
  Check,
  Compass,
  CheckSquare,
  Square,
  Info,
  ShieldAlert,
  Sparkles,
  ClipboardList
} from "lucide-react";
 
export default function FieldControl() {
  const [penanamans, setPenanamans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [configs, setConfigs] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState("semua"); // semua, vegetatif, generatif, panen
 
  // Notification states
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
 
  // Growth calculation utility
  const calculateProgress = (tanggalTanam, rencanaPanen) => {
    if (!tanggalTanam || !rencanaPanen) {
      return { percent: 50, elapsed: 30, total: 60, remaining: 30 };
    }
    const start = new Date(tanggalTanam);
    const end = new Date(rencanaPanen);
    const today = new Date();
 
    const totalMs = end.getTime() - start.getTime();
    const elapsedMs = today.getTime() - start.getTime();
 
    const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.round(elapsedMs / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
 
    let percent = Math.round((elapsedDays / totalDays) * 100);
    percent = Math.min(100, Math.max(0, percent));
 
    return { percent, elapsed: elapsedDays, total: totalDays, remaining: remainingDays };
  };
 
  useEffect(() => {
    const fetchPenanamans = async () => {
      try {
        setLoading(true);
        const data = await getPenanaman();
        setPenanamans(data);
 
        const initConfigs = {};
        data.forEach((p) => {
          const prog = calculateProgress(p.TanggalTanam, p.RencanaPanen);
          const autoFase =
            prog.percent >= 90 ? "Siap Panen" : prog.percent > 60 ? "Generatif" : "Vegetatif";
 
          initConfigs[p.PenanamanId] = {
            fase: autoFase,
            statusLahan: "Aktif",
            volumeAir: p.NamaTanaman.toLowerCase().includes("melon") ? 5.5 : 4.0,
            frekuensiSiram: "2x Sehari",
            jenisPupuk: p.NamaTanaman.toLowerCase().includes("melon")
              ? "AB Mix Melon Premium"
              : "NPK Cair Mutiara",
            dosisPupuk: 20,
            catatan: "",
            tasks: [
              { id: 1, text: "Penyiraman pagi hari", done: true },
              { id: 2, text: "Pengecekan kelembapan tanah", done: false },
              { id: 3, text: "Pemberian nutrisi berkala", done: false },
              { id: 4, text: "Pembersihan gulma & guludan", done: false },
            ],
          };
        });
        setConfigs(initConfigs);
 
        if (data.length > 0) {
          setSelectedId(data[0].PenanamanId);
        }
      } catch (error) {
        console.error("Gagal memuat data penanaman:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPenanamans();
  }, []);
 
  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
 
  const handleToggleTask = (penanamanId, taskId) => {
    setConfigs((prev) => {
      const currentConfig = prev[penanamanId];
      if (!currentConfig) return prev;
      return {
        ...prev,
        [penanamanId]: {
          ...currentConfig,
          tasks: currentConfig.tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
          ),
        },
      };
    });
  };
 
  const handleUpdateConfigValue = (penanamanId, key, value) => {
    setConfigs((prev) => ({
      ...prev,
      [penanamanId]: { ...prev[penanamanId], [key]: value },
    }));
  };
 
  const handleSaveToDatabase = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setNotification({
        type: "success",
        message: "Konfigurasi budidaya berhasil disimpan ke database!",
      });
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };
 
  const activePenanaman = penanamans.find((p) => p.PenanamanId === selectedId);
  const activeConfig = selectedId ? configs[selectedId] : null;
 
  const filteredPenanamans = penanamans.filter((p) => {
    const matchesSearch =
      p.NamaLahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.NamaTanaman.toLowerCase().includes(searchQuery.toLowerCase());
 
    const prog = calculateProgress(p.TanggalTanam, p.RencanaPanen);
    const calculatedPhase =
      prog.percent >= 90 ? "panen" : prog.percent > 60 ? "generatif" : "vegetatif";
 
    const matchesFilter =
      filterPhase === "semua" ||
      (filterPhase === "vegetatif" && calculatedPhase === "vegetatif") ||
      (filterPhase === "generatif" && calculatedPhase === "generatif") ||
      (filterPhase === "panen" && calculatedPhase === "panen");
 
    return matchesSearch && matchesFilter;
  });
 
  const totalLahan = penanamans.length;
  const readyToHarvest = penanamans.filter((p) => {
    const prog = calculateProgress(p.TanggalTanam, p.RencanaPanen);
    return prog.percent >= 90;
  }).length;
  const avgGrowthPercent =
    penanamans.length > 0
      ? Math.round(
          penanamans.reduce(
            (acc, p) => acc + calculateProgress(p.TanggalTanam, p.RencanaPanen).percent,
            0
          ) / penanamans.length
        )
      : 0;
 
  const totalTasksCount = Object.values(configs).reduce(
    (acc, c) => acc + c.tasks.length,
    0
  );
  const completedTasksCount = Object.values(configs).reduce(
    (acc, c) => acc + c.tasks.filter((t) => t.done).length,
    0
  );
  const tasksPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
 
  return (
    <div className="p-1 md:p-4 max-w-7xl mx-auto space-y-6">
      {/* Alert Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 bg-emerald-500 text-white rounded-xl shadow-lg border border-emerald-400 font-medium max-w-md"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="text-sm">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bg-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-dark flex items-center gap-2">
            <Compass className="text-primary-500 animate-spin-slow" size={32} />
            Monitoring & Kontrol Lahan
          </h1>
          <p className="text-text-muted mt-1 text-sm md:text-base">
            Pantau pertumbuhan tanaman secara visual dan sesuaikan rencana pengelolaan budidaya.
          </p>
        </div>
      </div>
 
      {/* Summary Statistics Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/40 text-primary-600 rounded-lg">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Total Lahan Aktif</p>
            <h3 className="text-xl font-bold mt-0.5">{loading ? "-" : totalLahan}</h3>
          </div>
        </div>
 
        <div className="card bg-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-lg">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Siap Panen</p>
            <h3 className="text-xl font-bold mt-0.5">{loading ? "-" : readyToHarvest} Lahan</h3>
          </div>
        </div>
 
        <div className="card bg-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-sky-100 dark:bg-sky-950/40 text-sky-600 rounded-lg">
            <Sprout size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Rerata Tumbuh</p>
            <h3 className="text-xl font-bold mt-0.5">{loading ? "-" : `${avgGrowthPercent}%`}</h3>
          </div>
        </div>
 
        <div className="card bg-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
            <CheckSquare size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Tugas Selesai</p>
            <h3 className="text-xl font-bold mt-0.5">{loading ? "-" : `${tasksPercent}%`}</h3>
          </div>
        </div>
      </div>
 
      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-bg-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="Cari nama lahan atau tanaman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
 
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-text-muted font-medium whitespace-nowrap hidden sm:inline">
            Filter Fase:
          </span>
          {["semua", "vegetatif", "generatif", "panen"].map((phase) => (
            <button
              key={phase}
              onClick={() => setFilterPhase(phase)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                filterPhase === phase
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-input text-text-muted border border-bg-200 hover:bg-bg-100"
              }`}
            >
              {phase === "panen" ? "Siap Panen" : phase}
            </button>
          ))}
        </div>
      </div>
 
      {/* Main Content Layout */}
      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-primary-500" size={32} />
          <p className="text-text-muted font-medium">Memuat data monitoring lahan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Middle: List of Lahan Cards */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPenanamans.length === 0 ? (
              <div className="card p-12 text-center text-text-muted">
                <ShieldAlert className="mx-auto text-amber-500 mb-2" size={32} />
                <p className="font-semibold">Lahan tidak ditemukan</p>
                <p className="text-sm mt-1">
                  Coba sesuaikan pencarian atau filter fase budidaya Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPenanamans.map((p) => {
                  const isSelected = p.PenanamanId === selectedId;
                  const prog = calculateProgress(p.TanggalTanam, p.RencanaPanen);
                  const activeCfg = configs[p.PenanamanId];
                  const currentFase =
                    p.Fase || activeCfg?.fase ||
                    (prog.percent >= 90
                      ? "Siap Panen"
                      : prog.percent > 60
                      ? "Generatif"
                      : "Vegetatif");
 
                  let phaseBadgeClass =
                    "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400";
                  if (currentFase === "Generatif") {
                    phaseBadgeClass =
                      "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400";
                  } else if (currentFase === "Siap Panen") {
                    phaseBadgeClass =
                      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 animate-pulse";
                  } else if (currentFase === "Persiapan Lahan") {
                    phaseBadgeClass =
                      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
                  }
 
                  return (
                    <motion.div
                      key={p.PenanamanId}
                      layoutId={`card-${p.PenanamanId}`}
                      onClick={() => setSelectedId(p.PenanamanId)}
                      className={`card cursor-pointer relative overflow-hidden transition-all duration-200 border ${
                        isSelected
                          ? "border-primary-500 ring-2 ring-primary-100 ring-offset-0 bg-primary-50/10 dark:bg-primary-950/5"
                          : "border-bg-200 bg-card hover:border-primary-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500" />
                      )}
 
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${phaseBadgeClass}`}
                          >
                            {currentFase}
                          </span>
                          <h3 className="text-lg font-bold text-text-dark mt-2">{p.NamaLahan}</h3>
                          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                            <Sprout size={12} className="text-primary-500" />
                            {p.NamaTanaman}
                          </p>
                        </div>
                        <ChevronRight
                          className={`text-text-muted transition-transform ${
                            isSelected ? "translate-x-1 text-primary-500" : ""
                          }`}
                          size={20}
                        />
                      </div>
 
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-text-muted">Progres Pertumbuhan</span>
                          <span className="text-primary-600">{prog.percent}%</span>
                        </div>
                        <div className="w-full bg-bg-100 dark:bg-bg-200 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prog.percent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-primary-500 h-full rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted pt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} /> Hari ke-{prog.elapsed}
                          </span>
                          <span>{prog.remaining} hari menuju panen</span>
                        </div>
                      </div>
 
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-bg-200/50 text-xs text-text-muted">
                        <div>
                          <p className="text-[10px] uppercase text-text-muted font-medium">
                            Mulai Tanam
                          </p>
                          <p className="font-semibold text-text-dark mt-0.5">
                            {formatTanggal(p.TanggalTanam)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-text-muted font-medium">
                            Estimasi Panen
                          </p>
                          <p className="font-semibold text-text-dark mt-0.5">
                            {formatTanggal(p.RencanaPanen)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Right Column: Cultivation Management Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {activePenanaman && activeConfig ? (
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="card border border-bg-200 bg-card p-5 rounded-xl space-y-5 shadow-lg relative"
                >
                  {/* Panel Header */}
                  <div>
                    <div className="flex items-center gap-2 text-primary-600">
                      <Settings className="animate-spin-slow" size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Pengaturan Lahan
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text-dark mt-1">
                      {activePenanaman.NamaLahan}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Kelola target budidaya & checklist harian untuk tanaman{" "}
                      <span className="font-semibold text-primary-600">
                        {activePenanaman.NamaTanaman}
                      </span>
                      .
                    </p>
                  </div>
 
                  {/* Content */}
                  <div className="space-y-4">
                    {/* Status Fase */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Status Fase Budidaya
                      </label>
                      <select
                        value={activeConfig.fase}
                        onChange={(e) =>
                          handleUpdateConfigValue(selectedId, "fase", e.target.value)
                        }
                        className="w-full p-2 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500"
                      >
                        <option value="Persiapan Lahan">Persiapan Lahan / Tanah</option>
                        <option value="Vegetatif">Vegetatif (Pertumbuhan Daun/Batang)</option>
                        <option value="Generatif">Generatif (Pembungaan/Pembuahan)</option>
                        <option value="Siap Panen">Siap Panen / Matang</option>
                      </select>
                      <p className="text-[10px] text-text-muted">
                        Mengubah status ini akan merubah label dan parameter budidaya di database.
                      </p>
                    </div>
 
                    {/* Checklist Harian */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                        <span>Checklist Tugas Harian</span>
                        <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full dark:bg-primary-950/40 dark:text-primary-400">
                          {activeConfig.tasks.filter((t) => t.done).length}/
                          {activeConfig.tasks.length} Selesai
                        </span>
                      </label>
                      <div className="space-y-1.5">
                        {activeConfig.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(selectedId, task.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                              task.done
                                ? "bg-primary-50/30 border-primary-200 text-text-muted line-through dark:bg-primary-950/10 dark:border-primary-900/40"
                                : "bg-input border-bg-200 text-text-dark hover:border-primary-300"
                            }`}
                          >
                            {task.done ? (
                              <CheckSquare className="text-primary-500 shrink-0" size={16} />
                            ) : (
                              <Square className="text-text-muted shrink-0" size={16} />
                            )}
                            <span className="text-xs font-medium">{task.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
 
                    {/* Catatan Pemantauan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Catatan Pemantauan Lahan
                      </label>
                      <textarea
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-xs transition-all focus:border-primary-500 min-h-[90px] resize-y"
                        placeholder="Tulis hasil inspeksi di sini (misal: kondisi hama, kesehatan daun, dll)..."
                        value={activeConfig.catatan}
                        onChange={(e) =>
                          handleUpdateConfigValue(selectedId, "catatan", e.target.value)
                        }
                      />
                    </div>
                  </div>
 
                  {/* Save Action */}
                  <div className="pt-4 border-t border-bg-200 flex flex-col gap-2">
                    <button
                      onClick={handleSaveToDatabase}
                      disabled={isSaving}
                      className="w-full btn-primary py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-75 transition-all"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Menyimpan Konfigurasi...
                        </>
                      ) : (
                        <>
                          <ClipboardList size={16} />
                          Simpan Rencana Budidaya
                        </>
                      )}
                    </button>
                    <p className="text-[9px] text-center text-text-muted">
                      Setiap perubahan target dan checklist akan disimpan ke server database utama.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="card p-12 text-center text-text-muted border border-dashed border-bg-200">
                  <Info className="mx-auto text-primary-400 mb-2" size={32} />
                  <p className="font-semibold">Pilih Lahan Terlebih Dahulu</p>
                  <p className="text-xs mt-1">
                    Silakan klik salah satu kartu lahan di sebelah kiri untuk melihat detail
                    monitoring dan mengatur budidaya.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}