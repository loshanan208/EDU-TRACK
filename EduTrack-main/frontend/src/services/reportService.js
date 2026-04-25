import apiClient from "./apiClient";

export async function fetchOverviewReport() {
  const { data } = await apiClient.get("/reports/overview");
  return data;
} 

export async function fetchCourseSummary(courseId) {
  const { data } = await apiClient.get(`/reports/course/${courseId}/summary`);
  return data;
}

export async function fetchStudentSummary(studentId) {
  const { data } = await apiClient.get(`/reports/student/${studentId}/summary`);
  return data;
}

export async function downloadCourseCsv(courseId, filename = "course-report.csv") {
  const response = await apiClient.get(`/reports/course/${courseId}/export-csv`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
