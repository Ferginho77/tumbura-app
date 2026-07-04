import axios from "axios";

// const API_PENANAMAN = 'http://localhost:8080/penanamans';
// const API_LAHAN = 'http://localhost:8080/lahans';
// const API_TANAMAN = 'http://localhost:8080/tanamans';

const API_PENANAMAN = 'https://be-project-nu.vercel.app/penanamans';
const API_LAHAN = 'https://be-project-nu.vercel.app/lahans';
const API_TANAMAN = 'https://be-project-nu.vercel.app/tanamans';


export const getPenanaman = async () => {
   try{
    // 1. Ambil data penanaman dan data lahan secara paralel (bersamaan) agar cepat
    const [resPenanaman, resLahan, resTanaman] = await Promise.all([
      axios.get(`${API_PENANAMAN}`),
      axios.get(`${API_LAHAN}`),
      axios.get(`${API_TANAMAN}`)
    ]);

    const dataPenanaman = resPenanaman.data;
    const dataLahan = resLahan.data;
    const dataTanaman = resTanaman.data;

    // 2. Lakukan "JOIN" / Mapping data di sini sebelum dikirim ke halaman
    const hasilTransformasi = dataPenanaman.map((penanaman) => {
      // Cari data lahan yang ID-nya cocok
      const lahanCocok = dataLahan.find(lahan => lahan.LahanId === penanaman.LahanId);

      // Cari data tanaman yang ID-nya cocok
      const tanamanCocok = dataTanaman.find(tanaman => tanaman.TanamanId === penanaman.TanamanId);

      // Kembalikan object penanaman baru yang sudah ditambahkan atribut NamaLahan dan NamaTanaman
      return {
        ...penanaman,
        NamaLahan: lahanCocok ? lahanCocok.NamaLahan : 'Lahan Tidak Ditemukan',
        NamaTanaman: tanamanCocok ? tanamanCocok.NamaTanaman : 'Tanaman Tidak Ditemukan'
      };
    });

    // 3. Kembalikan data yang sudah matang
    return hasilTransformasi;
   } catch (error) {
    console.error("Error fetching penanamans:", error);
    throw error;
   }
}

export const DeletePenanaman = async (PenanamanId) => {
    const response = await fetch(`${API_PENANAMAN}/${PenanamanId}`, {
        method: 'DELETE',
    });
    return response.ok;
}

export const CreatePenanaman = async (penanaman) => {
    const payload = {
        ...penanaman,
        JumlahBibit: parseInt(penanaman.JumlahBibit, 10),
        TanamanId: parseInt(penanaman.TanamanId, 10),
        LahanId: parseInt(penanaman.LahanId, 10)
    };

    console.log("DATA PENANAMAN KE BACKEND:", payload);

    const response = await fetch(API_PENANAMAN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal membuat data penanaman");
    }
    return response.json();
}

export const UpdatePenanaman = async (PenanamanId, penanaman) => {
    const payload = {
        ...penanaman,
        JumlahBibit: parseInt(penanaman.JumlahBibit, 10),
        TanamanId: parseInt(penanaman.TanamanId, 10),
        LahanId: parseInt(penanaman.LahanId, 10),
    };

    const response = await fetch(`${API_PENANAMAN}/${PenanamanId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal update data penanaman");
    }
    return response.json();
}