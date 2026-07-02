const API_URL = 'https://tumbura-be-691717727272.asia-southeast2.run.app/schedulers';
// const API_URL = '    ';


export const getSchedulers = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
}

export const UpdateStatus = async (SchedulerId, Status) => {
    const res = await fetch(`${API_URL}/${SchedulerId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Status: Status
        })
    });

    return await res.json();
}

export const DeleteScheduler = async (SchedulerId) => {
    const response = await fetch(`${API_URL}/${SchedulerId}`, {
        method: 'DELETE',
    });
    return response.ok;
}

export const CreateScheduler = async (scheduler) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify(scheduler),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Gagal membuat data scheduler");
    }
    return response.json();
}   

export const UpdateScheduler = async (
  SchedulerId,
  schedulerData
) => {

  const payload = {
    ...schedulerData,
    Tanggal: schedulerData.Tanggal
      ? schedulerData.Tanggal.split("T")[0]
      : ""
  };

  console.log("DATA KE BACKEND:", payload);

  const res = await fetch(
    `${API_URL}/${SchedulerId}/update`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  return await res.json();
};
