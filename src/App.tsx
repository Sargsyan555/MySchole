import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import About from './pages/About';
import MySchool from './pages/MySchool';
import Documents from './pages/Documents';
import DocumentsByType from './pages/DocumentsByType';
import Announcements from './pages/Announcements';
import AnnouncementsByType from './pages/AnnouncementsByType';
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
        <Route path="my-school" element={<MySchool />} />
        <Route path="my-school/staff" element={<Teachers />} />
        <Route path="my-school/students" element={<Navigate to="/my-school" replace />} />
        <Route path="my-school/about" element={<About />} />
        <Route path="my-school/events" element={<Events />} />
        <Route path="about" element={<Navigate to="/my-school/about" replace />} />
        <Route path="events" element={<Navigate to="/my-school/events" replace />} />
        <Route path="teachers" element={<Navigate to="/my-school/staff" replace />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:type" element={<DocumentsByType />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="announcements/:type" element={<AnnouncementsByType />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/:id" element={<ReportView />} />
        <Route path="admin" element={<AdminLogin />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
