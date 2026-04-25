import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-amber-900">Unauthorized</h1>
        <p className="mt-3 text-amber-800">You do not have permission to access this page.</p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
