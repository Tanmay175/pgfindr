import api from "./axios";

export function getOwnerBookings(status) {
  return api.get("/owner/bookings", { params: status ? { status } : {} });
}

export function approveBooking(id) {
  return api.put(`/owner/bookings/${id}/approve`);
}

export function rejectBooking(id) {
  return api.put(`/owner/bookings/${id}/reject`);
}
