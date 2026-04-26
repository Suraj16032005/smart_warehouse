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


export const authClient = createClient(`${import.meta.env.VITE_AUTH}/auth`);
export const productClient = createClient(`${import.meta.env.VITE_PRODUCT}/products`);
export const inventoryClient = createClient(`${import.meta.env.VITE_INVENTORY}/inventory`);
export const alertClient = createClient(`${import.meta.env.VITE_ALERT}/alerts`);