//  const API_TANAMAN = 'http://localhost:8080/tanamans';
const API_TANAMAN = 'https://be-project-nu.vercel.app/tanamans';

export const GetTanamans = async () => {
    const response = await fetch(API_TANAMAN);
    const data = await response.json();
    return data;
}

export const CreateTanaman = async (tanaman) => {
    const response = await fetch(API_TANAMAN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...tanaman,
            UmurPanen: Number(tanaman.UmurPanen || 0),
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal membuat tanaman');
    }

    return response.json();
}

export const DeleteTanaman = async (TanamanId) => {
   const response = await fetch(`${API_TANAMAN}/${TanamanId}`, {
        method: 'DELETE',
    });
    return response.ok;      
    }

export const EditTanaman = async (TanamanId, tanaman) => {
    console.log("DATA KE BACKEND (PUT):", {
        ...tanaman,
        UmurPanen: parseInt(tanaman.UmurPanen, 10),
    });
    
    const response = await fetch(`${API_TANAMAN}/${TanamanId}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...tanaman,
            UmurPanen: parseInt(tanaman.UmurPanen, 10),
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal mengedit tanaman');
    }
    return response.json();
}