import { useState, useEffect } from "react";
import { getPenanaman, UpdatePenanaman } from "../api/PenanamanService";
import { getProduksi, CreateProduksi } from "../api/ProduksiService";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, CheckCircle, Wheat, Calendar, MapPin, Search, Leaf, Loader2, Bean } from "lucide-react";

export default function Harvest() {
  const [penanamans, setPenanamans] = useState([]);
  const [produksis, setProduksis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPenanaman, setSelectedPenanaman] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produksiForm, setProduksiForm] = useState({
    Tanggal: new Date().toISOString().split('T')[0],
    JumlahBuah: "",
    TotalPanen: ""
  });

  const handleProduksiChange = (e) => {
    const { name, value } = e.target;
    setProduksiForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProduksiSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPenanaman) return;

    try {
      const payload = {
        PenanamanId: selectedPenanaman.PenanamanId,
        Tanggal: produksiForm.Tanggal,
        JumlahBuah: produksiForm.JumlahBuah,
        TotalPanen: produksiForm.TotalPanen
      };
      await CreateProduksi(payload);

      // Refresh produksi
      const dataProduksi = await getProduksi();
      setProduksis(Array.isArray(dataProduksi) ? dataProduksi : []);

      // Refresh penanaman to update status
      const dataPenanaman = await getPenanaman();
      setPenanamans(Array.isArray(dataPenanaman) ? dataPenanaman : []);

      alert("Data produksi berhasil disimpan!");
      setIsModalOpen(false);
      setSelectedPenanaman(null);
    } catch (error) {
      console.error("Gagal memproses panen:", error);
      alert("Gagal memproses panen, silakan coba lagi.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataPenanaman, dataProduksi] = await Promise.all([
          getPenanaman().catch(() => []),
          getProduksi().catch(() => [])
        ]);
        setPenanamans(Array.isArray(dataPenanaman) ? dataPenanaman : []);
        setProduksis(Array.isArray(dataProduksi) ? dataProduksi : []);
      } catch (error) {
        console.error("Gagal memuat data panen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Kriteria Siap Panen: Status == 'Panen' ATAU (Status Aktif dan Tanggal Rencana Panen sudah lewat/hari ini)
  const isSiapPanen = (p) => {
    if (p.Status === "Panen") return true;
    if (p.Status === "Aktif") {
      const rp = new Date(p.RencanaPanen);
      rp.setHours(0, 0, 0, 0);
      return rp <= today;
    }
    return false;
  };

  // Kriteria Sudah Panen: Status == 'Selesai'
  const isSudahPanen = (p) => p.Status === "Selesai";

  const siapPanenList = penanamans.filter(isSiapPanen);
  const sudahPanenList = penanamans.filter(isSudahPanen);

  const filteredSiapPanen = siapPanenList.filter((item) => {
    const kw = searchQuery.toLowerCase();
    const namaTanaman = item.NamaTanaman || "";
    const namaLahan = item.NamaLahan || "";
    return (
      namaTanaman.toLowerCase().includes(kw) ||
      namaLahan.toLowerCase().includes(kw)
    );
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

  const historyData = produksis.map(prod => {
    const p = penanamans.find(pen => Number(pen.PenanamanId) === Number(prod.PenanamanId));
    return {
      ...prod,
      NamaTanaman: p?.NamaTanaman || "Tanaman Tidak Ditemukan",
      NamaLahan: p?.NamaLahan || "Lahan Tidak Ditemukan"
    };
  }).filter(item => {
    const kw = historySearchQuery.toLowerCase();
    return (
      (item.NamaTanaman || "").toLowerCase().includes(kw) ||
      (item.NamaLahan || "").toLowerCase().includes(kw)
    );
  }).sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal));

  return (
    <div className="p-1 md:p-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bg-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-dark flex items-center gap-2">
            <Wheat className="text-amber-500" size={32} />
            Manajemen Panen
          </h1>
          <p className="text-text-muted mt-1 text-sm md:text-base">
            Kelola penanaman yang siap panen dan pantau riwayat panen Anda.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-card p-5 rounded-xl flex items-center gap-5 border-l-4 border-l-amber-500">
          <div className="p-3.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-lg">
            <Sprout size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Siap Panen</p>
            <h3 className="text-3xl font-bold mt-1 text-text-dark">
              {loading ? "-" : siapPanenList.length}
            </h3>
          </div>
        </div>
        <div className="card bg-card p-5 rounded-xl flex items-center gap-5 border-l-4 border-l-emerald-500">
          <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-semibold uppercase tracking-wider">Sudah Dipanen</p>
            <h3 className="text-3xl font-bold mt-1 text-text-dark">
              {loading ? "-" : sudahPanenList.length}
            </h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-amber-500" size={32} />
          <p className="text-text-muted font-medium">Memuat data panen...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: List Siap Panen */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-0 overflow-hidden flex flex-col h-[600px] border border-bg-200">
              <div className="p-4 border-b border-bg-200 bg-bg-50">
                <h3 className="font-bold text-text-dark flex items-center gap-2 mb-3">
                  <Wheat size={18} className="text-amber-500"/>
                  Daftar Siap Panen
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-xs transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="Cari tanaman atau lahan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredSiapPanen.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-text-muted">Tidak ada penanaman yang siap panen saat ini.</p>
                  </div>
                ) : (
                  filteredSiapPanen.map((item) => (
                    <div
                      key={item.PenanamanId}
                      onClick={() => setSelectedPenanaman(item)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedPenanaman?.PenanamanId === item.PenanamanId
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-sm"
                          : "border-bg-200 bg-card hover:border-amber-300 hover:bg-amber-50/10"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-text-dark text-sm">{item.NamaLahan}</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          SIAP PANEN
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                        <Leaf size={12} />
                        <span>{item.NamaTanaman}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                        <Calendar size={12} />
                        <span>Rencana: {formatTanggal(item.RencanaPanen)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Detail Panen */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedPenanaman ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card p-6 border border-bg-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">SIAP PANEN</span>
                      </div>
                      <h2 className="text-2xl font-bold text-text-dark">{selectedPenanaman.NamaTanaman}</h2>
                      <p className="text-sm text-text-muted mt-1 flex items-center gap-1">
                        <MapPin size={14} /> Lokasi: {selectedPenanaman.NamaLahan}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-bg-50 rounded-xl border border-bg-200">
                      <p className="text-xs text-text-muted font-semibold mb-1">Fase Saat Ini</p>
                      <p className="text-sm font-bold text-text-dark">{selectedPenanaman.Fase || "-"}</p>
                    </div>
                    <div className="p-4 bg-bg-50 rounded-xl border border-bg-200">
                      <p className="text-xs text-text-muted font-semibold mb-1">Jumlah Bibit</p>
                      <p className="text-sm font-bold text-text-dark flex items-center gap-1">
                        {selectedPenanaman.JumlahBibit}
                      </p>
                    </div>
                    <div className="p-4 bg-bg-50 rounded-xl border border-bg-200">
                      <p className="text-xs text-text-muted font-semibold mb-1">Tanggal Tanam</p>
                      <p className="text-sm font-bold text-text-dark">{formatTanggal(selectedPenanaman.TanggalTanam)}</p>
                    </div>
                    <div className="p-4 bg-bg-50 rounded-xl border border-bg-200">
                      <p className="text-xs text-text-muted font-semibold mb-1">Rencana Panen</p>
                      <p className="text-sm font-bold text-amber-600">{formatTanggal(selectedPenanaman.RencanaPanen)}</p>
                    </div>
                  </div>

                  <div className="border-t border-bg-200 pt-6">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedPenanaman(null)}
                        className="px-5 py-2.5 text-sm font-semibold text-text-muted hover:text-text-dark transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => {
                          setProduksiForm({
                            Tanggal: new Date().toISOString().split('T')[0],
                            JumlahBuah: "",
                            TotalPanen: ""
                          });
                          setIsModalOpen(true);
                        }}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Wheat size={16} />
                        Proses Panen Sekarang
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-12 flex flex-col items-center justify-center text-center border border-bg-200 min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-bg-100 rounded-full flex items-center justify-center mb-4">
                    <Sprout size={32} className="text-text-muted" />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-1">Belum Ada Penanaman Dipilih</h3>
                  <p className="text-sm text-text-muted max-w-sm">
                    Silakan pilih penanaman yang siap panen dari daftar di sebelah kiri untuk melihat detail dan memproses panen.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="card border border-bg-200 p-0 overflow-hidden mt-8">
        <div className="p-4 border-b border-bg-200 bg-bg-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-text-dark flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500"/>
            Riwayat Panen
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-xs transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Cari dari riwayat..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-50 border-b border-bg-200 text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal Panen</th>
                <th className="px-4 py-3 font-semibold">Tanaman</th>
                <th className="px-4 py-3 font-semibold">Lahan</th>
                <th className="px-4 py-3 font-semibold text-right">Jml Buah</th>
                <th className="px-4 py-3 font-semibold text-right">Total (Kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-200">
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted">
                    Tidak ada riwayat panen ditemukan.
                  </td>
                </tr>
              ) : (
                historyData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-bg-50/50 transition-colors">
                    <td className="px-4 py-3 text-text-dark">{formatTanggal(item.Tanggal)}</td>
                    <td className="px-4 py-3 font-semibold text-text-dark">{item.NamaTanaman}</td>
                    <td className="px-4 py-3 text-text-muted">{item.NamaLahan}</td>
                    <td className="px-4 py-3 text-right text-text-dark">{item.JumlahBuah}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.TotalPanen}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {isModalOpen && selectedPenanaman && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-bg-200"
            >
              <div className="p-4 border-b border-bg-200 bg-bg-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-dark flex items-center gap-2">
                  <Wheat className="text-amber-500" size={20} />
                  Input Data Produksi
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-text-dark transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form 
                className="p-5 space-y-4" 
                onSubmit={handleProduksiSubmit}
              >
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 mb-4">
                   <p className="text-xs text-amber-700/80 font-semibold mb-1">Tanaman: <span className="text-amber-800 dark:text-amber-300">{selectedPenanaman.NamaTanaman}</span></p>
                   <p className="text-xs text-amber-700/80 font-semibold">Lahan: <span className="text-amber-800 dark:text-amber-300">{selectedPenanaman.NamaLahan}</span></p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Tanggal Panen</label>
                  <input
                    type="date"
                    name="Tanggal"
                    value={produksiForm.Tanggal}
                    onChange={handleProduksiChange}
                    className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Jumlah Buah</label>
                  <input
                    type="number"
                    name="JumlahBuah"
                    value={produksiForm.JumlahBuah}
                    onChange={handleProduksiChange}
                    min="1"
                    placeholder="Contoh: 150"
                    className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">Total Panen (Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="TotalPanen"
                    value={produksiForm.TotalPanen}
                    onChange={handleProduksiChange}
                    min="0.1"
                    placeholder="Contoh: 45.5"
                    className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    required
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text-dark transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
                  >
                    Kirim & Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}