import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import apiClient from "../services/apiClient";

function roleHome(role) {
  if (role === "Admin") return "/admin";
  if (role === "Teacher") return "/teacher";
  return "/student";
}

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  dateOfBirth: "",
  gender: "Prefer not to say",
  phone: "",
  program: "",
  department: "",
  currentSemester: 1,
};

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-indigo-500 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-indigo-500";

const labelCls = "mb-1.5 block text-sm font-medium text-slate-300";

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await apiClient.post("/auth/signup", {
        ...form,
        currentSemester: Number(form.currentSemester),
      });

      localStorage.setItem("edutrack_token", data.token);
      localStorage.setItem("edutrack_user", JSON.stringify(data.user));
      navigate(roleHome(data.user.role), { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070B14]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-gradient-to-br from-indigo-800 via-violet-800 to-purple-900 p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold text-white">EduTrack</span>
        </Link>
        <div>
          <h2 className="text-4xl font-black text-white leading-tight">Start your<br />learning journey.</h2>
          <p className="mt-4 text-indigo-200">Join thousands of students already on the platform. It takes less than 2 minutes.</p>
        </div>
        <p className="text-xs text-indigo-300">© {new Date().getFullYear()} EduTrack.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold text-white">EduTrack</span>
          </div>

          <h1 className="text-3xl font-black text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Fill in the details below to register as a student.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="John Doe" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input name="password" type="password" minLength={8} value={form.password} onChange={handleChange} required placeholder="Min. 8 characters" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+94 77 123 4567" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                  <option>Prefer not to say</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Program</label>
                <input name="program" value={form.program} onChange={handleChange} required placeholder="e.g. BSc Computer Science" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <input name="department" value={form.department} onChange={handleChange} required placeholder="e.g. Faculty of Computing" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Current Semester</label>
                <input name="currentSemester" type="number" min={1} max={12} value={form.currentSemester} onChange={handleChange} required className={`${inputCls} md:w-1/3`} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">Sign in</Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className="text-slate-500 hover:text-slate-300 transition">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
