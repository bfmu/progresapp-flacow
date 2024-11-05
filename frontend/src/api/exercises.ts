import apiClient from "../lib/axios";

export const getAllExercises = async () => {
  return await apiClient.get("/exercises");
};

export const updateExercises = async (id: number, values: any) => {
  return await apiClient.patch(`/exercises/${id}`, values);
};

export const createExercises = async (values: any) => {
  return await apiClient.post(`/exercises`, values);
};

export const deleteExercises = async (id: number) => {
  return await apiClient.delete(`/exercises/${id}`);
};
