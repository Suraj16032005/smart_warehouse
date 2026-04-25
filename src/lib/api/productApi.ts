import { productClient } from "./axios";

export type Product = {
  id: number;
  name: string;
  category: string;
  description?: string;
  created_at: string;
};

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await productClient.get('/');
    return response.data;
  },
  getOne: async (id: number): Promise<Product> => {
    const response = await productClient.get(`/${id}`);
    return response.data;
  },
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await productClient.post('/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await productClient.put(`/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await productClient.delete(`/${id}`);
  }
};
