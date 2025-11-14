// src/lib/api.ts
import axios from "axios";

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "BASIC").toUpperCase();
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

let basicCreds: { email: string; senha: string } | null = null;

export function setBasicCreds(creds: { email: string; senha: string } | null) {
  basicCreds = creds;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  if (AUTH_MODE === "BASIC" && basicCreds) {
    const b64 = btoa(`${basicCreds.email}:${basicCreds.senha}`);
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Basic ${b64}`;
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
