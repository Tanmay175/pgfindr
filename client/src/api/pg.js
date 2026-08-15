import api from "./axios";

export const AMENITIES_LIST = [
  "WiFi", "AC", "Food", "Laundry", "Parking", "Power Backup", "CCTV",
  "Security", "Housekeeping", "TV", "Gym", "Study Table",
  "Attached Bathroom", "Hot Water", "Refrigerator", "Washing Machine",
];

export const ROOM_TYPES = [
  { value: "single", label: "Single Room" },
  { value: "double", label: "Double Sharing" },
  { value: "triple", label: "Triple Sharing" },
  { value: "four_sharing", label: "4 Sharing" },
];

export function createPG(formData) {
  return api.post("/pgs", formData, { headers: { "Content-Type": "multipart/form-data" } });
}

export function updatePG(id, formData) {
  return api.put(`/pgs/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
}

export function deletePGImage(pgId, imageId) {
  return api.delete(`/pgs/${pgId}/images/${imageId}`);
}

export function setCoverImage(pgId, imageId) {
  return api.put(`/pgs/${pgId}/images/${imageId}/cover`);
}

export function getOwnerPGs() {
  return api.get("/owner/pgs");
}

export function getOwnerStats() {
  return api.get("/owner/stats");
}

export function deletePG(id) {
  return api.delete(`/pgs/${id}`);
}

export function getPGs(params) {
  return api.get("/pgs", { params });
}

export function getPGById(id) {
  return api.get(`/pgs/${id}`);
}

export const CITY_SUGGESTIONS = [
  "Jorhat", "Guwahati", "Dibrugarh", "Bangalore", "Delhi", "Mumbai", "Pune", "Hyderabad",
];
