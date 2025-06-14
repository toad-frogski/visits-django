import Cookies from "js-cookie";
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const csrf = Cookies.get("csrftoken");
  if (csrf && config.method !== "get") {
    config.headers.set("X-CSRFToken", csrf);
  }

  return config;
});

export default client;
