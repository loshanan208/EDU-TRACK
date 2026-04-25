import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import FormMessage from "../../components/common/FormMessage";
import LoadingState from "../../components/common/LoadingState";
import { fetchCourses } from "../../services/courseService";
import {
  createEnrollment,
  fetchEnrollments,
  updateEnrollment,
} from "../../services/enrollmentService";
import { fetchStudents } from "../../services/studentService";

function AdminEnrollmentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState({ type: "", message: "" });
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ student: "", course: "", term: "" });

  async function loadData() {
    setLoading(true);
    try {
      const [studentsResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
        fetchStudents({ limit: 200 }),
        fetchCourses(),
        fetchEnrollments(),
      ]);

      const studentRows = studentsResponse.data || [];
      const courseRows = coursesResponse.data || [];

      setStudents(studentRows);
      setCourses(courseRows);
      setEnrollments(enrollmentsResponse.data || []);

      setForm((prev) => ({
        student: prev.student || studentRows[0]?._id || "",
        course: prev.course || courseRows[0]?._id || "",
        term: prev.term || `Sem-${new Date().getFullYear()}`,
      }));
    } catch (error) {
      setMessage({ type: "error", message: error.response?.data?.message || "Failed to load enrollment data" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredEnrollments = useMemo(() => {
    if (!statusFilter) return enrollments;
    return enrollments.filter((item) => item.status === statusFilter);
  }, [enrollments, statusFilter]);

  const handleCreateEnrollment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: "", message: "" });

    try {
      await createEnrollment(form);
      setMessage({ type: "success", message: "Student enrolled successfully." });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", message: error.response?.data?.message || "Unable to enroll student" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (enrollmentId, status) => {
    try {
      await updateEnrollment(enrollmentId, { status });
      setMessage({ type: "success", message: `Enrollment moved to ${status}.` });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", message: error.response?.data?.message || "Unable to update enrollment" });
    }
  };

  if (loading) return <LoadingState label="Loading enrollments..." />;

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition";

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Enrollment Management</h2>
          <p className="mt-1 text-sm text-slate-500">Enroll students into courses and update enrollment status.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Enroll a Student</h3>
        <form onSubmit={handleCreateEnrollment} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={form.student}
            onChange={(e) => setForm((prev) => ({ ...prev, student: e.target.value }))}
            className={inputCls}
            required
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.studentId} - {student.user?.fullName}
              </option>
            ))}
          </select>

          <select
            value={form.course}
            onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
            className={inputCls}
            required
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>

          <input
            value={form.term}
            onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))}
            className={inputCls}
            placeholder="Term (e.g. Sem-2026)"
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 transition"
          >
            {saving ? "Enrolling..." : "Enroll Student"}
          </button>
        </form>
      </div>

      <FormMessage type={message.type} message={message.message} />

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
        >
          <option value="">All</option>
          <option value="Enrolled">Enrolled</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
          <option value="Withdrawn">Withdrawn</option>
          <option value="Waitlisted">Waitlisted</option>
        </select>
      </div>

      {!filteredEnrollments.length ? (
        <EmptyState
          title="No Enrollment Records"
          description="Create your first enrollment to assign a student to a course."
        />
      ) : (
        <DataTable
          keyField="_id"
          columns={[
            {
              key: "student",
              label: "Student",
              render: (row) => `${row.student?.studentId || "-"} - ${row.student?.user?.fullName || "-"}`,
            },
            {
              key: "course",
              label: "Course",
              render: (row) => `${row.course?.code || "-"} - ${row.course?.title || "-"}`,
            },
            { key: "term", label: "Term" },
            { key: "status", label: "Status" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleStatusUpdate(row._id, "Completed")}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(row._id, "Dropped")}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Drop
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(row._id, "Enrolled")}
                    className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                  >
                    Re-enroll
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredEnrollments}
        />
      )}
    </section>
  );
}

export default AdminEnrollmentsPage;
