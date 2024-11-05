import apiClient from "../lib/axios";

export const getAllExercises = async () => {
  const response = await apiClient.get("/exercises");
  return response.data;
};
