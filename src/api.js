const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let payload = body;
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const data = await res.json();
      if (data.detail) {
        detail = Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join(", ") : data.detail;
      }
    } catch {
      /* no body */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // auth
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),
  me: () => request("/auth/me", { auth: true }),

  // listings
  getListings: () => request("/listings", { auth: true }),
  getListing: (id) => request(`/listings/${id}`, { auth: true }),
  createListing: (formData) =>
    request("/listings", { method: "POST", body: formData, auth: true, isForm: true }),
  updateListing: (id, formData) =>
    request(`/listings/${id}`, { method: "PATCH", body: formData, auth: true, isForm: true }),
  deleteListing: (id) => request(`/listings/${id}`, { method: "DELETE", auth: true }),
  toggleRequest: (id) => request(`/listings/${id}/request`, { method: "POST", auth: true }),

  // wishlist
  toggleWish: (id) => request(`/wishlist/${id}/toggle`, { method: "POST", auth: true }),

  // requests board
  getRequests: () => request("/requests", { auth: true }),
  createRequest: (data) => request("/requests", { method: "POST", body: data, auth: true }),
  offerRequest: (id) => request(`/requests/${id}/offer`, { method: "POST", auth: true }),

  // lost & found
  getLostFound: () => request("/lostfound"),
  createLostFound: (formData) =>
    request("/lostfound", { method: "POST", body: formData, auth: true, isForm: true }),
  respondLostFound: (id) => request(`/lostfound/${id}/respond`, { method: "POST", auth: true }),

  // activity
  getActivity: () => request("/activity"),

  // notifications
  getNotifications: () => request("/notifications", { auth: true }),
  readNotifications: () => request("/notifications/read", { method: "POST", auth: true }),

  // messages
  getConversations: () => request("/conversations", { auth: true }),
  openConversation: (userId) =>
    request("/conversations", { method: "POST", body: { userId }, auth: true }),
  getThread: (id) => request(`/conversations/${id}`, { auth: true }),
  sendMessage: (id, body) =>
    request(`/conversations/${id}/messages`, { method: "POST", body: { body }, auth: true }),

  // profile
  updateProfile: (data) => request("/auth/me", { method: "PATCH", body: data, auth: true }),
};
