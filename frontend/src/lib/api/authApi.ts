import { authClient } from "./axios";

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await authClient.post('/login', credentials);
    return response.data;
  },
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await authClient.post('/register', data);
    return response.data;
  }
};
