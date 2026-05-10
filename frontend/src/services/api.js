// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8000",
// });

// // =========================
// // AUTOMATIC TOKEN ATTACH
// // =========================
// API.interceptors.request.use((req) => {
//   const userToken = localStorage.getItem("token");
//   const adminToken = localStorage.getItem("admin_token");

//   const finalToken = adminToken || userToken;

//   if (finalToken) {
//     req.headers.Authorization = `Bearer ${finalToken}`;
//   }

//   return req;
// });

// // ================= USERS =================
// export const registerUser = (data) => API.post("/users/register", data);

// export const loginUser = (data) =>
//   API.post("/users/login", data, {
//     headers: { "Content-Type": "application/json" },
//   });

// // ================= ADMIN LOGIN =================
// export const adminLogin = (data) =>
//   API.post("/admin/login", data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });


// // ================= PASS MODULE =================
// export const createPass = (formData) =>
//   API.post("/passes/apply", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       Authorization: `Bearer ${
//         localStorage.getItem("admin_token") || localStorage.getItem("token")
//       }`,
//     },
//   });

// export const getMyPasses = () => API.get("/passes/my");
// export const getLatestPass = () => API.get("/passes/latest");


// // ================= ADMIN PASS MANAGEMENT =================
// export const getAllPasses = () => API.get("/admin/passes");

// export const approvePass = (id) =>
//   API.put(`/admin/approve/${id}`, null, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
//     },
//   });

// export const rejectPass = (id) =>
//   API.put(`/admin/reject/${id}`, null, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
//     },
//   });

// // ✅ NEW — DELETE PASS API
// export const deletePass = (id) =>
//   API.delete(`/admin/delete/${id}`, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
//     },
//   });


// // ================= QR SCAN (Guard) =================
// export const scanPass = (passId) => API.get(`/scan/${passId}`);

// export default API;

import axios from "axios";

/* ======================================
   BASE API CONFIG (FASTAPI BACKEND)
   Auto-detects host so it works on both
   localhost AND mobile devices on WiFi
====================================== */
const BACKEND_PORT = 8000;
export const BASE_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:${BACKEND_PORT}`;

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: false
});

/* ======================================
   TOKEN ATTACH (ADMIN OR USER)
====================================== */
API.interceptors.request.use((config) => {

  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("token");

  if (!config.headers) {
    config.headers = {};
  }

  const url = config.url || "";

  /* ----------------------------------
     Skip token for login/register APIs
  ---------------------------------- */
  if (
    url.includes("/admin/login") ||
    url.includes("/users/login") ||
    url.includes("/users/register")
  ) {
    return config;
  }

  /* ----------------------------------
     Attach Token
  ---------------------------------- */
  const token = url.startsWith("/admin") ? adminToken : (userToken || adminToken);

  if (token) {
    if (typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;

}, (error) => {
  return Promise.reject(error);
});


/* ======================================
   USER AUTH
====================================== */

export const registerUser = (data) => {
  return API.post("/users/register", data);
};

export const loginUser = (data) => {
  return API.post("/users/login", data);
};


/* ======================================
   ADMIN AUTH (FormData)
====================================== */

export const adminLogin = (data) => {
  return API.post("/admin/login", data);
};


/* ======================================
   PASS MODULE (USER)
====================================== */

export const createPass = (formData) => {
  return API.post(
    "/passes/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

export const getMyPasses = () => {
  return API.get("/passes/my");
};


/* ======================================
   ADMIN PASS MANAGEMENT
====================================== */

export const getAllPasses = () => {
  return API.get("/admin/passes");
};

export const approvePass = (id) => {
  return API.put(`/admin/approve/${id}`);
};

export const rejectPass = (id) => {
  return API.put(`/admin/reject/${id}`);
};

export const deletePass = (id) => {
  return API.delete(`/admin/delete/${id}`);
};


/* ======================================
   QR SCAN
====================================== */

export const scanPass = (passId) => {
  return API.get(`/scan/${passId}`);
};

export const getAnalytics = () => {
  return API.get("/admin/analytics");
};

export default API;