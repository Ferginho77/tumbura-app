// const API_TANAMAN = 'https://tumbura-be-691717727272.asia-southeast2.run.app/tanamans';
const API_TANAMAN = 'http://localhost:8080/tanamans';

export const GetTanamans = async () => {
    const response = await fetch(API_TANAMAN);
    const data = await response.json();
    return data;
}
