import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import FormMessage from "../../components/common/FormMessage";
import LoadingState from "../../components/common/LoadingState";
import { markAttendanceBulk } from "../../services/attendanceService";
import { fetchCourses } from "../../services/courseService";
import { fetchEnrollments } from "../../services/enrollmentService"; 

function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    let mounted = true;

    async function loadData() { 
      try {
        const response = await fetchCourses();
        if (mounted) {
          const courseList = response.data || [];
          setCourses(courseList);
          if (courseList.length) setSelectedCourse(courseList[0]._id);
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

  useEffect(() => {
    async function loadEnrollments() {
      if (!selectedCourse) return; 
      const response = await fetchEnrollments({ course: selectedCourse, status: "Enrolled" });
      setRows(
        (response.data || []).map((item) => ({
          student: item.student,
          status: "Present",
          remarks: "",
        }))
      );
    }

    loadEnrollments();
  }, [selectedCourse]); 

  const courseName = useMemo(
    () => courses.find((course) => course._id === selectedCourse)?.title || "",
    [courses, selectedCourse]
  );

  const handleStatusChange = (studentId, value) => {
    setRows((prev) => prev.map((row) => (row.student._id === studentId ? { ...row, status: value } : row)));
  };

  const handleRemarksChange = (studentId, value) => {
    setRows((prev) => prev.map((row) => (row.student._id === studentId ? { ...row, remarks: value } : row)));
  };

  const handleSubmit = async () => {
    setMessage({ type: "", message: "" });

    try {
      await markAttendanceBulk({
        courseId: selectedCourse,
        date,
        records: rows.map((row) => ({
          student: row.student._id,
          status: row.status,
          remarks: row.remarks,
        })),
      });

      setMessage({ type: "success", message: `Attendance saved for ${courseName}.` });
    } catch (err) {
      setMessage({ type: "error", message: err.response?.data?.message || "Unable to save attendance" });
    }
  };

  if (loading) return <LoadingState label="Loading attendance workspace..." />;

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition";

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Attendance Management</h2>
          <p className="mt-1 text-sm text-slate-500">Mark daily attendance for students in your assigned courses.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className={inputCls}>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          <button onClick={handleSubmit} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 transition">
            Save Attendance
          </button>
        </div>
        <FormMessage type={message.type} message={message.message} />
      </div>

      {!rows.length ? (
        <EmptyState title="No Enrolled Students" description="No active students found for this course." />
      ) : (
        <DataTable
          keyField="student"
          columns={[
            { key: "studentId", label: "Student ID", render: (row) => row.student.studentId },
            { key: "name", label: "Student Name", render: (row) => row.student.user?.fullName || "-" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <select
                  value={row.status}
                  onChange={(e) => handleStatusChange(row.student._id, e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 transition"
                >
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Late</option>
                  <option>Excused</option>
                </select>
              ),
            },
            {
              key: "remarks",
              label: "Remarks",
              render: (row) => (
                <input
                  value={row.remarks}
                  onChange={(e) => handleRemarksChange(row.student._id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-400 transition"
                  placeholder="Optional"
                />
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </section>
  );
}

export default TeacherAttendancePage;
