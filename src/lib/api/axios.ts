import axios from "axios";

const createClient = (baseURL: string) => {
  const instance = axios.create({ baseURL, withCredentials: true });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return instance;
};

export const authClient = createClient("http://localhost:3001/auth");
export const productClient = createClient("http://localhost:3002/products");
export const inventoryClient = createClient("http://localhost:3003/inventory");
export const alertClient = createClient("http://localhost:3004/alerts");
