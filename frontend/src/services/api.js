import axios from "axios";

/* ======================================
   BASE API CONFIG (FASTAPI BACKEND)
====================================== */
const BACKEND_PORT = 8000;
const hostname = window.location.hostname;
const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

export const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.port === "3000"
    ? `http://${window.location.hostname}:8000`
    : window.location.origin);

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: false
});

/* ======================================
   BETTER CLOUD ERROR REPORTING
====================================== */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        response: {
          data: { detail: "Network Error: Cannot reach Backend. Please ensure REACT_APP_API_URL is set in Vercel and your Render server is live." }
        }
      });
    }
    return Promise.reject(error);
  }
);

/* ======================================
   TOKEN ATTACH (ADMIN OR USER)
====================================== */
API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("token");

  if (!config.headers) config.headers = {};

  const url = config.url || "";
  if (url.includes("/login") || url.includes("/register")) return config;

  const token = url.startsWith("/admin") ? adminToken : (userToken || adminToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

/* ======================================
   API ENDPOINTS
====================================== */
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const adminLogin = (data) => API.post("/admin/login", data);

export const createPass = (formData) => API.post("/passes/", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const getMyPasses = () => API.get("/passes/my");

export const getAllPasses = () => API.get("/admin/passes");
export const approvePass = (id) => API.put(`/admin/approve/${id}`);
export const rejectPass = (id) => API.put(`/admin/reject/${id}`);
export const deletePass = (id) => API.delete(`/admin/delete/${id}`);

export const scanPass = (passId) => API.get(`/scan/${passId}`);
export const getAnalytics = () => API.get("/admin/analytics");

export default API;