import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import FormMessage from "../../components/common/FormMessage";
import LoadingState from "../../components/common/LoadingState";
import { createStudent, deactivateStudent, fetchStudents, updateStudent } from "../../services/studentService";

const PROGRAMS = [
  "BSc (Hons) Computer Science",
  "BSc (Hons) Data Science",
  "BSc (Hons) Information Technology",
  "BEng Software Engineering",
  "BSc Business Informatics",
  "MBA",
];

const DEPARTMENTS = [
  "Faculty of Computing",
  "Faculty of Engineering",
  "Faculty of Business",
  "Faculty of Science",
];

function generateStudentId() {
  const digits = String(Math.floor(100000 + Math.random() * 900000));
  return `EDU-S-${digits}`;
}

const initialForm = {
  studentId: generateStudentId(),
  firstName: "",
  lastName: "",
  address: "",
  gender: "Male",
  email: "",
  contactNo: "",
  dateOfBirth: "",
  admissionYear: new Date().getFullYear(),
  currentSemester: 1,
  program: "",
  department: "",
};

function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState({ type: "", message: "" });
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [search, setSearch] = useState("");
  // editId: null = create mode, string = profile _id being edited
  const [editId, setEditId] = useState(null);

  function validate() {
    const errs = {};

    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    else if (form.firstName.trim().length < 2) errs.firstName = "First name must be at least 2 characters.";

    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    else if (form.lastName.trim().length < 2) errs.lastName = "Last name must be at least 2 characters.";

    if (!form.email.trim()) errs.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";

    if (form.contactNo && !/^[+\d\s\-()]{7,20}$/.test(form.contactNo))
      errs.contactNo = "Enter a valid contact number.";

    if (!form.dateOfBirth) {
      errs.dateOfBirth = "Date of birth is required.";
    } else {
      const dob = new Date(form.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (dob >= today) errs.dateOfBirth = "Date of birth must be in the past.";
      else if (age > 100) errs.dateOfBirth = "Enter a valid date of birth.";
    }

    const year = Number(form.admissionYear);
    if (!form.admissionYear) errs.admissionYear = "Admission year is required.";
    else if (year < 2000 || year > 2100) errs.admissionYear = "Year must be between 2000 and 2100.";

    const sem = Number(form.currentSemester);
    if (!form.currentSemester) errs.currentSemester = "Semester is required.";
    else if (sem < 1 || sem > 12) errs.currentSemester = "Semester must be 1–12.";

    if (!form.program) errs.program = "Please select a program.";
    if (!form.department) errs.department = "Please select a department.";

    return errs;
  }

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchStudents({ search, limit: 100 });
      setStudents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredRows = useMemo(() => students, [students]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setFieldErrors({});
    setFormMessage({ type: "", message: "" });
    setForm({
      studentId: row.studentId || "",
      firstName: row.user?.firstName || row.user?.fullName?.split(" ")[0] || "",
      lastName: row.user?.lastName || row.user?.fullName?.split(" ").slice(1).join(" ") || "",
      address: row.address?.line1 || "",
      gender: row.gender || "Male",
      email: row.user?.email || "",
      contactNo: row.user?.phone || "",
      dateOfBirth: row.dateOfBirth ? row.dateOfBirth.slice(0, 10) : "",
      admissionYear: row.enrollment?.admissionYear || new Date().getFullYear(),
      currentSemester: row.enrollment?.currentSemester || 1,
      program: row.enrollment?.program || "",
      department: row.enrollment?.department || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ ...initialForm, studentId: generateStudentId() });
    setFieldErrors({});
    setFormMessage({ type: "", message: "" });
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormMessage({ type: "error", message: "Please fix the errors below before submitting." });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setFormMessage({ type: "", message: "" });

    if (editId) {
      // ── UPDATE MODE ──
      try {
        await updateStudent(editId, {
          firstName: form.firstName,
          lastName: form.lastName,
          fullName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
          email: form.email,
          phone: form.contactNo,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          address: form.address ? { line1: form.address } : undefined,
          enrollment: {
            admissionDate: `${form.admissionYear}-01-01`,
            admissionYear: Number(form.admissionYear),
            currentSemester: Number(form.currentSemester),
            program: form.program,
            department: form.department,
          },
        });
        setEditId(null);
        setForm({ ...initialForm, studentId: generateStudentId() });
        setFieldErrors({});
        setFormMessage({ type: "success", message: "Student updated successfully." });
        await loadStudents();
      } catch (err) {
        setFormMessage({ type: "error", message: err.response?.data?.message || "Failed to update student" });
      } finally {
        setSaving(false);
      }
      return;
    }

    // ── CREATE MODE ──
    try {
      const result = await createStudent({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNo: form.contactNo,
        studentId: form.studentId,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        enrollment: {
          admissionDate: `${form.admissionYear}-01-01`,
          admissionYear: Number(form.admissionYear),
          currentSemester: Number(form.currentSemester),
          program: form.program,
          department: form.department,
        },
      });

      setForm({ ...initialForm, studentId: generateStudentId() });
      setFieldErrors({});
      setFormMessage({
        type: "success",
        message: `Student registered successfully.${result.tempPassword ? ` Temporary password: ${result.tempPassword}` : ""}`,
      });
      await loadStudents();
    } catch (err) {
      setFormMessage({ type: "error", message: err.response?.data?.message || "Failed to create student" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (studentProfileId) => {
    const confirmed = window.confirm("Deactivate this student?");
    if (!confirmed) return;

    try {
      await deactivateStudent(studentProfileId);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate student");
    }
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Student Management</h2>
          <p className="mt-1 text-sm text-slate-500">Register new students and manage active records.</p>
        </div>
      </div>

      <div className={`rounded-2xl border bg-white p-6 shadow-card ${editId ? "border-brand-400 ring-2 ring-brand-200" : "border-slate-200"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {editId ? "Edit Student" : "Add New Student"}
          </h3>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleCreateStudent} className="space-y-4" noValidate>

          {/* Student ID – always read-only */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Student ID
              <div className="flex gap-2">
                <input
                  name="studentId"
                  value={form.studentId}
                  readOnly
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 font-mono text-sm text-slate-600 cursor-not-allowed"
                />
                {!editId && (
                  <button
                    type="button"
                    title="Generate new ID"
                    onClick={() => setForm((prev) => ({ ...prev, studentId: generateStudentId() }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    ↻
                  </button>
                )}
              </div>
            </label>
          </div>

          {/* First Name + Last Name */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.firstName ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.firstName && <p className="text-xs text-red-600">{fieldErrors.firstName}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.lastName ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.lastName && <p className="text-xs text-red-600">{fieldErrors.lastName}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>

          {/* Gender radio */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Gender</span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleChange}
                  className="accent-brand-700"
                />
                Male
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleChange}
                  className="accent-brand-700"
                />
                Female
              </label>
            </div>
          </div>

          {/* Email + Contact No */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.email ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Contact No</label>
              <input
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.contactNo ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.contactNo && <p className="text-xs text-red-600">{fieldErrors.contactNo}</p>}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1 md:w-1/2">
            <label className="text-sm font-medium text-slate-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.dateOfBirth ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
            />
            {fieldErrors.dateOfBirth && <p className="text-xs text-red-600">{fieldErrors.dateOfBirth}</p>}
          </div>

          {/* Year + Semester */}
          <div className="grid grid-cols-2 gap-3 md:w-1/2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="admissionYear"
                value={form.admissionYear}
                onChange={handleChange}
                min="2000"
                max="2100"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.admissionYear ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.admissionYear && <p className="text-xs text-red-600">{fieldErrors.admissionYear}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Semester <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentSemester"
                value={form.currentSemester}
                onChange={handleChange}
                min="1"
                max="12"
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.currentSemester ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              />
              {fieldErrors.currentSemester && <p className="text-xs text-red-600">{fieldErrors.currentSemester}</p>}
            </div>
          </div>

          {/* Program + Department */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Program <span className="text-red-500">*</span>
              </label>
              <select
                name="program"
                value={form.program}
                onChange={handleChange}
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.program ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              >
                <option value="">Select program</option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {fieldErrors.program && <p className="text-xs text-red-600">{fieldErrors.program}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.department ? "border-red-400 bg-red-50 focus:ring-red-100" : "border-slate-200 bg-slate-50 focus:bg-white focus:ring-brand-100"}`}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {fieldErrors.department && <p className="text-xs text-red-600">{fieldErrors.department}</p>}
            </div>
          </div>

          <FormMessage type={formMessage.type} message={formMessage.message} />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 transition"
            >
              {saving ? (editId ? "Saving..." : "Registering...") : (editId ? "Save Changes" : "Register Student")}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition md:max-w-sm"
        />
        <button onClick={loadStudents} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition">
          Search
        </button>
      </div>

      {loading ? <LoadingState label="Loading students..." /> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !filteredRows.length ? (
        <EmptyState title="No Students Found" description="Create your first student record to get started." />
      ) : null}

      {!loading && filteredRows.length ? (
        <DataTable
          keyField="_id"
          columns={[
            { key: "studentId", label: "Student ID" },
            { key: "firstName", label: "First Name", render: (row) => row.user?.firstName || row.user?.fullName?.split(" ")[0] || "-" },
            { key: "lastName", label: "Last Name", render: (row) => row.user?.lastName || row.user?.fullName?.split(" ").slice(1).join(" ") || "-" },
            { key: "address", label: "Address", render: (row) => row.address?.line1 || "-" },
            { key: "gender", label: "Gender", render: (row) => row.gender || "-" },
            { key: "email", label: "Email", render: (row) => row.user?.email || "-" },
            { key: "contactNo", label: "Contact No", render: (row) => row.user?.phone || "-" },
            { key: "program", label: "Program", render: (row) => row.enrollment?.program || "-" },
            { key: "semester", label: "Semester", render: (row) => row.enrollment?.currentSemester || "-" },
            { key: "status", label: "Status", render: (row) => row.enrollment?.status || "-" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(row)}
                    className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(row._id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Deactivate
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredRows}
        />
      ) : null}
    </section>
  );
}

export default AdminStudentsPage;
