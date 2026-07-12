import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../api/AuthService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Gagal login, periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />

      <div className="login-banner">
        <div className="banner-logo">
          <img src="/icon.png" alt="TumburaApp Logo" className="w-8 h-8 mr-2" />
          <span>TumburaApp</span>
        </div>

        <div className="banner-content">
          <h1 className="banner-title">
            Smart Agriculture,<br />Precision Farming.
          </h1>
          <p className="banner-desc">
            Optimalkan pertumbuhanbuah dengan sistem monitoring terotomatisasi, serta rekomendasi nutrisi.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium">Pemantauan Nutrisi & Parameter Real-time</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium">Task Scheduler & Pengingat Penyiraman</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium">Sistem Inventaris Stok Terintegrasi</span>
            </div>
          </div>
        </div>

        <div className="banner-footer">
          <span>TumburaApp © 2026.</span>
        </div>
      </div>

      <div className="login-form-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-header">
            <h2 className="form-title">Selamat Datang Kembali</h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="alert-box alert-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="input-group">
              <label className="input-label">Nama Pengguna</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Masukkan username Anda"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                <Mail className="input-icon" size={18} />
              </div>
            </div>

            <div className="input-group">
              <div className="flex justify-between items-center mb-1">
                <label className="input-label mb-0">Kata Sandi</label>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Lock className="input-icon" size={18} />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
