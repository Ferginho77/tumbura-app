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
} from "lucide-react";
import { getSchedulers, UpdateStatus, DeleteScheduler, CreateScheduler, UpdateScheduler } from "../api/SchedulerService";
import { GetAktivitas } from "../api/AktivitasService";

export default function Scheduler() {
  const [schedulers, setSchedulers] = useState([]);
  const [aktivitasList, setAktivitasList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    NamaScheduler: '',
    Tanggal: '',
    Status: 'Pending',
    PenanamanId: 0 // Biarkan 0 dulu, akan diisi otomatis secara dinamis oleh fetchAllData
  });

  const [editId, setEditId] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const schedulerData = await getSchedulers();
      const listSchedulers = Array.isArray(schedulerData) ? schedulerData : [];
      setSchedulers(listSchedulers);

      const aktivitasData = await GetAktivitas();
      setAktivitasList(Array.isArray(aktivitasData) ? aktivitasData : []);

      // 🔥 AMAN KAN FOREIGN KEY: Cari ID Penanaman pertama yang benar-benar ada di database
      if (listSchedulers.length > 0) {
        const firstValidId = listSchedulers[0].PenanamanId;
        setFormData((prev) => ({
          ...prev,
          PenanamanId: Number(firstValidId) // Set dropdown ke ID pertama yang valid (misal: 14)
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
        // 🔥 Kirim data baru dengan PenanamanId yang sudah pasti valid
        const newScheduler = await CreateScheduler({
          ...formData,
          PenanamanId: Number(formData.PenanamanId),
          IsManual: true
        });
        setSchedulers((current) => [...current, newScheduler]);
      }

      // Reset Form dengan mempertahankan pilihan PenanamanId yang aktif
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

  return (
    loading ? (
      <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-green-600" size={32} />
        <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
      </div>
    ) : (
      <div className="scheduler animate-fade-in p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Calendar className="text-green-600" />
            Manajemen Penjadwalan & Log Aktivitas
          </h2>
          <p className="text-gray-500">
            Kelola otomatisasi agenda greenhouse berdasarkan komoditas penanaman blok.
          </p>
        </div>

        {/* Form Pembuatan / Edit Jadwal */}
        <div className="bg-white p-6 rounded-2xl shadow-md border max-w-5xl">
          <form className="flex flex-wrap gap-3 items-end" onSubmit={handleCreateOrUpdateScheduler}>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Nama Tugas</label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg"
                placeholder="Tambah Tugas Baru"
                required
                value={formData.NamaScheduler}
                onChange={(e) => setFormData({ ...formData, NamaScheduler: e.target.value })}
              />
            </div>
            
            {/* Dropdown Pilihan Blok Penanaman yang sudah diperbaiki */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Blok Penanaman</label>
              <select
                className="border p-2 rounded-lg bg-gray-50 text-gray-700 font-medium"
                value={formData.PenanamanId}
                onChange={(e) => setFormData({ ...formData, PenanamanId: Number(e.target.value) })}
              >
                {Object.keys(groupedSchedulers).map((id) => (
                  <option key={id} value={Number(id)}>
                    Penanaman #{id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Tanggal</label>
              <input
                type="date"
                className="border p-2 rounded-lg"
                required
                value={formData.Tanggal}
                onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">Status</label>
              <select
                className="border p-2 rounded-lg"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-1 h-[42px]">
              <Plus size={18} /> {editId ? "Simpan" : "Tambah"}
            </button>
          </form>
        </div>

        {/* Tata Letak Utama */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl items-start">
          
          {/* KOLOM KIRI: Wireframe Grid Card */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
              <Layers className="text-blue-500" size={20} /> Distribusi Agenda per Blok Penanaman
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedSchedulers).length === 0 ? (
                <div className="col-span-2 bg-white p-8 text-center rounded-2xl border text-gray-400">Tidak ada jadwal terdistribusi.</div>
              ) : (
                Object.keys(groupedSchedulers).map((penanamanId) => {
                  const sortedAgenda = [...groupedSchedulers[penanamanId]].sort((a, b) => {
                    if (a.IsManual && !b.IsManual) return -1;
                    if (!a.IsManual && b.IsManual) return 1;
                    return new Date(a.Tanggal) - new Date(b.Tanggal);
                  });

                  return (
                    <div key={penanamanId} className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col justify-between min-h-[300px]">
                      <div>
                        <div className="border-b pb-2 mb-3 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <span className="font-bold text-sm text-green-700 flex items-center gap-1">
                            🌱 Penanaman ID: #{penanamanId}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                            {sortedAgenda.length} Agenda
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                          <AnimatePresence>
                            {sortedAgenda.map((s) => (
                              <motion.div 
                                key={s.SchedulerId} 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }}
                                className={`p-3 rounded-xl border flex items-center justify-between transition gap-2 ${
                                  s.IsManual 
                                    ? "border-green-200 bg-green-50/40 hover:bg-green-50" 
                                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-gray-700 truncate">{s.NamaScheduler}</p>
                                    {s.IsManual && (
                                      <span className="text-[9px] bg-green-200 text-green-800 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                                        Kustom
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400 mt-0.5">{s.Tanggal ? s.Tanggal.split("T")[0] : "-"}</p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button onClick={() => handleUpdateStatus(s.SchedulerId, s.Status)} className="flex items-center p-1 rounded hover:bg-gray-100">
                                    {s.Status === "Selesai" ? (
                                      <CheckCircle size={15} className="text-green-600" />
                                    ) : (
                                      <Circle size={15} className="text-yellow-500" />
                                    )}
                                  </button>
                                  
                                  <button onClick={() => handleEditScheduler(s)} className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                                  <button onClick={() => { if(confirm("Hapus agenda ini?")) handleDeleteScheduler(s.SchedulerId); }} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* KOLOM KANAN: Riwayat Log */}
          <div className="bg-white p-5 rounded-2xl shadow-md border flex flex-col h-full min-h-[450px]">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <ClipboardList className="text-orange-500" size={20} /> Riwayat Log Aktivitas
            </h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Aktivitas</th>
                    <th className="pb-2">Tanggal</th>
                    <th className="pb-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {aktivitasList.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-6 text-gray-400">Tidak ada riwayat log.</td></tr>
                  ) : (
                    aktivitasList.map((a) => (
                      <tr key={a.AktivitasId} className="border-b hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-gray-700">{a.JenisAktivitas}</td>
                        <td className="py-2.5 text-gray-400">{a.Tanggal ? a.Tanggal.split("T")[0] : "-"}</td>
                        <td className="py-2.5 text-gray-500 truncate max-w-[120px]">{a.Keterangan || "-"}</td>
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