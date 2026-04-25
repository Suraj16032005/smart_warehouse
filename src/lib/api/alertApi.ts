import { alertClient } from "./axios";

export type Alert = {
  id: number;
  product_id: number;
  message: string;
  status: 'active' | 'resolved';
  created_at: string;
};

export const alertApi = {
  getAll: async (): Promise<Alert[]> => {
    const response = await alertClient.get('/');
    return response.data;
  },
  resolve: async (id: number): Promise<Alert> => {
    const response = await alertClient.put(`/${id}/resolve`);
    return response.data;
  }
};
