import { useEffect, useState } from "react";

import BarChart from "../../components/charts/BarChart";
import LoadingState from "../../components/common/LoadingState";
import StatCard from "../../components/common/StatCard";
import { fetchCourses } from "../../services/courseService";
import {
  downloadCourseCsv,
  fetchCourseSummary,
  fetchOverviewReport,
} from "../../services/reportService";

function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseReport, setCourseReport] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      try {
        const [overviewResponse, coursesResponse] = await Promise.all([
          fetchOverviewReport(),
          fetchCourses(),
        ]);

        if (mounted) {
          setOverview(overviewResponse.data);
          const courseList = coursesResponse.data || [];
          setCourses(courseList);
          if (courseList.length) {
            setSelectedCourse(courseList[0]._id);
          }
        }
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Unable to load report");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReport();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCourseReport() {
      if (!selectedCourse) return;

      try {
        const response = await fetchCourseSummary(selectedCourse);
        if (mounted) setCourseReport(response.data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Unable to load course report");
      }
    }

    loadCourseReport();
    return () => {
      mounted = false;
    };
  }, [selectedCourse]);

  if (loading) return <LoadingState label="Generating institutional report..." />;

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

  const chartData = [
    { label: "Attendance Rate", value: overview.institutionAttendanceRate },
    { label: "Average Grade", value: overview.institutionAverageGrade },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Reporting & Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Institution-wide performance indicators and progress summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Active Users"      value={overview.activeUsers}      variant="violet" />
        <StatCard label="Active Students"   value={overview.activeStudents}   variant="sky" />
        <StatCard label="Published Courses" value={overview.publishedCourses} variant="emerald" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Academic vs Attendance Snapshot (%)</h3>
        <BarChart data={chartData} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h3 className="text-base font-bold text-slate-900">Course Report Tools</h3>
          <select
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={async () => {
              if (!selectedCourse || !courseReport?.course?.code) return;
              await downloadCourseCsv(selectedCourse, `${courseReport.course.code}-report.csv`);
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition"
          >
            Download CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Print Report
          </button>
        </div>

        {courseReport ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard label="Course"            value={courseReport.course.code}                       hint={courseReport.course.title}          variant="violet" />
            <StatCard label="Course Attendance" value={`${courseReport.attendance.attendanceRate}%`}   variant="sky" />
            <StatCard label="Course Avg Grade"  value={`${courseReport.academics.averagePercentage}%`} variant="emerald" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AdminReportsPage;
