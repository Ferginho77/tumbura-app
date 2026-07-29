// src/api/AuthService.js

const BASE_URL = 'https://be-project-nu.vercel.app';
//  const BASE_URL = 'http://localhost:8080';

const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
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
    if (data.username) localStorage.setItem('username', data.username);
  }

  return data;
};

const register = async (username, password) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Registrasi gagal, coba lagi.');
  }

  // Auto-login: simpan token setelah berhasil register
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.username) localStorage.setItem('username', data.username);
  }

  return data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
};

const getToken = () => {
  return localStorage.getItem('token');
};

// Ekspor semua fungsi sebagai satu objek
const AuthService = {
  login,
  register,
  logout,
  getToken,
};

export default AuthService;
