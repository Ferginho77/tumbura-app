import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Activity, Bug, Calendar, Menu, X, Sun, Moon, Package } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './Layout.css';

const navItems = [
  { path: '/', name: 'Dashboard', icon: Activity },
  { path: '/scheduler', name: 'Task Scheduler', icon: Calendar },
  { path: '/inventory', name: 'Inventory', icon: Package },
  { path: '/fields', name: 'Field Control', icon: Sprout }
];

export default function Layout() {
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
                <h1 className="logo"><Sprout className="logo-icon" /> TumburaApp</h1>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="sidebar desktop">
        <div className="sidebar-header">
          <h1 className="logo"><Sprout className="logo-icon" /> TumburaApp</h1>
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
        <div className="p-4 mt-auto border-t border-bg-200">
          <button className="btn-outline flex items-center justify-center gap-2 w-full" onClick={toggleTheme}>
            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
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
