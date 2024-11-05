import apiClient from "../lib/axios";

export const getAllLiftingHistories = async () => {
  return await apiClient.get("/lifting-histories");
};

export const getAllLiftingHistoriesForExercise = async (id:number) => {
    return await apiClient.get(`/lifting-histories/exercises/${id}`);
  };

export const updateLiftingHistorie = async (id: number, values: any) => {
  return await apiClient.patch(`/lifting-histories/${id}`, values);
};

export const createLiftingHistorie = async (values: any) => {
  return await apiClient.post(`/lifting-histories`, values);
};

export const deleteLiftingHistorie = async (id: number) => {
  return await apiClient.delete(`/lifting-histories/${id}`);
};


