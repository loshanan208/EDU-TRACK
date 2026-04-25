import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
