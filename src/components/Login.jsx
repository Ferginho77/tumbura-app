import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../api/AuthService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, User, CheckCircle } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  // --- State Tab ---
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // --- State Login ---
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- State Register ---
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // --- State Shared ---
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await AuthService.login(loginUsername, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Gagal login, periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validasi sisi klien
    if (regUsername.trim().length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.register(regUsername.trim(), regPassword);
      setSuccessMsg(data.message || 'Registrasi berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message || 'Registrasi gagal, coba lagi.');
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
            Optimalkan pertumbuhan buah dengan sistem monitoring terotomatisasi, serta rekomendasi nutrisi.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium">Pemantauan Nutrisi &amp; Parameter Real-time</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-medium">Task Scheduler &amp; Pengingat Penyiraman</span>
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
          {/* ── Tab Switcher ── */}
          <div className="auth-tabs">
            <button
              id="tab-login"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
              type="button"
            >
              Masuk
            </button>
            <button
              id="tab-register"
              className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
              type="button"
            >
              Daftar
            </button>
            <div className={`auth-tab-indicator ${activeTab === 'register' ? 'right' : ''}`} />
          </div>

          {/* ── Alert Messages ── */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="alert-box alert-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                key="error"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                className="alert-box alert-success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                key="success"
              >
                <CheckCircle size={18} className="shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form Content ── */}
          <AnimatePresence mode="wait">

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="form-header">
                  <h2 className="form-title">Selamat Datang Kembali</h2>
                  <p className="form-subtitle">Masukkan kredensial Anda untuk melanjutkan.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="input-group">
                    <label className="input-label" htmlFor="login-username">Nama Pengguna</label>
                    <div className="input-wrapper">
                      <input
                        id="login-username"
                        type="text"
                        placeholder="Masukkan username Anda"
                        className="login-input"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        disabled={loading}
                        autoComplete="username"
                      />
                      <User className="input-icon" size={18} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="login-password">Kata Sandi</label>
                    <div className="input-wrapper">
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="login-input"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <Lock className="input-icon" size={18} />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button id="btn-login" type="submit" className="login-btn" disabled={loading}>
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

                <p className="auth-switch-hint">
                  Belum punya akun?{' '}
                  <button type="button" className="auth-switch-link" onClick={() => switchTab('register')}>
                    Daftar sekarang
                  </button>
                </p>
              </motion.div>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="form-header">
                  <h2 className="form-title">Buat Akun Baru</h2>
                  <p className="form-subtitle">Isi data di bawah untuk memulai menggunakan TumburaApp.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="input-group">
                    <label className="input-label" htmlFor="reg-username">Nama Pengguna</label>
                    <div className="input-wrapper">
                      <input
                        id="reg-username"
                        type="text"
                        placeholder="Minimal 3 karakter"
                        className="login-input"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        disabled={loading}
                        autoComplete="username"
                      />
                      <User className="input-icon" size={18} />
                    </div>
                  </div>


                  <div className="input-group">
                    <label className="input-label" htmlFor="reg-password">Kata Sandi</label>
                    <div className="input-wrapper">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        className="login-input"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                      />
                      <Lock className="input-icon" size={18} />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        tabIndex="-1"
                        aria-label="Toggle password visibility"
                      >
                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>



                  <button id="btn-register" type="submit" className="login-btn" disabled={loading}>
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Buat Akun</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <p className="auth-switch-hint">
                  Sudah punya akun?{' '}
                  <button type="button" className="auth-switch-link" onClick={() => switchTab('login')}>
                    Masuk di sini
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
