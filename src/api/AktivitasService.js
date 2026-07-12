const API_ACTIVITY = 'http://localhost:8080/aktivitas';


export const GetAktivitas = async () => {
    const response = await fetch(API_ACTIVITY);
    const data = await response.json();
    return data;
}