import apiClient from "./apiClient";

export async function fetchCourses(params = {}) {
  const { data } = await apiClient.get("/courses", { params });
  return data;
}

export async function createCourse(payload) {
  const { data } = await apiClient.post("/courses", payload);
  return data;
}

export async function archiveCourse(courseId) {
  const { data } = await apiClient.delete(`/courses/${courseId}`);
  return data;
}
