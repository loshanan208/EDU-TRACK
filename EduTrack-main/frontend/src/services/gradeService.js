import apiClient from "./apiClient";

export async function fetchGrades(params = {}) {
  const { data } = await apiClient.get("/grades", { params });
  return data;
}

export async function recordGrade(payload) {
  const { data } = await apiClient.post("/grades", payload);
  return data;
}
