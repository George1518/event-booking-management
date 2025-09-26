// In your API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // send session cookies
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default {
  // users
  register: (data) => request("/user/register", { method: "POST", body: JSON.stringify(data) }),
  login: (creds) => request("/user/login", { method: "POST", body: JSON.stringify(creds) }),
  logout: () => request("/user/logout", { method: "POST" }),
  profile: () => request("/user/profile"),
  checkAuth: () => request("/user/check-auth"),

  // events
  getEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request("/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: "DELETE" }),

  // bookings
  createBooking: (payload) => request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  previewBooking: (payload) => request("/bookings/preview", { method: "POST", body: JSON.stringify(payload) }),
  myBookings: () => request("/bookings/my-bookings"),
  getBooking: (id) => request(`/bookings/${id}`),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: "PUT" }),
};
