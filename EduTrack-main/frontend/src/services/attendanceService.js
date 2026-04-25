import apiClient from "./apiClient";

export async function markAttendanceBulk(payload) {
  const { data } = await apiClient.post("/attendance/mark-bulk", payload);
  return data;
}

export async function fetchCourseAttendance(courseId, params = {}) {
  const { data } = await apiClient.get(`/attendance/course/${courseId}`, { params });
  return data;
}

export async function fetchStudentAttendance(studentId) {
  const { data } = await apiClient.get(`/attendance/student/${studentId}`);
  return data;
}
