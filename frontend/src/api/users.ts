import apiClient from "../lib/axios";

export const userInfoRequest = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};
