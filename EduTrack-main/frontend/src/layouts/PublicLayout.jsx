import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/",       label: "Home" },
  { to: "/about",  label: "About Us" },
  { to: "/courses",label: "Courses" },
  { to: "/blog",   label: "Blog" },
];

function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">EduTrack</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5">
              Login
            </Link>
            <Link to="/signup" className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-violet-500 hover:to-indigo-500">
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden rounded-md p-2 text-slate-400 hover:text-white" onClick={() => setOpen((o) => !o)}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-white/5 bg-[#070B14] px-4 pb-4 md:hidden">
            <nav className="mt-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-3 flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-white/10 py-2 text-center text-sm font-semibold text-slate-200">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2 text-center text-sm font-semibold text-white">Sign Up</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-[#070B14]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">EduTrack</span>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} EduTrack. Empowering lifelong learners.</p>
            <div className="flex gap-5 text-sm text-slate-500">
              <Link to="/about" className="hover:text-slate-300 transition">About</Link>
              <Link to="/courses" className="hover:text-slate-300 transition">Courses</Link>
              <Link to="/blog" className="hover:text-slate-300 transition">Blog</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
