import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Scheduler from './components/Scheduler';
import Inventory from './components/Inventory';
import FieldControl from './components/FieldControl';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="scheduler" element={<Scheduler />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="fields" element={<FieldControl />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
