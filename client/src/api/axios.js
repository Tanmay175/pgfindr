import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send HTTP-only auth cookie
});

export default api;
