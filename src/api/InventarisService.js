const API_Inventaris = 'http://localhost:8080/inventaris';

export const getInventaris = async () => {
    const respose = await fetch(API_Inventaris);
    const data = await respose.json();
    return data;
}

export const DeleteInventaris = async (InventarisId) => {
    const response = await fetch(`${API_Inventaris}/${InventarisId}`, {
        method: 'DELETE',
    });
    return response.ok;
}