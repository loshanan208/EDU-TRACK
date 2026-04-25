import { Navigate, Route, Routes } from "react-router-dom";

import { AdminRoute, StudentRoute, TeacherRoute } from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import Home from "../pages/public/Home";
import AboutPage from "../pages/public/AboutPage";
import CoursesPage from "../pages/public/CoursesPage";
import BlogPage from "../pages/public/BlogPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AdminCoursesPage from "../pages/admin/AdminCoursesPage";
import AdminEnrollmentsPage from "../pages/admin/AdminEnrollmentsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage";
import TeacherAttendancePage from "../pages/teacher/TeacherAttendancePage";
import TeacherGradesPage from "../pages/teacher/TeacherGradesPage";
import TeacherReportsPage from "../pages/teacher/TeacherReportsPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentCoursesPage from "../pages/student/StudentCoursesPage";
import StudentAttendancePage from "../pages/student/StudentAttendancePage";
import StudentGradesPage from "../pages/student/StudentGradesPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Route>

      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected dashboard routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <TeacherRoute>
            <DashboardLayout />
          </TeacherRoute>
        }
      >
        <Route index element={<TeacherDashboardPage />} />
        <Route path="attendance" element={<TeacherAttendancePage />} />
        <Route path="grades" element={<TeacherGradesPage />} />
        <Route path="reports" element={<TeacherReportsPage />} />
      </Route>

      <Route
        path="/student"
        element={
          <StudentRoute>
            <DashboardLayout />
          </StudentRoute>
        }
      >
        <Route index element={<StudentDashboardPage />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
        <Route path="grades" element={<StudentGradesPage />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
