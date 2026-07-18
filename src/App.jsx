import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AdminAuth from "./pages/AdminAuth";
import StudentAuth from "./pages/StudentAuth";
import AdminDashboard from "./pages/AdminDashboard";
import HallView from "./pages/HallView";
import StudentPortal from "./pages/StudentPortal";
import StudentPending from "./pages/StudentPending";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin/halls" element={<AdminDashboard />} />
        <Route path="/admin/halls/:slug" element={<HallView />} />
        <Route path="/student/login" element={<StudentAuth />} />
        <Route path="/student/portal" element={<StudentPortal />} />
        <Route path="/student/pending" element={<StudentPending />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
