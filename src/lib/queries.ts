import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, Product } from "./api/productApi";
import { inventoryApi, InventoryRow } from "./api/inventoryApi";
import { alertApi, Alert } from "./api/alertApi";

// Products
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAll
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => productApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });
};

// Inventory
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: inventoryApi.getAll
  });
};

export const useAddInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { product_id: number; quantity: number }) => inventoryApi.create(data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["alerts"] }); // Triggering alert update potentially
    }
  });
};

export const useUpdateInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { quantity: number } }) => inventoryApi.update(id, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  });
};

export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] })
  });
};

// Alerts
export const useAlerts = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: alertApi.getAll,
    refetchInterval: 10000 // Polling every 10 seconds for new alerts
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertApi.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] })
  });
};
