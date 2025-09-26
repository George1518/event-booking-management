// api.js - Fixed version

// Define BASE with proper fallbacks
const BASE = "https://event-booking-management.onrender.com";

// Debug log to verify BASE is defined
console.log("API Base URL:", BASE);

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  console.log("Making request to:", url);
  
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
      },
      ...options,
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Export API methods
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