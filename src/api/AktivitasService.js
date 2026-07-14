const API_ACTIVITY = 'http://localhost:8080/aktivitas';
// nambah tanaman buat di activity log
const API_TANAMAN = 'http://localhost:8080/tanaman'; 

export const GetAktivitas = async () => {
    const response = await fetch(API_ACTIVITY);
    const data = await response.json();
    return data;
}

// ini fungsinya
export const GetTanaman = async () => {
    const response = await fetch(API_TANAMAN);
    const data = await response.json();
    return data;
}