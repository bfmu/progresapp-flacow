import apiClient from "./client";

export const userInfoRequest = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};
