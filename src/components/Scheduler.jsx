import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Pencil,
  RefreshCw,
  ClipboardList,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSchedulers, UpdateStatus, DeleteScheduler, CreateScheduler, UpdateScheduler } from "../api/SchedulerService";
import { GetAktivitas } from "../api/AktivitasService";

export default function Scheduler() {
  const [schedulers, setSchedulers] = useState([]);
  const [aktivitasList, setAktivitasList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Pagination Distribusi Agenda (4 card per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 4;

  const [formData, setFormData] = useState({
    NamaScheduler: '',
    Tanggal: '',
    Status: 'Pending',
    PenanamanId: 0 
  });

  const [editId, setEditId] = useState(null);
  const todayStr = new Date().toLocaleDateString("sv-SE"); 

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const schedulerData = await getSchedulers();
      const listSchedulers = Array.isArray(schedulerData) ? schedulerData : [];
      setSchedulers(listSchedulers);

      const aktivitasData = await GetAktivitas();
      setAktivitasList(Array.isArray(aktivitasData) ? aktivitasData : []);

      if (listSchedulers.length > 0) {
        const firstValidId = listSchedulers[0].PenanamanId;
        setFormData((prev) => ({
          ...prev,
          PenanamanId: Number(firstValidId) 
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
    
  const handleDeleteScheduler = async (SchedulerId) => {
    try {
      const success = await DeleteScheduler(SchedulerId);
      if (success) {
        setSchedulers((current) => current.filter((s) => s.SchedulerId !== SchedulerId));
      }
    } catch (error) {
      console.error("Error deleting scheduler:", error);
    }
  };

  const handleCreateOrUpdateScheduler = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const originalScheduler = schedulers.find(s => s.SchedulerId === editId);
        const updatedScheduler = await UpdateScheduler(editId, {
          ...formData,
          PenanamanId: Number(formData.PenanamanId),
          IsManual: originalScheduler ? originalScheduler.IsManual : false
        });

        setSchedulers((current) =>
          current.map((s) => s.SchedulerId === editId ? updatedScheduler : s)
        );
        setEditId(null);
      } else {
        const newScheduler = await CreateScheduler({
          ...formData,
          PenanamanId: Number(formData.PenanamanId),
          IsManual: true
        });
        setSchedulers((current) => [...current, newScheduler]);
      }

      setFormData((prev) => ({
        NamaScheduler: "",
        Tanggal: "",
        Status: "Pending",
        PenanamanId: prev.PenanamanId 
      }));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEditScheduler = (scheduler) => {
    setEditId(scheduler.SchedulerId);
    setFormData({
      NamaScheduler: scheduler.NamaScheduler,
      Tanggal: scheduler.Tanggal ? scheduler.Tanggal.split("T")[0] : "",
      Status: scheduler.Status,
      PenanamanId: Number(scheduler.PenanamanId)
    });
  };

  const handleUpdateStatus = async (SchedulerId, currentStatus) => {
    const nextStatus = currentStatus === "Pending" ? "Selesai" : "Pending";
    try {
      const updated = await UpdateStatus(SchedulerId, nextStatus);
      setSchedulers((current) =>
        current.map((s) =>
          s.SchedulerId === SchedulerId ? { ...s, Status: updated.Status || nextStatus } : s
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const groupedSchedulers = schedulers.reduce((groups, scheduler) => {
    const pid = scheduler.PenanamanId || 14; 
    if (!groups[pid]) {
      groups[pid] = [];
    }
    groups[pid].push(scheduler);
    return groups;
  }, {});

  // LOGIKA PAGINATION UNTUK BLOK PENANAMAN + FITUR HOISTING JADWAL HARI INI
  const penanamanIds = Object.keys(groupedSchedulers).sort((a, b) => {
    // 1. Cek apakah Blok A memiliki minimal satu agenda aktif HARI INI
    const hasTodayA = groupedSchedulers[a].some((s) => {
      const dateStr = s.Tanggal ? s.Tanggal.split("T")[0] : "";
      return dateStr === todayStr && s.Status !== "Selesai";
    });

    // 2. Cek apakah Blok B memiliki minimal satu agenda aktif HARI INI
    const hasTodayB = groupedSchedulers[b].some((s) => {
      const dateStr = s.Tanggal ? s.Tanggal.split("T")[0] : "";
      return dateStr === todayStr && s.Status !== "Selesai";
    });

    // Jalankan aturan sorting: blok dengan tugas hari ini dipaksa naik ke atas
    if (hasTodayA && !hasTodayB) return -1;
    if (!hasTodayA && hasTodayB) return 1;

    // Jika sesama blok punya tugas hari ini, atau sesama blok normal, urutkan berdasarkan urutan ID Penanaman secara urut
    return Number(a) - Number(b);
  });

  const totalPages = Math.ceil(penanamanIds.length / cardsPerPage);
  
  // Mengambil ID Penanaman yang aktif di halaman saat ini
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentPenanamanIds = penanamanIds.slice(indexOfFirstCard, indexOfLastCard);

  const getCombinedLogs = () => {
    const originalLogs = aktivitasList.map((a) => ({
      id: `aktivitas-${a.AktivitasId}`,
      jenis: a.JenisAktivitas,
      tanggal: a.Tanggal ? a.Tanggal.split("T")[0] : "",
      keterangan: a.Keterangan || "-",
      tipe: "manual"
    }));

    const schedulerLogs = schedulers
      .filter((s) => {
        const schedulerDateStr = s.Tanggal ? s.Tanggal.split("T")[0] : "";
        const isOverdue = schedulerDateStr < todayStr && s.Status !== "Selesai";
        const isCompleted = s.Status === "Selesai";
        return isCompleted || isOverdue;
      })
      .map((s) => {
        const schedulerDateStr = s.Tanggal ? s.Tanggal.split("T")[0] : "";
        const isOverdue = schedulerDateStr < todayStr && s.Status !== "Selesai";

        return {
          id: `scheduler-${s.SchedulerId}`,
          jenis: s.NamaScheduler,
          tanggal: schedulerDateStr,
          keterangan: isOverdue 
            ? `⚠️ Terlewat (Blok #${s.PenanamanId})` 
            : `✓ Selesai (Blok #${s.PenanamanId})`,
          tipe: isOverdue ? "terlewat" : "selesai"
        };
      });

    return [...originalLogs, ...schedulerLogs].sort((a, b) => {
      return new Date(b.tanggal) - new Date(a.tanggal);
    });
  };

  const combinedLogs = getCombinedLogs();

  return (
    loading ? (
      <div className="card p-12 text-center flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 transition-colors">
        <RefreshCw className="animate-spin text-green-600 dark:text-green-400" size={32} />
        <p className="text-gray-500 dark:text-slate-400 font-medium">Memuat data dashboard...</p>
      </div>
    ) : (
      <div className="scheduler animate-fade-in p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-slate-100 transition-colors">
            <Calendar className="text-green-600 dark:text-green-400" />
            Manajemen Penjadwalan & Log Aktivitas
          </h2>
          <p className="text-gray-500 dark:text-slate-400 transition-colors">
            Kelola otomatisasi agenda greenhouse berdasarkan komoditas penanaman blok.
          </p>
        </div>

        {/* Form Pembuatan / Edit Jadwal */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700/60 max-w-5xl transition-colors duration-200">
          <form className="flex flex-wrap md:flex-nowrap items-end gap-3" onSubmit={handleCreateOrUpdateScheduler}>
            
            {/* Input Nama Tugas */}
            <div className="flex-[2] min-w-[200px] flex flex-col">
              <label className="block text-xs text-gray-400 dark:text-slate-400 mb-1.5 font-semibold h-[16px] leading-[16px]">
                Nama Tugas
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-slate-100 bg-gray-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-[42px] placeholder-gray-400 dark:placeholder-slate-500"
                placeholder="Tambah Tugas Baru"
                required
                value={formData.NamaScheduler}
                onChange={(e) => setFormData({ ...formData, NamaScheduler: e.target.value })}
              />
            </div>
            
            {/* Dropdown Blok Penanaman */}
            <div className="flex-1 min-w-[160px] flex flex-col">
              <label className="block text-xs text-gray-400 dark:text-slate-400 mb-1.5 font-semibold h-[16px] leading-[16px]">
                Blok Penanaman
              </label>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-slate-100 bg-gray-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-[42px]"
                value={formData.PenanamanId}
                onChange={(e) => setFormData({ ...formData, PenanamanId: Number(e.target.value) })}
              >
                {/* Gunakan salinan berurut murni untuk dropdown agar opsi penanaman tetap berurutan di form input */}
                {[...Object.keys(groupedSchedulers)].sort((a, b) => Number(a) - Number(b)).map((id) => (
                  <option key={id} value={Number(id)} className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100">
                    Penanaman #{id}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Tanggal */}
            <div className="flex-1 min-w-[140px] flex flex-col">
              <label className="block text-xs text-gray-400 dark:text-slate-400 mb-1.5 font-semibold h-[16px] leading-[16px]">
                Tanggal
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-slate-100 bg-gray-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-[42px] [color-scheme:light] dark:[color-scheme:dark]"
                required
                value={formData.Tanggal}
                onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
              />
            </div>

            {/* Dropdown Status */}
            <div className="flex-1 min-w-[120px] flex flex-col">
              <label className="block text-xs text-gray-400 dark:text-slate-400 mb-1.5 font-semibold h-[16px] leading-[16px]">
                Status
              </label>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-slate-100 bg-gray-50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-[42px]"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Pending" className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100">Pending</option>
                <option value="Selesai" className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100">Selesai</option>
                <option value="Dibatalkan" className="bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100">Dibatalkan</option>
              </select>
            </div>

            {/* Tombol Tambah / Simpan */}
            <div className="flex-shrink-0">
              <div className="h-[16px] mb-1.5"></div> 
              <button 
                type="submit" 
                className="bg-green-600 text-white px-5 rounded-lg text-sm font-semibold hover:bg-green-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 h-[42px] min-w-[110px] shadow-sm shadow-green-600/10"
              >
                <Plus size={16} /> 
                <span>{editId ? "Simpan" : "Tambah"}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Tata Letak Utama */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl items-start">
          
          {/* KOLOM KIRI (Distribusi Agenda dengan Pagination) */}
          <div className="xl:col-span-2 space-y-4 flex flex-col justify-between h-[660px]">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2 mb-4 transition-colors">
                <Layers className="text-blue-500 dark:text-blue-400" size={20} /> Distribusi Agenda per Blok Penanaman
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPenanamanIds.length === 0 ? (
                  <div className="col-span-2 bg-white dark:bg-slate-800 p-8 text-center rounded-2xl border border-gray-100 dark:border-slate-700/60 text-gray-400 dark:text-slate-400 transition-colors">
                    Tidak ada jadwal terdistribusi.
                  </div>
                ) : (
                  currentPenanamanIds.map((penanamanId) => {
                    const sortedAgenda = [...groupedSchedulers[penanamanId]].sort((a, b) => {
                      const dateA = a.Tanggal ? a.Tanggal.split("T")[0] : "";
                      const dateB = b.Tanggal ? b.Tanggal.split("T")[0] : "";

                      const isOverdueA = dateA < todayStr && a.Status !== "Selesai";
                      const isCompletedA = a.Status === "Selesai";
                      const isTodayA = dateA === todayStr && a.Status !== "Selesai";

                      const isOverdueB = dateB < todayStr && b.Status !== "Selesai";
                      const isCompletedB = b.Status === "Selesai";
                      const isTodayB = dateB === todayStr && b.Status !== "Selesai";

                      const getRank = (isT, isO, isC) => {
                        if (isT) return 1;                  
                        if (!isO && !isC) return 2;         
                        if (isO) return 3;                  
                        if (isC) return 4;                  
                        return 5;
                      };

                      const rankA = getRank(isTodayA, isOverdueA, isCompletedA);
                      const rankB = getRank(isTodayB, isOverdueB, isCompletedB);

                      if (rankA !== rankB) {
                        return rankA - rankB;
                      }

                      return new Date(a.Tanggal) - new Date(b.Tanggal);
                    });

                    return (
                      <div key={penanamanId} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 flex flex-col justify-between h-[255px] transition-colors duration-200">
                        <div>
                          <div className="border-b border-gray-100 dark:border-slate-700/80 pb-1.5 mb-2 flex justify-between items-center bg-gray-50 dark:bg-slate-700/40 p-2 rounded-lg transition-colors">
                            <span className="font-bold text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                              🌱 Penanaman ID: #{penanamanId}
                            </span>
                            <span className="text-[10px] bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold transition-colors">
                              {sortedAgenda.length} Agenda
                            </span>
                          </div>

                          <div className="space-y-2 max-h-[185px] overflow-y-auto pr-1">
                            <AnimatePresence>
                              {sortedAgenda.map((s) => {
                                const schedulerDateStr = s.Tanggal ? s.Tanggal.split("T")[0] : "";
                                const isOverdue = schedulerDateStr < todayStr && s.Status !== "Selesai";
                                const isCompleted = s.Status === "Selesai";
                                const isToday = schedulerDateStr === todayStr && s.Status !== "Selesai";
                                const isActionBlocked = isOverdue || isCompleted;

                                return (
                                  <motion.div 
                                    key={s.SchedulerId} 
                                    initial={{ opacity: 0, y: 5 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between transition gap-2 ${
                                      isOverdue 
                                        ? "border-rose-300 dark:border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20" 
                                        : isCompleted
                                          ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20"
                                          : isToday
                                            ? "border-amber-400 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-sm shadow-amber-400/10 dark:shadow-amber-400/20 hover:bg-amber-100/30 dark:hover:bg-amber-950/40"
                                            : s.IsManual 
                                              ? "border-green-200 dark:border-slate-700 bg-green-50/40 dark:bg-slate-700/30 hover:bg-green-50 dark:hover:bg-slate-700/50" 
                                              : "border-gray-100 dark:border-slate-700/50 hover:border-gray-200 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/40"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      {isToday && (
                                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-300 mb-0.5 tracking-wide animate-pulse">
                                          ⚠️ Saatnya melakukan...
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className={`text-xs font-semibold ${
                                          isOverdue || isCompleted 
                                            ? "line-through text-gray-400 dark:text-slate-400/80" 
                                            : "text-gray-800 dark:text-slate-100"
                                        } truncate`}>
                                          {s.NamaScheduler}
                                        </p>
                                        {s.IsManual && (
                                          <span className="text-[8px] bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300 px-1 py-0.2 rounded font-semibold flex-shrink-0">
                                            Kustom
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400">{schedulerDateStr || "-"}</p>
                                        {isOverdue && <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">• Terlewat</span>}
                                        {isCompleted && <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">✓ Selesai</span>}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <button 
                                        onClick={() => !isActionBlocked && handleUpdateStatus(s.SchedulerId, s.Status)} 
                                        disabled={isActionBlocked}
                                        className={`flex items-center p-1 rounded ${isActionBlocked ? "cursor-not-allowed opacity-60" : "hover:bg-gray-100 dark:hover:bg-slate-700"}`}
                                        title={
                                          isOverdue 
                                            ? "Sudah terlewat" 
                                            : isCompleted 
                                              ? "Tugas telah selesai dan dikunci" 
                                              : "Ubah status"
                                        }
                                      >
                                        {s.Status === "Selesai" ? (
                                          <CheckCircle size={14} className="text-emerald-500 dark:text-emerald-400" />
                                        ) : (
                                          <Circle size={14} className={isOverdue ? "text-rose-500 dark:text-rose-400" : isToday ? "text-amber-500 dark:text-amber-400 font-bold" : "text-yellow-500"} />
                                        )}
                                      </button>
                                      
                                      <button 
                                        onClick={() => !isActionBlocked && handleEditScheduler(s)} 
                                        disabled={isActionBlocked}
                                        className={`p-1 rounded ${isActionBlocked ? "text-gray-300 dark:text-slate-600 cursor-not-allowed opacity-40" : "text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"}`}
                                        title={isActionBlocked ? "Tidak bisa mengedit tugas ini" : "Edit agenda"}
                                      >
                                        <Pencil size={13} />
                                      </button>

                                      <button 
                                        onClick={() => { 
                                          if (!isActionBlocked && confirm("Hapus agenda ini?")) {
                                            handleDeleteScheduler(s.SchedulerId); 
                                          }
                                        }} 
                                        disabled={isActionBlocked}
                                        className={`p-1 rounded ${isActionBlocked ? "text-gray-300 dark:text-slate-600 cursor-not-allowed opacity-40" : "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"}`}
                                        title={isActionBlocked ? "Tidak bisa menghapus tugas ini" : "Hapus agenda"}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* NAVIGASI PAGINATION DI BAGIAN BAWAH KIRI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 py-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentPage === index + 1
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Riwayat Log */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700/60 flex flex-col h-[660px] transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2 mb-4 transition-colors">
              <ClipboardList className="text-orange-500" size={20} /> Riwayat Log Aktivitas
            </h3>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 pr-1 pb-2 scrollbar-thin dark:scrollbar-thumb-slate-700">
              <table className="w-full text-left border-collapse text-xs table-fixed min-w-[450px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2 w-[40%]">Aktivitas</th>
                    <th className="pb-2 w-[25%]">Tanggal</th>
                    <th className="pb-2 w-[35%]">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedLogs.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-6 text-gray-400 dark:text-slate-400">Tidak ada riwayat log.</td></tr>
                  ) : (
                    combinedLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                          log.tipe === "terlewat" 
                            ? "bg-rose-50/10 dark:bg-rose-950/10" 
                            : log.tipe === "selesai" 
                              ? "bg-emerald-50/10 dark:bg-emerald-950/10" 
                              : ""
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium text-gray-700 dark:text-slate-200 truncate whitespace-nowrap">{log.jenis}</td>
                        <td className="py-3 pr-4 text-gray-400 dark:text-slate-400 whitespace-nowrap">{log.tanggal}</td>
                        <td className={`py-3 font-semibold whitespace-nowrap ${
                          log.tipe === "terlewat" 
                            ? "text-rose-500 dark:text-rose-400" 
                            : log.tipe === "selesai" 
                              ? "text-emerald-500 dark:text-emerald-400" 
                              : "text-gray-500 dark:text-slate-400"
                        }`}>
                          {log.keterangan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    )
  );
}