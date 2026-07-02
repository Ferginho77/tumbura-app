import { useEffect, useState, useRef } from "react";
import { getInventaris, DeleteInventaris, CreateInventaris, UpdateInventaris } from "../api/InventarisService";
import {
  Trash2,
  Pencil,
  Inbox,
  RefreshCw,
} from "lucide-react";

export default function Inventory() {
  const [inventaris, setInventaris] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInventarisId, setCurrentInventarisId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    NamaBarang: '',
    Jenis: 'Benih',
    Stok: ''
  });

  const fetchInventaris = async () => {
    try {
      setLoading(true);
      const data = await getInventaris();
      console.log("Inventaris:", data);
      setInventaris(data);
    } catch (error) {
      console.error("Error fetching inventaris:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleSubmitInventaris = async (e) => {
  e.preventDefault();
  try {
    if (currentInventarisId) {
      // Logic Update
      const updatedInventaris = await UpdateInventaris(currentInventarisId, formData);
      setInventaris((current) =>
        current.map((item) =>
          item.InventarisId === currentInventarisId ? updatedInventaris : item
        )
      );
    } else {
      // Logic Create
      const newInventaris = await CreateInventaris(formData);
      setInventaris((current) => [...current, newInventaris]);
    }
    
    setModalVisible(false);
  } catch (error) {
    console.error("Error saving inventaris:", error);
  }
};

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchInventaris();
  }, []);

  const handleDeleteInventaris = async (InventarisId) => {
    try {
      console.log("InventarisId:", InventarisId);

      const success = await DeleteInventaris(InventarisId);

      if (success) {
        setInventaris((current) =>
          current.filter((inventaris) => inventaris.InventarisId !== InventarisId)
        );
      }
    } catch (error) {
      console.error("Error deleting inventaris:", error);
    
    }
  };

  const handleEditInventaris = (inventaris) => {
    setCurrentInventarisId(inventaris.InventarisId);
    setFormData({
      NamaBarang: inventaris.NamaBarang,
      Jenis: inventaris.Jenis,
      Stok: inventaris.Stok
    });
    setIsEditing(true);
    setModalVisible(true);
  };

 return (
  // show loading state while fetching
  loading ? (
    <div className="card p-12 text-center flex flex-col items-center justify-center gap-3">
      <RefreshCw className="animate-spin text-primary-500" size={32} />
      <p className="text-text-muted font-medium">Memuat data inventaris...</p>
    </div>
  ) : (
   <div className="inventory animate-fade-in">
     <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
        <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-1">
          <div className="card flex items-center gap-4 p-4 rounded shadow-sm border border-bg-200">
            <Inbox size={24} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Total Items</h3>
              <p className="text-2xl font-bold">{inventaris.length}</p>
            </div>
          </div>       
                  
        </div>
        <div className="card">
          <button
            className="btn-primary bg-green-500 text-white px-4 py-2 rounded"
            onClick={toggleModal}
          >
            Tambah Barang
          </button>
            <table className="min-w-full text-left mt-4">
              <thead>
                <tr className="border-b bg-green-600 text-white">
                  <th className="px-4 py-3">Nama Barang</th>
                  <th className="px-4 py-3">Jenis Barang</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventaris.map((item) => (
                  <tr key={item.InventarisId} className="border-b">
                    <td className="px-4 py-3">{item.NamaBarang}</td>
                    <td className="px-4 py-3">{item.Jenis}</td>
                    <td className="px-4 py-3">{item.Stok}</td>
                    <td className="px-4 py-3 m-5">
                      <button className="btn-primary bg-blue-500 text-green px-2 py-1 rounded" onClick={() => handleEditInventaris(item)}>
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-primary bg-red-500 text-green px-2 py-1 rounded ml-2"
                        onClick={() => {
                          if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
                            handleDeleteInventaris(item.InventarisId);
                          }
                        }}
                      >
                       <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        {isModalVisible && (
          <div className="modal-fade" id="TambahBarang" aria-hidden="true">
            <div className="modal-content">
              <div className="card max-w-2xl p-6 mt-4">
                   <h3>Tambah Barang</h3>
              <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmitInventaris}>
                <div className="form-group">
                  <label htmlFor="namaBarang">Nama Barang</label>
                  <input type="text" id="namaBarang" name="NamaBarang" className="input-field m-2" value={formData.NamaBarang} onChange={(e) => setFormData({...formData, NamaBarang: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="Jenis">Jenis Barang</label>
                  <select name="Jenis" id="Jenis" className="input-field m-2" value={formData.Jenis} onChange={(e) => setFormData({...formData, Jenis: e.target.value})}>
                    <option value="Benih">Benih</option>
                    <option value="Pupuk">Pupuk</option>
                    <option value="Obat">Obat</option>
                    <option value="Alat-alat">Alat-alat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="stok">Stok</label>
                  <input type="number" name="Stok" className="input-field m-2" value={formData.Stok} onChange={(e) => setFormData({...formData, Stok: e.target.value})}/>
                </div>
                <button
                  type="submit"
                  className="btn-primary bg-green-500 text-white px-4 py-2 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  className="btn-secondary bg-gray-500 text-white px-4 py-2 rounded ml-2"
                  onClick={toggleModal}
                >
                  Tutup
                </button>
              </form>
              </div>
            </div>
          </div>
        )}
   </div>
  )
 );
}

function Card({ title, value, icon }) {
  return (
    <div className=" p-4 rounded shadow-sm flex items-center gap-4 border border-bg-200">
      
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-primary text-xl" />
      )}

      <div>
        <h3 className="text-muted text-sm">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
      
    </div>
  );
}