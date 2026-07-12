import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Scheduler from './components/Scheduler';
import FieldControl from './components/FieldControl';
import Login from './components/Login';
import Harvest from './components/Harvest';

function ProtectedRoute() {
  // 1. Sesuaikan nama key dengan yang disimpan oleh AuthService (yaitu 'token')
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Route Publik */}
      <Route path="/login" element={<Login />} />
      
      {/* Route Terproteksi (Harus Login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* 2. Jika user mengakses root (/) langsung arahkan ke /dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 3. Daftarkan path dashboard agar navigate('/dashboard') di Login.jsx berhasil */}
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="scheduler" element={<Scheduler />} />
          <Route path="fields" element={<FieldControl />} />
          <Route path="harvest" element={<Harvest />} />
          
          {/* 4. Jika user mengetik URL ngawur, kembalikan ke dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      
      {/* Jika belum login dan mengetik URL ngawur, kembalikan ke login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;