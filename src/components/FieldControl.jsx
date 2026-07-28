import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLahan, CreateLahan, UpdateLahan, DeleteLahan, getLahanControl } from "../api/LahanService";
import { getPenanaman, CreatePenanaman, UpdatePenanaman, DeletePenanaman } from "../api/PenanamanService";
import { getSchedulers, UpdateStatus } from "../api/SchedulerService";
import { GetTanamans } from "../api/TanamanService";
import { Layers, Search, Compass, Plus, RefreshCw, Pencil, CalendarCheck, Clock, CheckCircle2, AlertCircle, Trash } from "lucide-react";

export default function FieldControl() {
  const [lahan, setLahans] = useState([]);
  const [penanamans, setPenanamans] = useState([]);
  const [tanaman, setTanaman] = useState([]);
  const [schedulers, setSchedulers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLahanId, setCurrentLahanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("lahan");
  const [currentPenanamanId, setCurrentPenanamanId] = useState(null);
  const [selectedLahanId, setSelectedLahanId] = useState(null);
  const [updatingSchedulerId, setUpdatingSchedulerId] = useState(null);
  const [selectedControl, setSelectedControl] = useState({
    penanaman: null,
    scheduler: [],
    aktivitas: []
  });
  const [loadingControl, setLoadingControl] = useState(false);
  const [formData, setFormData] = useState({
    NamaLahan: "",
    LuasTanah: "",
    Kondisi: "Baik",
    StatusLahan: "Kosong"
  });
  const [penanamanFormData, setPenanamanFormData] = useState({
    TanamanId: "",
    TanggalTanam: "",
    RencanaPanen: "",
    JumlahBibit: "",
    LahanId: "",
    Fase: "Vegetatif",
    Status: "Aktif",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataLahan = await getLahan().catch(() => []);
        const dataPenanaman = await getPenanaman().catch(() => []);
        const dataTanaman = await GetTanamans().catch(() => []);
        const dataScheduler = await getSchedulers().catch(() => []);
        setLahans(Array.isArray(dataLahan) ? dataLahan : (dataLahan?.data || []));
        setPenanamans(Array.isArray(dataPenanaman) ? dataPenanaman : (dataPenanaman?.data || []));
        const tanamanArr = dataTanaman?.data || dataTanaman;
        setTanaman(Array.isArray(tanamanArr) ? tanamanArr : []);
        const schedArr = dataScheduler?.data || dataScheduler;
        setSchedulers(Array.isArray(schedArr) ? schedArr : []);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchControlData = async () => {
      if (!selectedLahanId) {
        setSelectedControl({ penanaman: null, scheduler: [], aktivitas: [] });
        return;
      }
      setLoadingControl(true);
      try {
        const data = await getLahanControl(selectedLahanId);
        setSelectedControl(data || { penanaman: null, scheduler: [], aktivitas: [] });
      } catch (err) {
        console.error("Gagal mengambil control data lahan:", err);
      } finally {
        setLoadingControl(false);
      }
    };
    fetchControlData();
  }, [selectedLahanId]);

  const totalLahan = lahan.length;
  const filteredLahans = lahan.filter((item) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    return item.NamaLahan?.toLowerCase().includes(keyword);
  });

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const openModal = () => {
    setCurrentLahanId(null);
    setFormData({ NamaLahan: "", LuasTanah: "", Kondisi: "Baik", StatusLahan: "Kosong" });
    setIsModalOpen(true);
  };

  const openPenanamanModal = (lahanId) => {
    setModalType("penanaman");
    setIsModalOpen(true);
    setCurrentLahanId(null);
    setPenanamanFormData({
      TanamanId: "",
      TanggalTanam: "",
      RencanaPanen: "",
      JumlahBibit: "",
      LahanId: lahanId !== null && lahanId !== undefined ? String(lahanId) : "",
      Fase: "Vegetatif",
      Status: "Aktif",
    });
  };

  const openEditPenanamanModal = (penanaman) => {
    setModalType("penanaman");
    setCurrentPenanamanId(penanaman.PenanamanId);
    setCurrentLahanId(null);
    setPenanamanFormData({
      TanamanId: String(penanaman.TanamanId),
      TanggalTanam: penanaman.TanggalTanam ? penanaman.TanggalTanam.split('T')[0] : "",
      RencanaPanen: penanaman.RencanaPanen ? penanaman.RencanaPanen.split('T')[0] : "",
      JumlahBibit: String(penanaman.JumlahBibit),
      LahanId: String(penanaman.LahanId),
      Fase: penanaman.Fase || "Vegetatif",
      Status: penanaman.Status || "Aktif",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLahanId(null);
    setCurrentPenanamanId(null);
    setModalType("lahan");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePenanamanChange = (e) => {
    const { name, value } = e.target;
    setPenanamanFormData((prev) => ({ ...prev, [name]: value }));
  };

  const refreshData = async () => {
    const dataLahan = await getLahan().catch(() => []);
    const dataPenanaman = await getPenanaman().catch(() => []);
    const dataScheduler = await getSchedulers().catch(() => []);
    const dataTanaman = await GetTanamans().catch(() => []);
    const lahanArr = dataLahan?.data || dataLahan;
    const penArr = dataPenanaman?.data || dataPenanaman;
    const schedArr = dataScheduler?.data || dataScheduler;
    const tanamanArr = dataTanaman?.data || dataTanaman;
    setLahans(Array.isArray(lahanArr) ? lahanArr : []);
    setPenanamans(Array.isArray(penArr) ? penArr : []);
    setSchedulers(Array.isArray(schedArr) ? schedArr : []);
    setTanaman(Array.isArray(tanamanArr) ? tanamanArr : []);

    if (selectedLahanId) {
      try {
        const data = await getLahanControl(selectedLahanId);
        setSelectedControl(data || { penanaman: null, scheduler: [], aktivitas: [] });
      } catch (err) {
        console.error("Gagal refresh control data lahan:", err);
      }
    }
  };

  const handleSubmitPenanaman = async (e) => {
    e.preventDefault();
    try {
      if (currentPenanamanId) {
        await UpdatePenanaman(currentPenanamanId, penanamanFormData);
      } else {
        await CreatePenanaman(penanamanFormData);
      }
      await refreshData();
      closeModal();
    } catch (error) {
      console.error("Error saving penanaman:", error);
    }
  };

  const handleDeletePenanaman = async (penanaman) => {
    if (!penanaman?.PenanamanId) return;

    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus penanaman ini secara permanen?");
    if (!confirmed) return;

    try {
      await DeletePenanaman(penanaman.PenanamanId);
      setSelectedLahanId(null);
      await refreshData();
    } catch (error) {
      console.error("Gagal menghapus penanaman:", error);
      alert("Gagal menghapus penanaman. Silakan coba lagi.");
    }
  };

   const handleDeleteLahan = async (lahanId) => {
  if (!window.confirm("Yakin ingin menghapus lahan ini?")) return;

  try {
    await DeleteLahan(lahanId);

    refreshData();
  } catch (error) {
    console.error(error);
  }
};

  const handleSubmitLahan = async (e) => {
    e.preventDefault();

    try {
      if (currentLahanId) {
        const updatedLahan = await UpdateLahan(currentLahanId, formData);
        setLahans((current) =>
          current.map((item) =>
            item.LahanId === currentLahanId ? updatedLahan : item
          )
        );
      } else {
        const newLahan = await CreateLahan(formData);
        setLahans((current) => [...current, newLahan]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving lahan:", error);
    }
  };

  const handleEditLahan = (item) => {
    setCurrentLahanId(item.LahanId);
    setFormData({
      NamaLahan: item.NamaLahan,
      LuasTanah: item.LuasTanah,
      Kondisi: item.Kondisi,
      StatusLahan: item.StatusLahan
    });
    setIsModalOpen(true);
  };

  const handleMarkSiapPanen = async (e, penanaman) => {
    e.stopPropagation();
    if (!window.confirm(`Tandai penanaman "${penanaman.NamaTanaman}" sebagai Siap Panen?`)) return;
    try {
      // Kirim hanya field yang dikenali backend, date harus dalam format YYYY-MM-DD
      await UpdatePenanaman(penanaman.PenanamanId, {
        TanamanId:    Number(penanaman.TanamanId),
        LahanId:      Number(penanaman.LahanId),
        JumlahBibit:  Number(penanaman.JumlahBibit),
        TanggalTanam: penanaman.TanggalTanam ? penanaman.TanggalTanam.split('T')[0] : '',
        RencanaPanen: penanaman.RencanaPanen ? penanaman.RencanaPanen.split('T')[0] : '',
        Fase:        'Generatif',
        Status:       'Panen',
      });
      await refreshData();
    } catch (error) {
      console.error("Gagal mengubah status ke Panen:", error);
      alert("Gagal mengubah status penanaman: " + (error.message || "Silakan coba lagi."));
    }
  };



  return (
    <div className="p-1 md:p-4 max-w-7xl mx-auto space-y-6">
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-card p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/40 text-primary-600 rounded-lg">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Total Lahan Aktif</p>
            <h3 className="text-xl font-bold mt-0.5">
              {loading ? "-" : totalLahan}
            </h3>
          </div>
        </div>
      </div>

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
            Tambah Lahan Baru:
          </span>
          <button
            onClick={openModal}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={14} />
            Lahan Baru
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-primary-500" size={32} />
          <p className="text-text-muted font-medium">Memuat data monitoring lahan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {filteredLahans.length === 0 ? (
              <div className="card p-6 rounded-xl bg-card border border-bg-200">
                <p className="text-text-muted">Tidak ada lahan yang sesuai dengan pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLahans.map((item) => {
                  const kondisiClass =
                    item.Kondisi === "Baik"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400";

                  // Only show penanamans with status Aktif or Panen
                  const associatedPenanaman = penanamans.find(p => 
                    p.LahanId === item.LahanId && 
                    ['Aktif', 'Panen'].includes(String(p.Status || '').trim())
                  );
                  const isSelected = selectedLahanId === item.LahanId;

                  return (
                    <div
                      key={item.LahanId}
                      onClick={() => setSelectedLahanId(isSelected ? null : item.LahanId)}
                      className={`card relative overflow-hidden border transition-all duration-200 cursor-pointer ${isSelected
                          ? 'border-primary-500 ring-2 ring-primary-300 bg-primary-50/40'
                          : associatedPenanaman
                            ? 'border-primary-400 bg-primary-50/30 hover:border-primary-500'
                            : 'border-bg-200 bg-card hover:border-primary-300'
                        }`}
                    >
                      {/* Header Line */}
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${associatedPenanaman ? 'bg-primary-500' : 'bg-bg-300'}`} />

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                               <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleEditLahan(item); }}
                              className="px-4 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                            >
                              Edit Lahan
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteLahan(item.LahanId); }}
                              className="ml-2 px-4 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
                            >
                              Hapus Lahan
                            </button>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${kondisiClass}`}
                            >
                              {item.Kondisi}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${kondisiClass}`}
                            >
                              {item.StatusLahan}
                            </span>

                            <h3 className="text-lg font-bold text-text-dark mt-2">
                              {item.NamaLahan}
                            </h3>
                          </div>
                        </div>

                        {/* Informasi */}
                        <div className="space-y-3 mb-4">

                          <div>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-text-muted">
                                Luas Petak
                              </span>

                              <span className="text-primary-600">
                                {item.LuasTanah} m²
                              </span>
                            </div>
                          </div>

                          {associatedPenanaman ? (
                            <>
                              <div className="pt-2 border-t border-bg-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-primary-600">Ditanami {associatedPenanaman.NamaTanaman}</span>
                                {(() => {
                                  const s = associatedPenanaman.Status;
                                  const cls = s === 'Aktif'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                    : s === 'Panen'
                                      ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400'
                                      : s === 'Done'
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                        : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
                                  return (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>
                                      {s || 'Aktif'}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-text-muted">Awal Tanam</span>
                                <span className="text-text-dark">{formatTanggal(associatedPenanaman.TanggalTanam)}</span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-text-muted">Fase</span>
                                <span className="text-text-dark">{associatedPenanaman.Fase || '-'}</span>
                              </div>
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-text-muted">Rencana Panen</span>
                                <span className="text-text-dark">{formatTanggal(associatedPenanaman.RencanaPanen)}</span>
                              </div>

                              {/* ── PROGRESS LEVEL ── */}
                              {(() => {
                                const tanam = new Date(associatedPenanaman.TanggalTanam);
                                const panen = new Date(associatedPenanaman.RencanaPanen);
                                const now = new Date();
                                
                                let prog = 0;
                                let dayPassed = 0;
                                let total = 0;
                                
                                if (!isNaN(tanam) && !isNaN(panen) && tanam < panen) {
                                  total = Math.ceil((panen - tanam) / (1000 * 60 * 60 * 24));
                                  dayPassed = Math.ceil((now - tanam) / (1000 * 60 * 60 * 24));
                                  if (dayPassed >= total) prog = 100;
                                  else if (dayPassed > 0) prog = Math.round((dayPassed / total) * 100);
                                  dayPassed = Math.max(0, dayPassed);
                                }

                                const isReadyToHarvest = prog >= 100 && associatedPenanaman.Status === 'Aktif';
                                const barColor = isReadyToHarvest
                                  ? 'bg-amber-400'
                                  : prog >= 75
                                    ? 'bg-yellow-400'
                                    : 'bg-emerald-500';
                                
                                return (
                                  <div className="mt-3 pt-3 border-t border-bg-200">
                                    <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                                      <span className="text-text-muted">Progres Pertumbuhan</span>
                                      <span className={isReadyToHarvest ? 'text-amber-600 font-bold animate-pulse' : 'text-primary-600'}>
                                        {isReadyToHarvest ? '🌾 Siap Panen!' : `Hari ke-${Math.min(dayPassed, total)} / ${total} (${prog}%)`}
                                      </span>
                                    </div>
                                    <div className="w-full h-2 bg-bg-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${barColor} rounded-full transition-all duration-1000 relative overflow-hidden`}
                                        style={{ width: `${prog}%` }}
                                      >
                                        <div className="absolute inset-0 w-full h-full" style={{
                                          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                          animation: 'shimmer 2s infinite linear'
                                        }} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* ── TASK HARI INI ── */}
                              {(() => {
                                const today = new Date().toISOString().split('T')[0];
                                const todayTasks = schedulers.filter(
                                  s => s.PenanamanId === associatedPenanaman.PenanamanId && s.Tanggal === today
                                );
                                if (todayTasks.length === 0) return null;
                                return (
                                  <div className="mt-2 pt-2 border-t border-bg-200">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <CalendarCheck size={13} className="text-amber-500" />
                                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Task Hari Ini</span>
                                    </div>
                                    <div className="space-y-1">
                                      {todayTasks.map(task => (
                                        <div key={task.SchedulerId} className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 rounded-lg px-2.5 py-1.5">
                                          <div className="flex items-center gap-1.5">
                                            <Clock size={11} className="text-amber-500 shrink-0" />
                                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{task.NamaScheduler}</span>
                                          </div>
                                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${task.Status === 'Done'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : task.Status === 'Dibatalkan'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>{task.Status}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* ── AKTIVITAS TERAKHIR ── */}
                              {(() => {
                                const penSchedulers = schedulers
                                  .filter(s => s.PenanamanId === associatedPenanaman.PenanamanId && s.Status === 'Done')
                                  .sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));
                                const last = penSchedulers[0];
                                const nextPending = schedulers
                                  .filter(s => s.PenanamanId === associatedPenanaman.PenanamanId && s.Status === 'Pending')
                                  .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))[0];
                                return (
                                  <div className="mt-2 pt-2 border-t border-bg-200 space-y-1.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <CheckCircle2 size={13} className="text-primary-500" />
                                      <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wide">Aktivitas Terakhir</span>
                                    </div>
                                    {last ? (
                                      <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-2.5 py-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{last.NamaScheduler}</p>
                                            <p className="text-[10px] text-emerald-600 mt-0.5">{formatTanggal(last.Tanggal)}</p>
                                          </div>
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">Done</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-text-muted italic">Belum ada aktivitas selesai</p>
                                    )}
                                    {nextPending && (
                                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg px-2.5 py-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <p className="text-[10px] text-blue-500 font-semibold mb-0.5">Berikutnya</p>
                                            <p className="text-xs font-bold text-blue-700 dark:text-blue-300">{nextPending.NamaScheduler}</p>
                                            <p className="text-[10px] text-blue-600 mt-0.5">{formatTanggal(nextPending.Tanggal)}</p>
                                          </div>
                                          <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                            </>
                          ) : (
                            <div className="pt-2 border-t border-bg-200">
                              <span className="text-xs font-bold text-text-muted italic">Kosong</span>
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="mt-5 flex gap-2 flex-wrap">

                          {!associatedPenanaman ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openPenanamanModal(item.LahanId); }}
                              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} /> Tambah Penanaman
                            </button>
                          ) : (() => {
                            const tanam = new Date(associatedPenanaman.TanggalTanam);
                            const panen = new Date(associatedPenanaman.RencanaPanen);
                            const now = new Date();
                            let prog = 0;
                            if (!isNaN(tanam) && !isNaN(panen) && tanam < panen) {
                              const total = Math.ceil((panen - tanam) / (1000 * 60 * 60 * 24));
                              const dayPassed = Math.ceil((now - tanam) / (1000 * 60 * 60 * 24));
                              prog = dayPassed >= total ? 100 : dayPassed > 0 ? Math.round((dayPassed / total) * 100) : 0;
                            }
                            const isReadyToHarvest = prog >= 100 && associatedPenanaman.Status === 'Aktif';
                            return (
                              <>
                                {isReadyToHarvest && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkSiapPanen(e, associatedPenanaman)}
                                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-white rounded-lg py-2.5 text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/30 animate-pulse"
                                  >
                                    🌾 Siap Panen
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openEditPenanamanModal(associatedPenanaman); }}
                                  className="px-4 border border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg py-2.5 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                                >
                                  <Pencil size={20} />
                                </button>
                              </>
                            );
                          })()}

                          {associatedPenanaman && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeletePenanaman(associatedPenanaman); }}
                              className="px-4 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
                            >
                              <Trash size={20} />
                            </button>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                  {modalType === "lahan"
                    ? currentLahanId
                      ? "Edit Lahan"
                      : "Tambah Lahan Baru"
                    : currentPenanamanId
                      ? "Edit Penanaman"
                      : "Tambah Penanaman"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-text-muted hover:text-text-dark transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[80vh]">
                {modalType === "lahan" ? (
                  <form className="space-y-4" onSubmit={handleSubmitLahan}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Nama Lahan
                      </label>
                      <input
                        type="text"
                        name="NamaLahan"
                        value={formData.NamaLahan}
                        onChange={handleChange}
                        placeholder="Masukkan nama lahan"
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                          Luas Tanah (Meter Persegi)
                        </label>
                        <input
                          type="number"
                          name="LuasTanah"
                          value={formData.LuasTanah}
                          onChange={handleChange}
                          placeholder="Masukkan luas tanah"
                          className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                          Kondisi
                        </label>
                        <select
                          name="Kondisi"
                          value={formData.Kondisi}
                          onChange={handleChange}
                          className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="Baik">Baik</option>
                          <option value="Buruk">Buruk</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                          Status Lahan
                        </label>
                        <select
                          name="StatusLahan"
                          value={formData.StatusLahan || "Kosong"}
                          onChange={handleChange}
                          className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        
                        >
                           <option value="Kosong">Kosong</option>
                          <option value="Aktif">Aktif</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
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
                        Simpan Lahan
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmitPenanaman}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Jenis Tanaman
                      </label>
                      <select
                        name="TanamanId"
                        value={penanamanFormData.TanamanId}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="">Pilih Jenis Tanaman</option>
                        {tanaman.map((item, index) => (
                          <option key={item.TanamanId || index} value={item.TanamanId || item.TanamanId}>
                            {item.NamaTanaman || item.NamaTanaman}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Tanggal Tanam
                      </label>
                      <input
                        type="date"
                        name="TanggalTanam"
                        value={penanamanFormData.TanggalTanam}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Rencana Panen
                      </label>
                      <input
                        type="date"
                        name="RencanaPanen"
                        value={penanamanFormData.RencanaPanen}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Jumlah Bibit
                      </label>
                      <input
                        type="number"
                        name="JumlahBibit"
                        value={penanamanFormData.JumlahBibit}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        required
                      />
                    </div>
                    <input
                      type="hidden"
                      className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      name="LahanId" value={penanamanFormData.LahanId} readOnly />
                       <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Fase Penanaman</label>
                      <select
                        name="Fase"
                        value={penanamanFormData.Fase}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="Vegetatif">Vegetatif</option>
                        <option value="Generatif">Generatif</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Status Penanaman</label>
                      <select
                        name="Status"
                        value={penanamanFormData.Status}
                        onChange={handlePenanamanChange}
                        className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Panen">Panen</option>
                        <option value="Gagal">Gagal</option>
                        <option value="Selesai">Selesai</option>
                      </select>
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
                        Simpan Penanaman
                      </button>
                    </div>
                  </form>
                )
                }
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
