import axios, { AxiosInstance } from "axios";

const baseURL: string = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});