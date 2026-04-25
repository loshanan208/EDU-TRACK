import { Link } from "react-router-dom";

const features = [
  {
    title: "Smart Attendance",
    description: "Teachers mark attendance in seconds. Students see live records from any device.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    title: "Grade Insights",
    description: "Automated grade tracking with per-assessment breakdowns and progress trends.",
    icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
    gradient: "from-sky-500 to-cyan-600",
  },
  {
    title: "Course Management",
    description: "Structured course journeys with schedules, enrollments, and capacity controls.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Admin Reports",
    description: "Institutional analytics at a glance — attendance rates, grades, and enrollment status.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    gradient: "from-rose-500 to-pink-600",
  },
];

function Home() {
  return (
    <div className="relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-60 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-32">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Welcome to EduTrack
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl">
            Learn with{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              clarity.
            </span>{" "}
            Grow with confidence.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Feel the pulse of learning with our engaging courses and resources designed to inspire and educate. Take the first step on your educational journey with us.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-900/40 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-2xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-slate-100 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
          {[
            { value: "500+", label: "Students" },
            { value: "40+",  label: "Courses" },
            { value: "98%",  label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-white">Everything you need to succeed</h2>
          <p className="mt-3 text-slate-400">Purpose-built tools for students, teachers, and administrators.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur transition hover:border-white/15 hover:bg-white/8"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-10 text-center shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <h2 className="text-3xl font-black text-white">Ready to start your journey?</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-200">Join thousands of students already learning on EduTrack. Create your free account today.</p>
          <Link
            to="/signup"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
