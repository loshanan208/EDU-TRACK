import apiClient from "./apiClient";

export async function fetchEnrollments(params = {}) {
  const { data } = await apiClient.get("/enrollments", { params });
  return data;
}

export async function createEnrollment(payload) {
  const { data } = await apiClient.post("/enrollments", payload);
  return data;
}

export async function updateEnrollment(enrollmentId, payload) {
  const { data } = await apiClient.patch(`/enrollments/${enrollmentId}`, payload);
  return data;
}
