import apiClient from "./apiClient";

export async function fetchTeachers() {
  const { data } = await apiClient.get("/users/teachers");
  return data;
}

export async function createTeacher(payload) {
  const { data } = await apiClient.post("/users/teachers", payload);
  return data;
}
