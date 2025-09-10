import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1", // Adjust based on your backend endpoint
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchProfile = async (userId: string) => {
  const response = await api.get(`/profiles/${userId}`);
  return response.data;
};

export const updateProfile = async (userId: string, profileData: any) => {
  const response = await api.put(`/profiles/${userId}`, profileData);
  return response.data;
};

export default api;
