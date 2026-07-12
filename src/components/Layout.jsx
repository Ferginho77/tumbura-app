import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Activity, Wheat, Calendar, Menu, X, Sun, Moon, Package, LogOut  } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Layout.css';

const navItems = [
  { path: '/', name: 'Dashboard', icon: Activity },
  { path: '/scheduler', name: 'Activity Log', icon: Calendar },
  { path: '/fields', name: 'Field Control', icon: Sprout },
  { path: '/harvest', name: 'Harvest', icon: Wheat },
];

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage('greenvibe_theme', 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    localStorage.removeItem('greenvibe_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout-container">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div 
              className="sidebar mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            >
              <div className="sidebar-header">
                <h1 className="logo"> <img src="/icon.png" alt="TumburaApp Logo" className="w-8 h-8 mr-2" /> TumburaApp</h1>
                <button className="icon-btn" onClick={() => setSidebarOpen(false)}><X /></button>
              </div>
              <nav className="sidebar-nav">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="nav-icon" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 mt-auto border-t border-bg-200">
                <button className="btn-outline flex items-center justify-center gap-2 w-full text-[red] border-[red] hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
                  <LogOut size={18} /> Keluar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="sidebar desktop">
        <div className="sidebar-header">
          <h1 className="logo"> <img src="/icon.png" alt="TumburaApp Logo" className="w-8 h-8 mr-2" /> TumburaApp</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t border-bg-200 flex flex-col gap-2">
          <button className="btn-outline flex items-center justify-center gap-2 w-full" onClick={toggleTheme}>
            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
          </button>
          <button className="btn-outline flex items-center justify-center gap-2 w-full text-[red] border-[red] hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="mobile-header">
          <button className="icon-btn" onClick={() => setSidebarOpen(true)}>
            <Menu />
          </button>
          <h1 className="mobile-title">TumburaApp</h1>
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
