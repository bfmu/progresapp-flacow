import apiClient from "../lib/axios";

export const loginRequest = async (email: string, password: string) => {
  return await apiClient.post("/auth/login", { email, password });
};

export const registerRequest = async (
  full_name: string,
  email: string,
  password: string
) => {
  return await apiClient.post("/auth/register", {
    full_name,
    email,
    password,
  });
};
