import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Pencil,
} from "lucide-react";
import { getSchedulers, UpdateStatus, DeleteScheduler, CreateScheduler } from "../api/SchedulerService";


export default function Scheduler() {
  const [schedulers, setSchedulers] = useState([]);

   const [formData, setFormData] = useState({
    NamaScheduler: '',
    Tanggal: '',
    Status: 'Pending'
  });

  const fetchSchedulers = async () => {
  try {
    const data = await getSchedulers();
    console.log("Schedulers:", data);
    setSchedulers(data);
  } catch (error) {
    console.error("Error fetching schedulers:", error);
  }
};

// 2. Jalankan fetchSchedulers saat pertama kali komponen di-mount
useEffect(() => {
  fetchSchedulers();
}, []);
  

  const handleDeleteScheduler = async (SchedulerId) => {
    try {
      console.log("SchedulerId:", SchedulerId);

      const success = await DeleteScheduler(SchedulerId);

      if (success) {
        setSchedulers((current) =>
          current.filter((scheduler) => scheduler.SchedulerId !== SchedulerId)
        );
      }
    } catch (error) {
      console.error("Error deleting scheduler:", error);
    
    }

  };

  const handleCreateScheduler = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData
    };
    const result = await CreateScheduler(payload);
    if (result) {
      setFormData({
        NamaScheduler: '',
        Tanggal: '',
        Status: 'Pending'
      });
      
      // ✅ Sekarang ini tidak akan error lagi dan auto-refresh akan bekerja!
      fetchSchedulers(); 
    }
  } catch (error) {
    console.error("Error creating schedulers :", error);
  }
};

  return (
    <div className="scheduler animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar />
          Maintenance Scheduler
        </h2>
        <p className="text-muted">
          Local task manager for daily greenhouse operations
        </p>
      </div>

      {/* Card */}
      <div className="card max-w-4xl p-6 rounded-2xl shadow-lg">
        {/* Form */}
        <form className="flex gap-2 mb-6" onSubmit={handleCreateScheduler}>
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Add new maintenance task..."
            value={formData.NamaScheduler}
            onChange={(e) => setFormData({ ...formData, NamaScheduler: e.target.value })}
          />
          <input
            type="date"
            className="input-field"
            value={formData.Tanggal}
          onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
          />
          <input
            type="hidden"
            value={formData.Status}
          onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
          />
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={18} />
            Add
          </button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm font-semibold">
                <th className="py-3">Task</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {schedulers.map((scheduler) => (
                  <motion.tr
                    key={scheduler.SchedulerId}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="border-b"
                  > 
                    {/* Task */}
                    <td className="py-4 font-medium">
                      {scheduler.NamaScheduler}
                    </td>

                    {/* Date */}
                    <td className="py-4 text-sm text-gray-500">
                      {new Date(scheduler.Tanggal).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <button
                        className="flex items-center gap-2"
                      >
                        {scheduler.Status === "Done" ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} className="text-gray-400" />
                        )}
                          <Circle size={20} className="text-gray-400" />

                        <span className="text-sm">
                         
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-3">
                        {/* Edit */}
                        <button
                         
                          className="text-blue-500 hover:scale-110 transition"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* Delete */}
                        <button
                          className="text-red-500 hover:scale-110 transition"
                          onClick={() => {
                            if (confirm("Apakah Anda Yakin Menghapus Task Ini?")) {
                              handleDeleteScheduler(scheduler.SchedulerId);
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Empty state */}
            <div className="text-center py-10 text-gray-400">
              No maintenance schedule yet
            </div>
        </div>
      </div>
    </div>
  );
}