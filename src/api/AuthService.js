// src/api/AuthService.js

const API_URL = 'http://localhost:8080/login';
// const API_URL = 'https://be-project-nu.vercel.app/login';

const login = async (username, password) => {
  const response = await fetch(`${API_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  // Jika response tidak ok (misal: 401 Unauthorized), lempar error agar ditangkap oleh komponen
  if (!response.ok) {
    throw new Error(data.message || 'Gagal login, periksa kembali kredensial Anda.');
  }

  // Jika berhasil, simpan token ke localStorage langsung dari service ini
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};

const logout = () => {
  localStorage.removeItem('token');
};

const getToken = () => {
  return localStorage.getItem('token');
};

// Ekspor semua fungsi sebagai satu objek
const AuthService = {
  login,
  logout,
  getToken,
};

export default AuthService;