import { useEffect, useState } from "react";

import BarChart from "../../components/charts/BarChart";
import LoadingState from "../../components/common/LoadingState";
import StatCard from "../../components/common/StatCard";
import { fetchCourses } from "../../services/courseService";
import { downloadCourseCsv, fetchCourseSummary } from "../../services/reportService";

function TeacherReportsPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCoursesAndReport() {
      try {
        const courseResponse = await fetchCourses();
        const courseList = courseResponse.data || [];
        setCourses(courseList);

        if (courseList.length) {
          setSelectedCourse(courseList[0]._id);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCoursesAndReport();
  }, []);

  useEffect(() => {
    async function loadReport() {
      if (!selectedCourse) return;

      try {
        const response = await fetchCourseSummary(selectedCourse);
        setReport(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load report");
      }
    }

    loadReport();
  }, [selectedCourse]);

  const handleDownload = async () => {
    if (!selectedCourse || !report?.course?.code) return;

    try {
      await downloadCourseCsv(selectedCourse, `${report.course.code}-report.csv`);
    } catch {
      setError("Failed to download course report");
    }
  };

  if (loading) return <LoadingState label="Loading report workspace..." />;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Course Reporting & Analytics</h2>
          <p className="mt-1 text-sm text-slate-500">Inspect course-level attendance and academic outcomes.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 transition">
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
        <button onClick={handleDownload} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
          Download CSV
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Print Report
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      ) : null}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Enrolled"       value={report.enrollment.enrolledCount}        variant="sky" />
            <StatCard label="Attendance Rate" value={`${report.attendance.attendanceRate}%`}  variant="emerald" />
            <StatCard label="Average Grade"   value={`${report.academics.averagePercentage}%`} variant="amber" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="mb-4 text-base font-bold text-slate-900">Attendance Breakdown</h3>
            <BarChart
              data={Object.entries(report.attendance.statusBreakdown || {}).map(([label, value]) => ({ label, value }))}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

export default TeacherReportsPage;
