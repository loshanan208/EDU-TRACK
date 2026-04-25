import { useEffect, useState } from "react";

import LoadingState from "../../components/common/LoadingState";
import StatCard from "../../components/common/StatCard";
import { fetchOverviewReport } from "../../services/reportService";

// SVG path constants for StatCard icons
const ICONS = {
  users:       "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  students:    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  courses:     "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  enrollments: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  attendance:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  grade:       "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const response = await fetchOverviewReport();
        if (mounted) setMetrics(response.data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Unable to load overview report");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingState label="Loading institution analytics..." />;

  if (error) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Live institutional summary across users, academics, and attendance.</p>
        </div>
        <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 sm:inline-block">
          Overview
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active Users"       value={metrics.activeUsers}                         variant="violet"  icon={ICONS.users} />
        <StatCard label="Active Students"    value={metrics.activeStudents}                      variant="sky"     icon={ICONS.students} />
        <StatCard label="Published Courses"  value={metrics.publishedCourses}                    variant="emerald" icon={ICONS.courses} />
        <StatCard label="Active Enrollments" value={metrics.activeEnrollments}                   variant="amber"   icon={ICONS.enrollments} />
        <StatCard label="Attendance Rate"    value={`${metrics.institutionAttendanceRate}%`}     variant="rose"    icon={ICONS.attendance} hint="Institution-wide" />
        <StatCard label="Average Grade"      value={`${metrics.institutionAverageGrade}%`}       variant="default" icon={ICONS.grade} hint="Institution-wide" />
      </div>
    </section>
  );
}

export default AdminDashboardPage;
