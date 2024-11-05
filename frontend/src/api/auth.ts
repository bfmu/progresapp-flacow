import apiClient from "../lib/axios";

export const loginRequest = async (email: string, password: string) => {
  let response;
  try {
    response = await apiClient.post("/auth/login", { email, password });
  } catch (error) {
    return error;
  }
  return response;
};

export const registerRequest = async (
  full_name: string,
  email: string,
  password: string
) => {
  let response;
  try {
    response = await apiClient.post("/auth/register", {
      full_name,
      email,
      password,
    });
  } catch (error) {
    throw new Error('Error registro')
  }
  return response;
};
