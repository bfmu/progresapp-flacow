import apiClient from "../lib/axios";

export const getAllMuscles = async () => {
  return await apiClient.get("/muscles");
};

export const updateMuscle = async (id: number, values: any) => {
  return await apiClient.patch(`/muscles/${id}`, values);
};

export const createMuscle = async (values: any) => {
  return await apiClient.post(`/muscles`, values);
};

export const deleteMuscle = async (id: number) => {
  return await apiClient.delete(`/muscles/${id}`);
};
