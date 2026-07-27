// const API_ACTIVITY = 'http://localhost:8080/aktivitas';
const API_ACTIVITY = 'https://be-project-nu.vercel.app/aktivitas';
// nambah tanaman buat di activity log
// const API_TANAMAN = 'http://localhost:8080/tanaman'; 
const API_TANAMAN = 'https://be-project-nu.vercel.app/tanaman';

export const GetAktivitas = async () => {
    const response = await fetch(API_ACTIVITY);
    if (!response.ok) throw new Error('Gagal mengambil data aktivitas');
    const data = await response.json();
    return data;
}

// Buat record aktivitas baru ke database
export const CreateAktivitas = async (aktivitasData) => {
    const response = await fetch(API_ACTIVITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aktivitasData),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Gagal mencatat aktivitas');
    }
    return await response.json();
}

// ini fungsinya
export const GetTanaman = async () => {
    const response = await fetch(API_TANAMAN);
    const data = await response.json();
    return data;
}
