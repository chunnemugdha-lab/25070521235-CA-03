// Centralized API client for CampusGig
// Uses relative /api path so Vite proxy (or reverse proxy in production) works seamlessly with cookies

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json"
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    // Always include credentials so express-session httpOnly cookies are transmitted
    credentials: "include"
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error(
      "Unable to connect to CampusGig server. Please ensure the backend is running on http://localhost:5000."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  logout: () =>
    request("/api/auth/logout", {
      method: "POST"
    }),

  getMe: () => request("/api/auth/me"),

  updateProfile: (profileData) =>
    request("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    }),

  // Jobs
  getJobs: (params = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, value);
      }
    });
    const query = queryString.toString();
    return request(`/api/jobs${query ? `?${query}` : ""}`);
  },

  getJobById: (id) => request(`/api/jobs/${id}`),

  getStats: () => request("/api/jobs/stats"),

  getMyJobs: () => request("/api/jobs/my-jobs"),

  createJob: (jobData) =>
    request("/api/jobs", {
      method: "POST",
      body: JSON.stringify(jobData)
    }),

  updateJob: (id, jobData) =>
    request(`/api/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData)
    }),

  deleteJob: (id) =>
    request(`/api/jobs/${id}`, {
      method: "DELETE"
    }),

  // Applications
  applyToJob: (applicationData) =>
    request("/api/applications", {
      method: "POST",
      body: JSON.stringify(applicationData)
    }),

  getMyApplications: () => request("/api/applications/my-applications"),

  getJobApplicants: (jobId) => request(`/api/applications/job/${jobId}`),

  updateApplicationStatus: (applicationId, status) =>
    request(`/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    })
};
