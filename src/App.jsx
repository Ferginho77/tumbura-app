import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Troubleshooter from './components/Troubleshooter';
import Scheduler from './components/Scheduler';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="troubleshooter" element={<Troubleshooter />} />
        <Route path="scheduler" element={<Scheduler />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
