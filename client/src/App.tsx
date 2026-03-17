import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import Reports from './pages/Reports';
import ReportView from './pages/ReportView';
import Events from './pages/Events';
import Teachers from './pages/Teachers';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:id" element={<ReportView />} />
        <Route path="events" element={<Events />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="admin" element={<AdminLogin />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
