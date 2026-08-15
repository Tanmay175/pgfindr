import api from "./axios";

export function createBooking(payload) {
  return api.post("/bookings", payload);
}

export function getMyBookings() {
  return api.get("/bookings/my");
}

export function cancelBooking(id) {
  return api.put(`/bookings/${id}/cancel`);
}
