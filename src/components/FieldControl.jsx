import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLahan, CreateLahan, UpdateLahan } from "../api/LahanService";
import { Layers, Search, Compass, Plus, RefreshCw } from "lucide-react";
 
export default function FieldControl() {
  const [lahan, setLahans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLahanId, setCurrentLahanId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("lahan");
  const [currentPenanamanLahanId, setCurrentPenanamanLahanId] = useState(null);
  const [formData, setFormData] = useState({
    NamaLahan: "",
    LuasTanah: "",
    Kondisi: "Baik",
  });
  const [penanamanFormData, setPenanamanFormData] = useState({
    NamaTanaman: "",
    LahanId: "",
    Status: "Pending",
  });

  useEffect(() => {
    const fetchLahans = async () => {
      try {
        const data = await getLahan();
        setLahans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal memuat data lahan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLahans();
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
    setFormData({ NamaLahan: "", LuasTanah: "", Kondisi: "Baik" });
    setIsModalOpen(true);
  };

  const openPenanamanModal = (lahanId) => {
    setModalType("penanaman");
    setIsModalOpen(true);
    setCurrentLahanId(null);
    setCurrentPenanamanLahanId(lahanId);
    setPenanamanFormData({ NamaTanaman: "", LahanId: lahanId ? String(lahanId) : "", Status: "Pending" });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLahanId(null);
    setCurrentPenanamanLahanId(null);
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

  const handleSubmitPenanaman = async (e) => {
    e.preventDefault();
    console.log("Tambah Penanaman:", penanamanFormData);
    closeModal();
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

    return (
      <div
        key={item.LahanId}
        className="card relative overflow-hidden border border-bg-200 bg-card hover:border-primary-300 transition-all duration-200"
      >
        {/* Header Line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500" />

        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${kondisiClass}`}
              >
                {item.Kondisi}
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
                  Luas Lahan
                </span>

                <span className="text-primary-600">
                  {item.LuasTanah} m²
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="mt-5 flex gap-2">

            <button
              type="button"
              onClick={() => openPenanamanModal(item.LahanId)}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold transition"
            >
              + Tambah Penanaman
            </button>

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
                      <select name="TanamanId" id="" className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
                        <option value="Anggur">Anggur</option>
                        <option value="Semangka">Semangka</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Tanggal Tanam
                      </label>
                     <input type="date" className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100" name="TanggalTanam" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Rencana Panen
                      </label>
                     <input type="date" className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100" name="TanggalPanen" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        Jumlah Bibit
                      </label>
                     <input type="number" className="w-full p-2.5 bg-input text-text-dark border border-bg-200 rounded-lg outline-none text-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100" name="JumlahBibit" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                        LahanId
                      </label>
                      <input
                        type="number"
                        name="LahanId"
                        value={penanamanFormData.LahanId}
                        onChange={handlePenanamanChange}
                        placeholder="Masukkan LahanId"
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
