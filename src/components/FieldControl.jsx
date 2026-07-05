import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLahan, CreateLahan, UpdateLahan } from "../api/LahanService";
import { getPenanaman, CreatePenanaman, UpdatePenanaman } from "../api/PenanamanService";
import { getSchedulers, UpdateStatus } from "../api/SchedulerService";
import { GetTanamans } from "../api/TanamanService";
import { Layers, Search, Compass, Plus, RefreshCw, Pencil, CalendarCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [currentPenanamanLahanId, setCurrentPenanamanLahanId] = useState(null);
  const [currentPenanamanId, setCurrentPenanamanId] = useState(null);
  const [selectedLahanId, setSelectedLahanId] = useState(null);
  const [updatingSchedulerId, setUpdatingSchedulerId] = useState(null);
  const [formData, setFormData] = useState({
    NamaLahan: "",
    LuasTanah: "",
    Kondisi: "Baik",
    StatusLahan: "Aktif"
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
    setFormData({ NamaLahan: "", LuasTanah: "", Kondisi: "Baik", StatusLahan: "Aktif" });
    setIsModalOpen(true);
  };

  const openPenanamanModal = (lahanId) => {
    setModalType("penanaman");
    setIsModalOpen(true);
    setCurrentLahanId(null);
    setCurrentPenanamanLahanId(lahanId);
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
    setCurrentPenanamanLahanId(penanaman.LahanId);
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
    setCurrentPenanamanLahanId(null);
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

  const handleToggleScheduler = async (scheduler) => {
    const newStatus = scheduler.Status === 'Done' ? 'Pending' : 'Done';
    setUpdatingSchedulerId(scheduler.SchedulerId);
    try {
      await UpdateStatus(scheduler.SchedulerId, newStatus);
      setSchedulers(prev => prev.map(s =>
        s.SchedulerId === scheduler.SchedulerId ? { ...s, Status: newStatus } : s
      ));
    } catch (err) {
      console.error('Gagal update status scheduler:', err);
    } finally {
      setUpdatingSchedulerId(null);
    }
  };

  const refreshData = async () => {
    const dataLahan = await getLahan().catch(() => []);
    const dataPenanaman = await getPenanaman().catch(() => []);
    const dataScheduler = await getSchedulers().catch(() => []);
    const lahanArr = dataLahan?.data || dataLahan;
    const penArr = dataPenanaman?.data || dataPenanaman;
    const schedArr = dataScheduler?.data || dataScheduler;
    setLahans(Array.isArray(lahanArr) ? lahanArr : []);
    setPenanamans(Array.isArray(penArr) ? penArr : []);
    setSchedulers(Array.isArray(schedArr) ? schedArr : []);
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

                  const associatedPenanaman = penanamans.find(p => p.LahanId === item.LahanId);
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
                              <span className="text-xs font-bold text-text-muted italic">Belum ada penanaman</span>
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <div className="mt-5 flex gap-2">

                          {!associatedPenanaman ? (
                            <button
                              type="button"
                              onClick={() => openPenanamanModal(item.LahanId)}
                              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} /> Tambah Penanaman
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openEditPenanamanModal(associatedPenanaman)}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2.5 text-sm font-semibold transition flex items-center justify-center gap-1.5"
                            >
                              <Pencil size={14} /> Edit Penanaman
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEditLahan(item)}
                            className="px-4 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                          >
                            Edit
                          </button>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Scheduler Checklist ── */}
          <div className="lg:col-span-1">
            <div className="card border border-bg-200 bg-card rounded-xl sticky top-4">
              {(() => {
                const selLahan = lahan.find(l => l.LahanId === selectedLahanId);
                const selPenanaman = selLahan
                  ? penanamans.find(p => p.LahanId === selLahan.LahanId)
                  : null;
                const selSchedulers = selPenanaman
                  ? schedulers
                    .filter(s => s.PenanamanId === selPenanaman.PenanamanId)
                    .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal))
                  : [];

                const today = new Date().toISOString().split('T')[0];
                const done = selSchedulers.filter(s => s.Status === 'Done').length;
                const total = selSchedulers.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                if (!selLahan) return (
                  <div className="p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
                    <div className="w-14 h-14 rounded-full bg-bg-100 flex items-center justify-center">
                      <CalendarCheck size={24} className="text-text-muted" />
                    </div>
                    <p className="text-sm font-semibold text-text-dark">Pilih Lahan</p>
                    <p className="text-xs text-text-muted">Klik salah satu card lahan untuk melihat checklist jadwal aktivitas</p>
                  </div>
                );

                return (
                  <>
                    {/* Panel Header */}
                    <div className="p-4 border-b border-bg-200 bg-bg-50 rounded-t-xl">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-text-dark">{selLahan.NamaLahan}</h3>
                          {selPenanaman
                            ? <p className="text-xs text-text-muted mt-0.5">Tanaman: {selPenanaman.NamaTanaman}</p>
                            : <p className="text-xs text-amber-500 mt-0.5 italic">Belum ada penanaman</p>
                          }
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLahanId(null); }}
                          className="text-text-muted hover:text-text-dark text-lg leading-none transition-colors"
                        >✕</button>
                      </div>

                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[11px] font-semibold mb-1">
                            <span className="text-text-muted">{done}/{total} task selesai</span>
                            <span className="text-primary-600">{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-bg-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task list */}
                    <div className="p-3 overflow-y-auto max-h-[70vh] space-y-1.5">
                      {selSchedulers.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-xs text-text-muted">Belum ada jadwal untuk lahan ini</p>
                        </div>
                      ) : (
                        selSchedulers.map(task => {
                          const isToday = task.Tanggal === today;
                          const isDone = task.Status === 'Done';
                          const isUpdating = updatingSchedulerId === task.SchedulerId;
                          const isPast = task.Tanggal < today && !isDone;

                          return (
                            <div
                              key={task.SchedulerId}
                              onClick={(e) => { e.stopPropagation(); handleToggleScheduler(task); }}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all group ${isDone
                                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/30'
                                  : isToday
                                    ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700/30 shadow-sm'
                                    : isPast
                                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
                                      : 'bg-bg-50 border-bg-200 hover:border-primary-300 hover:bg-primary-50/30'
                                }`}
                            >
                              {/* Checkbox */}
                              <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isUpdating ? 'border-primary-300 bg-primary-100' :
                                  isDone ? 'border-emerald-500 bg-emerald-500' : 'border-bg-300 group-hover:border-primary-400'
                                }`} style={{ width: 18, height: 18 }}>
                                {isUpdating
                                  ? <RefreshCw size={9} className="animate-spin text-primary-500" />
                                  : isDone
                                    ? <CheckCircle2 size={10} className="text-white" />
                                    : null
                                }
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-text-muted' :
                                    isToday ? 'text-amber-700 dark:text-amber-300' :
                                      isPast ? 'text-red-600' : 'text-text-dark'
                                  }`}>{task.NamaScheduler}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-text-muted">{formatTanggal(task.Tanggal)}</span>
                                  {isToday && <span className="text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">HARI INI</span>}
                                  {isPast && <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">TERLAMBAT</span>}
                                </div>
                              </div>

                              {/* Status badge */}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-700' :
                                  isPast ? 'bg-red-100 text-red-700' :
                                    isToday ? 'bg-amber-100 text-amber-700' :
                                      'bg-bg-200 text-text-muted'
                                }`}>{task.Status}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
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
                          value={formData.StatusLahan}
                          onChange={handleChange}
                          className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Kosong">Kosong</option>
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
                      type="text"
                      className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      name="LahanId" value={penanamanFormData.LahanId} readOnly />
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
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
