import apiClient from "./apiClient";

export async function fetchStudents(params = {}) {
  const { data } = await apiClient.get("/students", { params });
  return data;
}

export async function createStudent(payload) {
  const { data } = await apiClient.post("/students", payload);
  return data;
}

export async function updateStudent(studentProfileId, payload) {
  const { data } = await apiClient.put(`/students/${studentProfileId}`, payload);
  return data;
}

export async function deactivateStudent(studentId) {
  const { data } = await apiClient.delete(`/students/${studentId}`);
  return data;
}

export async function fetchMyStudentProfile() {
  const { data } = await apiClient.get("/students/me");
  return data;
}
