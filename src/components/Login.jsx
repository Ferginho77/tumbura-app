import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Mail, Lock, Eye, EyeOff, User, LogIn, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Notification
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem('greenvibe_user');
    if (user) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Set default admin account on first load if not exists
  useEffect(() => {
    const accounts = localStorage.getItem('greenvibe_accounts');
    if (!accounts) {
      const defaultAccounts = [
        { name: 'Petani Modern', email: 'admin@tumbura.com', password: 'admin123' }
      ];
      localStorage.setItem('greenvibe_accounts', JSON.stringify(defaultAccounts));
    }
  }, []);

  const handleValidation = () => {
    if (isRegister && !name.trim()) {
      setError('Nama lengkap wajib diisi.');
      return false;
    }
    if (!email) {
      setError('Alamat email wajib diisi.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid.');
      return false;
    }
    if (!password) {
      setError('Kata sandi wajib diisi.');
      return false;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal berisi 6 karakter.');
      return false;
    }
    if (isRegister && password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!handleValidation()) return;

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem('greenvibe_accounts') || '[]');

      if (isRegister) {
        // Register flow
        const emailExists = accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          setError('Email sudah terdaftar. Silakan masuk.');
          setIsLoading(false);
          return;
        }

        const newAccount = { name, email, password };
        accounts.push(newAccount);
        localStorage.setItem('greenvibe_accounts', JSON.stringify(accounts));
        
        setSuccess('Pendaftaran berhasil! Silakan masuk.');
        setIsRegister(false);
        // Clean fields
        setName('');
        setConfirmPassword('');
      } else {
        // Login flow
        const userAccount = accounts.find(
          acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (userAccount) {
          localStorage.setItem('greenvibe_user', JSON.stringify({
            name: userAccount.name,
            email: userAccount.email
          }));
          navigate('/', { replace: true });
        } else {
          setError('Email atau kata sandi Anda salah.');
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSocialLogin = (platform) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      const mockUser = {
        name: `User ${platform}`,
        email: `user.${platform.toLowerCase()}@tumbura.com`
      };
      localStorage.setItem('greenvibe_user', JSON.stringify(mockUser));
      navigate('/', { replace: true });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      {/* Decorative Blur Blobs */}
      <div className="login-bg-blob login-bg-blob-1" />
      <div className="login-bg-blob login-bg-blob-2" />

      {/* Left Column: Visual Banner */}
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
            Optimalkan pertumbuhanbuah dengan
            sistem monitoring terotomatisasi, serta rekomendasi nutrisi.
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

      {/* Right Column: Form Container */}
      <div className="login-form-container">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-header">
            <h2 className="form-title">
              {isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </h2>
            {/* <p className="form-subtitle">
              {isRegister 
                ? 'Daftar untuk mulai memantau instalasi agrikultur Anda.' 
                : 'Masuk dengan akun demo admin@tumbura.com (sandi: admin123)'}
            </p> */}
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

            {success && (
              <motion.div 
                className="alert-box alert-success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CheckCircle size={18} className="shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div 
                  className="input-group"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="input-label">Nama Lengkap</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Masukkan nama lengkap Anda" 
                      className="login-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                    <User className="input-icon" size={18} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label className="input-label">Alamat Email</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                  disabled={isLoading}
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

            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div 
                  className="input-group"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="input-label">Konfirmasi Kata Sandi</label>
                  <div className="input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      className="login-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <Lock className="input-icon" size={18} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Daftar Akun' : 'Masuk ke Dashboard'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>


          <div className="mt-8 text-center">
            <button
              type="button"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline bg-none border-none cursor-pointer"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
            >
              {isRegister 
                ? 'Sudah punya akun? Masuk di sini' 
                : 'Belum punya akun? Daftar sekarang'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
