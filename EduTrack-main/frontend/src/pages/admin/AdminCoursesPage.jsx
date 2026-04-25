import { useEffect, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import FormMessage from "../../components/common/FormMessage";
import LoadingState from "../../components/common/LoadingState";
import { archiveCourse, createCourse, fetchCourses } from "../../services/courseService";
import { createTeacher, fetchTeachers } from "../../services/userService";

const initialForm = {
  code: "",
  title: "",
  subject: "",
  credits: 3,
  capacity: 30,
  teacher: "",
  semester: 1,
  academicYear: new Date().getFullYear(),
  dayOfWeek: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  room: "",
};

function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", message: "" });
  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  async function loadCourses() {
    setLoading(true);
    try {
      const [coursesResponse, teachersResponse] = await Promise.all([fetchCourses(), fetchTeachers()]);
      setCourses(coursesResponse.data || []);
      setTeachers(teachersResponse.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormMessage({ type: "", message: "" });

    try {
      await createCourse({
        code: form.code,
        title: form.title,
        subject: form.subject,
        credits: Number(form.credits),
        capacity: Number(form.capacity),
        teacher: form.teacher,
        semester: Number(form.semester),
        academicYear: Number(form.academicYear),
        status: "Published",
        schedule: [
          {
            dayOfWeek: form.dayOfWeek,
            startTime: form.startTime,
            endTime: form.endTime,
            room: form.room,
          },
        ],
      });

      setForm(initialForm);
      setFormMessage({ type: "success", message: "Course created successfully." });
      await loadCourses();
    } catch (err) {
      setFormMessage({ type: "error", message: err.response?.data?.message || "Failed to create course" });
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherChange = (event) => {
    const { name, value } = event.target;
    setTeacherForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTeacher = async (event) => {
    event.preventDefault();

    try {
      await createTeacher(teacherForm);
      setTeacherForm({ fullName: "", email: "", password: "" });
      setFormMessage({ type: "success", message: "Teacher account created successfully." });
      await loadCourses();
    } catch (err) {
      setFormMessage({ type: "error", message: err.response?.data?.message || "Failed to create teacher" });
    }
  };

  const handleArchive = async (courseId) => {
    const confirmed = window.confirm("Archive this course?");
    if (!confirmed) return;

    try {
      await archiveCourse(courseId);
      await loadCourses();
    } catch {
      setFormMessage({ type: "error", message: "Failed to archive course" });
    }
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition";
  const primaryCls = "rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 transition";

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Course Management</h2>
          <p className="mt-1 text-sm text-slate-500">Create courses, assign teachers, and archive outdated offerings.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Add Teacher Account</h3>
        <form onSubmit={handleCreateTeacher} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="fullName" value={teacherForm.fullName} onChange={handleTeacherChange} required placeholder="Teacher full name" className={inputCls} />
          <input name="email" type="email" value={teacherForm.email} onChange={handleTeacherChange} required placeholder="Teacher email" className={inputCls} />
          <input name="password" type="password" value={teacherForm.password} onChange={handleTeacherChange} required placeholder="Temporary password" className={inputCls} />
          <div className="md:col-span-3">
            <button type="submit" className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition">
              Create Teacher Account
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Add New Course</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input name="code" value={form.code} onChange={handleChange} required placeholder="Course code" className={inputCls} />
          <input name="title" value={form.title} onChange={handleChange} required placeholder="Course title" className={inputCls} />
          <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Subject" className={inputCls} />
          <select name="teacher" value={form.teacher} onChange={handleChange} required className={inputCls}>
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.fullName} ({teacher.email})
              </option>
            ))}
          </select>
          <input name="credits" value={form.credits} onChange={handleChange} required placeholder="Credits" className={inputCls} />
          <input name="capacity" value={form.capacity} onChange={handleChange} required placeholder="Capacity" className={inputCls} />
          <input name="semester" value={form.semester} onChange={handleChange} required placeholder="Semester" className={inputCls} />
          <input name="academicYear" value={form.academicYear} onChange={handleChange} required placeholder="Academic Year" className={inputCls} />
          <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} className={inputCls}>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required className={inputCls} />
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required className={inputCls} />
          </div>
          <input name="room" value={form.room} onChange={handleChange} placeholder="Room" className={`${inputCls} md:col-span-2`} />

          <div className="md:col-span-2">
            <FormMessage type={formMessage.type} message={formMessage.message} />
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={saving} className={primaryCls}>
              {saving ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>

      {loading ? <LoadingState label="Loading courses..." /> : null}

      {!loading && !courses.length ? (
        <EmptyState title="No Courses Yet" description="Create your first course to start enrollments." />
      ) : null}

      {!loading && courses.length ? (
        <DataTable
          keyField="_id"
          columns={[
            { key: "code", label: "Code" },
            { key: "title", label: "Title" },
            { key: "subject", label: "Subject" },
            { key: "capacity", label: "Capacity" },
            { key: "enrolledCount", label: "Enrolled" },
            { key: "status", label: "Status" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <button
                  onClick={() => handleArchive(row._id)}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                >
                  Archive
                </button>
              ),
            },
          ]}
          rows={courses}
        />
      ) : null}
    </section>
  );
}

export default AdminCoursesPage;
