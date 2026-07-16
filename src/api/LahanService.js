// const API_LAHAN = 'http://localhost:8080/lahans';
const API_LAHAN = 'https://be-project-nu.vercel.app/lahans';

export const getLahan = async () => {
    const response = await fetch(API_LAHAN);
    const data = await respose.json();
    return data;
}

export const CreateLahan = async (lahan) => {
    const payload = {
        ...lahan,
        // LuasTanah: parseInt(lahan.LuasTanah, 10)
        // diubah jadi parseFloat soalnya biar mendukung dengan yang ada di golangnya, karena yang di definisikan di golangnya pake float64
        LuasTanah: parseFloat(lahan.LuasTanah, 10)
    };

    console.log("DATA KE BACKEND:", payload);

     const response = await fetch(API_LAHAN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal membuat data lahan");
    }
    return response.json();
}

export const UpdateLahan = async (LahanId, LahanData) => {
  const payload = {
    ...LahanData,
    // LuasTanah: parseInt(LahanData.LuasTanah, 10),
    // Sama kaya yang di atas
    LuasTanah: parseFloat(LahanData.LuasTanah, 10),
  };
  console.log("DATA KE BACKEND:", payload);

  const res = await fetch(`${API_LAHAN}/${LahanId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Gagal memperbarui data lahan");
  }

  return res.json();
};