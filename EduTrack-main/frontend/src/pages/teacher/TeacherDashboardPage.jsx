import { useEffect, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import StatCard from "../../components/common/StatCard";
import { fetchCourses } from "../../services/courseService";

function TeacherDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        const response = await fetchCourses();
        if (mounted) setCourses(response.data || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Unable to load assigned courses");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading assigned courses..." />;

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Teacher Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Track assigned classes, attendance, and grading workload.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Assigned Courses" value={courses.length} variant="sky" />
        <StatCard
          label="Published Courses"
          value={courses.filter((course) => course.status === "Published").length}
          variant="emerald"
        />
        <StatCard
          label="Total Seats Filled"
          value={courses.reduce((acc, course) => acc + (course.enrolledCount || 0), 0)}
          variant="amber"
        />
      </div>

      {courses.length ? (
        <DataTable
          keyField="_id"
          columns={[
            { key: "code", label: "Code" },
            { key: "title", label: "Course" },
            { key: "subject", label: "Subject" },
            { key: "semester", label: "Semester" },
            { key: "enrolledCount", label: "Enrolled" },
            { key: "status", label: "Status" },
          ]}
          rows={courses}
        />
      ) : (
        <EmptyState
          title="No Assigned Courses"
          description="You do not have any assigned courses yet. Contact the administrator."
        />
      )}
    </section>
  );
}

export default TeacherDashboardPage;
