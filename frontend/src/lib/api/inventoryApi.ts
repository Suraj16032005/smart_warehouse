import { inventoryClient } from "./axios";

export type InventoryRow = {
  id: number;
  product_id: number;
  quantity: number;
  last_updated: string;
};

export const inventoryApi = {
  getAll: async (): Promise<InventoryRow[]> => {
    const response = await inventoryClient.get('/');
    return response.data;
  },
  create: async (data: { product_id: number; quantity: number }): Promise<InventoryRow> => {
    const response = await inventoryClient.post('/', data);
    return response.data;
  },
  update: async (id: number, data: { quantity: number }): Promise<InventoryRow> => {
    const response = await inventoryClient.put(`/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await inventoryClient.delete(`/${id}`);
  }
};
