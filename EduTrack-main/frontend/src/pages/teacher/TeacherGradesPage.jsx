import { useEffect, useState } from "react";

import DataTable from "../../components/common/DataTable";
import FormMessage from "../../components/common/FormMessage";
import LoadingState from "../../components/common/LoadingState";
import { fetchCourses } from "../../services/courseService";
import { fetchEnrollments } from "../../services/enrollmentService";
import { fetchGrades, recordGrade } from "../../services/gradeService";

const initialForm = {
  student: "",
  assessmentType: "Quiz",
  assessmentTitle: "",
  assessmentDate: new Date().toISOString().slice(0, 10),
  maxMarks: 100,
  obtainedMarks: 0,
  weightage: 10,
  term: "Term-1",
  remarks: "",
};

function TeacherGradesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    async function loadInitial() {
      const response = await fetchCourses();
      const courseList = response.data || [];
      setCourses(courseList);
      if (courseList.length) setSelectedCourse(courseList[0]._id);
      setLoading(false);
    }

    loadInitial();
  }, []);

  useEffect(() => {
    async function loadByCourse() {
      if (!selectedCourse) return;
      const [enrollmentResponse, gradeResponse] = await Promise.all([
        fetchEnrollments({ course: selectedCourse, status: "Enrolled" }),
        fetchGrades({ course: selectedCourse }),
      ]);

      const studentRows = (enrollmentResponse.data || []).map((item) => item.student);
      setStudents(studentRows);
      setGrades(gradeResponse.data || []);
      if (studentRows.length) {
        setForm((prev) => ({ ...prev, student: studentRows[0]._id }));
      }
    }

    loadByCourse();
  }, [selectedCourse]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", message: "" });

    try {
      await recordGrade({
        ...form,
        course: selectedCourse,
        maxMarks: Number(form.maxMarks),
        obtainedMarks: Number(form.obtainedMarks),
        weightage: Number(form.weightage),
      });

      const refreshed = await fetchGrades({ course: selectedCourse });
      setGrades(refreshed.data || []);
      setMessage({ type: "success", message: "Grade recorded successfully." });
    } catch (err) {
      setMessage({ type: "error", message: err.response?.data?.message || "Failed to record grade" });
    }
  };

  if (loading) return <LoadingState label="Loading grading workspace..." />;

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition";

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Academic Performance Monitoring</h2>
          <p className="mt-1 text-sm text-slate-500">Record assessments and monitor student marks by course.</p>
        </div>
      </div>

      <div>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 transition">
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Record Grade</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select name="student" value={form.student} onChange={handleChange} required className={inputCls}>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.studentId} - {student.user?.fullName}
              </option>
            ))}
          </select>
          <select name="assessmentType" value={form.assessmentType} onChange={handleChange} className={inputCls}>
            <option>Quiz</option>
            <option>Assignment</option>
            <option>Midterm</option>
            <option>Final</option>
            <option>Project</option>
            <option>Lab</option>
            <option>Other</option>
          </select>
          <input name="assessmentTitle" value={form.assessmentTitle} onChange={handleChange} required placeholder="Assessment title" className={inputCls} />
          <input type="date" name="assessmentDate" value={form.assessmentDate} onChange={handleChange} required className={inputCls} />
          <input name="maxMarks" value={form.maxMarks} onChange={handleChange} required placeholder="Max marks" className={inputCls} />
          <input name="obtainedMarks" value={form.obtainedMarks} onChange={handleChange} required placeholder="Obtained marks" className={inputCls} />
          <input name="weightage" value={form.weightage} onChange={handleChange} required placeholder="Weightage" className={inputCls} />
          <input name="term" value={form.term} onChange={handleChange} required placeholder="Term" className={inputCls} />
          <input name="remarks" value={form.remarks} onChange={handleChange} placeholder="Remarks" className={inputCls} />

          <div className="md:col-span-3">
            <FormMessage type={message.type} message={message.message} />
          </div>

          <div className="md:col-span-3">
            <button type="submit" className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 transition">
              Record Grade
            </button>
          </div>
        </form>
      </div>

      <DataTable
        keyField="_id"
        columns={[
          { key: "student", label: "Student", render: (row) => row.student?.user?.fullName || "-" },
          { key: "assessmentTitle", label: "Assessment" },
          { key: "assessmentType", label: "Type" },
          { key: "obtainedMarks", label: "Marks", render: (row) => `${row.obtainedMarks}/${row.maxMarks}` },
          { key: "percentage", label: "Percentage", render: (row) => `${row.percentage}%` },
          { key: "letterGrade", label: "Grade" },
          { key: "term", label: "Term" },
        ]}
        rows={grades}
      />
    </section>
  );
}

export default TeacherGradesPage;
