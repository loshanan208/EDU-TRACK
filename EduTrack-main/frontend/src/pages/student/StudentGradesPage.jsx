import { useEffect, useMemo, useState } from "react";

import LineTrendChart from "../../components/charts/LineTrendChart";
import DataTable from "../../components/common/DataTable";
import LoadingState from "../../components/common/LoadingState";
import { fetchGrades } from "../../services/gradeService";

function StudentGradesPage() {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    async function loadGrades() {
      try {
        const response = await fetchGrades();
        setGrades(response.data || []);
      } finally {
        setLoading(false);
      }
    }

    loadGrades();
  }, []);

  const trend = useMemo(() => {
    const bucket = {};
    grades.forEach((item) => {
      if (!bucket[item.term]) {
        bucket[item.term] = { sum: 0, count: 0 };
      }
      bucket[item.term].sum += item.percentage;
      bucket[item.term].count += 1;
    });

    return Object.keys(bucket)
      .sort()
      .map((term) => ({
        label: term,
        value: Number((bucket[term].sum / bucket[term].count).toFixed(2)),
      }));
  }, [grades]);

  if (loading) return <LoadingState label="Loading your grades..." />;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Academic Performance</h2>
          <p className="mt-1 text-sm text-slate-500">Assessment records and term-wise performance trend.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Grade Trend by Term</h3>
        <LineTrendChart points={trend} />
      </div>

      <DataTable
        keyField="_id"
        columns={[
          { key: "assessmentDate", label: "Date",       render: (row) => new Date(row.assessmentDate).toLocaleDateString() },
          { key: "course",         label: "Course",     render: (row) => row.course?.title || "-" },
          { key: "assessmentTitle", label: "Assessment" },
          { key: "obtainedMarks",  label: "Marks",      render: (row) => `${row.obtainedMarks}/${row.maxMarks}` },
          { key: "percentage",     label: "Percentage", render: (row) => `${row.percentage}%` },
          { key: "letterGrade",    label: "Grade" },
          { key: "term",           label: "Term" },
        ]}
        rows={grades}
      />
    </section>
  );
}

export default StudentGradesPage;
