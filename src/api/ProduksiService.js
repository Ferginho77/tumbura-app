// const API_PRODUKSI = 'http://localhost:8080/produksi';
const API_PRODUKSI = 'https://be-project-nu.vercel.app/produksi';

export const getProduksi = async () => {
    try {
        const response = await fetch(API_PRODUKSI);
        if (!response.ok) {
            throw new Error('Gagal mengambil data produksi');
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching produksi:", error);
        throw error;
    }
}

export const CreateProduksi = async (produksi) => {
    const payload = {
        ...produksi,
        TotalPanen: parseFloat(produksi.TotalPanen),
        JumlahBuah: parseInt(produksi.JumlahBuah, 10),
        PenanamanId: parseInt(produksi.PenanamanId, 10)
    };

    const response = await fetch(API_PRODUKSI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal membuat data produksi");
    }
    return response.json();
}
