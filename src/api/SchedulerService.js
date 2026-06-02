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