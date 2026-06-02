const API_TANAMAN = 'http://localhost:8080/tanamans';

export const GetTanamans = async () => {
    const response = await fetch(API_TANAMAN);
    const data = await response.json();
    return data;
}
