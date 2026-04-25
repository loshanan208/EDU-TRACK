import { useEffect, useState } from "react";

import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import StatCard from "../../components/common/StatCard";
import { fetchEnrollments } from "../../services/enrollmentService";
import { fetchMyStudentProfile } from "../../services/studentService";

function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [profileResponse, enrollmentResponse] = await Promise.all([
          fetchMyStudentProfile(),
          fetchEnrollments(),
        ]);

        if (mounted) {
          setProfile(profileResponse.data);
          setEnrollments(enrollmentResponse.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || "Unable to load student dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading your profile..." />;

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
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Student Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back, {profile?.user?.fullName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Student ID"        value={profile?.studentId || "-"}                        variant="violet" />
        <StatCard label="Program"           value={profile?.enrollment?.program || "-"}             variant="sky" />
        <StatCard label="Current Semester"  value={profile?.enrollment?.currentSemester || "-"}    variant="emerald" />
      </div>

      {enrollments.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="text-base font-bold text-slate-900">Current Enrollment Snapshot</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Active enrolled courses: <span className="font-semibold text-slate-800">{enrollments.filter((item) => item.status === "Enrolled").length}</span>
          </p>
        </div>
      ) : (
        <EmptyState
          title="No Enrollments Yet"
          description="You do not have active enrollments yet. Please contact administration."
        />
      )}
    </section>
  );
}

export default StudentDashboardPage;
