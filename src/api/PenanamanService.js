import axios from "axios";

// const API_PENANAMAN = 'http://localhost:8080/penanamans';
// const API_LAHAN = 'http://localhost:8080/lahans';
// const API_TANAMAN = 'http://localhost:8080/tanamans';

const API_PENANAMAN = 'https://be-project-nu.vercel.app/penanamans';
const API_LAHAN = 'https://be-project-nu.vercel.app/lahans';
const API_TANAMAN = 'https://be-project-nu.vercel.app/tanamans';


export const getPenanaman = async () => {
   try{
    const [resPenanaman, resLahan, resTanaman] = await Promise.all([
      axios.get(`${API_PENANAMAN}`),
      axios.get(`${API_LAHAN}`),
      axios.get(`${API_TANAMAN}`)
    ]);

    const dataPenanaman = Array.isArray(resPenanaman.data) ? resPenanaman.data : [];
    const dataLahan = Array.isArray(resLahan.data) ? resLahan.data : [];
    const dataTanaman = Array.isArray(resTanaman.data) ? resTanaman.data : [];

    const normalizeId = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    const hasilTransformasi = dataPenanaman.map((penanaman) => {
      const lahanCocok = dataLahan.find((lahan) => normalizeId(lahan.LahanId) === normalizeId(penanaman.LahanId));
      const tanamanCocok = dataTanaman.find((tanaman) => normalizeId(tanaman.TanamanId) === normalizeId(penanaman.TanamanId));

      return {
        ...penanaman,
        NamaLahan: lahanCocok?.NamaLahan || penanaman.NamaLahan || 'Lahan Tidak Ditemukan',
        NamaTanaman: tanamanCocok?.NamaTanaman || penanaman.NamaTanaman || 'Tanaman Tidak Ditemukan'
      };
    });

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