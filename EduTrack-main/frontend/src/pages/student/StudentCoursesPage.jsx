import { useEffect, useState } from "react";

import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import { fetchEnrollments } from "../../services/enrollmentService";

function StudentCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const response = await fetchEnrollments();
        setEnrollments(response.data || []);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  if (loading) return <LoadingState label="Loading your courses..." />;

  if (!enrollments.length) {
    return <EmptyState title="No Courses Found" description="You are not enrolled in any courses currently." />;
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Courses</h2>
          <p className="mt-1 text-sm text-slate-500">Your enrollment records by term and status.</p>
        </div>
      </div>

      <DataTable
        keyField="_id"
        columns={[
          { key: "code",     label: "Code",     render: (row) => row.course?.code    || "-" },
          { key: "title",    label: "Course",   render: (row) => row.course?.title   || "-" },
          { key: "subject",  label: "Subject",  render: (row) => row.course?.subject || "-" },
          { key: "term",     label: "Term" },
          { key: "status",   label: "Status" },
          { key: "semester", label: "Semester", render: (row) => row.course?.semester || "-" },
        ]}
        rows={enrollments}
      />
    </section>
  );
}

export default StudentCoursesPage;
