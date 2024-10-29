import apiClient from "../lib/axios";

export const loginRequest = async (email: string, password: string) => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};
