// const API_URL = 'https://tumbura-be-691717727272.asia-southeast2.run.app/schedulers';
const API_URL = 'http://localhost:8080/schedulers';


export const getSchedulers = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
}

export const UpdateStatus = async (SchedulerId, newStatus) => {
    const res = await fetch(`${API_URL}/${SchedulerId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    return data;
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