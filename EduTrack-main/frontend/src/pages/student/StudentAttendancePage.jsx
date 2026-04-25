import { useEffect, useMemo, useState } from "react";

import BarChart from "../../components/charts/BarChart";
import DataTable from "../../components/common/DataTable";
import LoadingState from "../../components/common/LoadingState";
import { fetchStudentAttendance } from "../../services/attendanceService";
import { fetchMyStudentProfile } from "../../services/studentService";

function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const profileResponse = await fetchMyStudentProfile();
        const studentId = profileResponse.data._id;
        const attendanceResponse = await fetchStudentAttendance(studentId);
        setRecords(attendanceResponse.data || []);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const breakdown = useMemo(() => {
    return records.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [records]);

  if (loading) return <LoadingState label="Loading attendance history..." />;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">My Attendance</h2>
          <p className="mt-1 text-sm text-slate-500">Attendance records and status distribution.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="mb-4 text-base font-bold text-slate-900">Status Breakdown</h3>
        <BarChart data={Object.entries(breakdown).map(([label, value]) => ({ label, value }))} />
      </div>

      <DataTable
        keyField="_id"
        columns={[
          { key: "date",    label: "Date",    render: (row) => new Date(row.date).toLocaleDateString() },
          { key: "course", label: "Course",  render: (row) => row.course?.title || "-" },
          { key: "status", label: "Status" },
          { key: "remarks", label: "Remarks" },
        ]}
        rows={records}
      />
    </section>
  );
}

export default StudentAttendancePage;
