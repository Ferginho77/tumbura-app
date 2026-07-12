// const API_Inventaris = 'http://localhost:8080/inventaris';
 const API_Inventaris = 'https://be-project-nu.vercel.app/inventaris';


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

export const CreateInventaris = async (inventaris) => {
     const payload = {
      ...inventaris,
      Stok: parseInt(inventaris.Stok, 10)
    };
    
    console.log("DATA KE BACKEND:", payload);

    const response = await fetch(API_Inventaris, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal membuat data inventaris");
    }
    return response.json();
}   

export const UpdateInventaris = async (
  InventarisId,
  inventarisData
) => {

    const payload = {
      ...inventarisData,
      Stok: parseInt(inventarisData.Stok, 10)
    };
    console.log("DATA KE BACKEND:", payload);
   const res = await fetch(`${API_Inventaris}/${InventarisId}/update`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Gagal memperbarui data inventaris");
  }
  return res.json();
}