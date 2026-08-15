import api from "./axios";

export function getFavorites() {
  return api.get("/favorites");
}

export function addFavorite(pgId) {
  return api.post(`/favorites/${pgId}`);
}

export function removeFavorite(pgId) {
  return api.delete(`/favorites/${pgId}`);
}

export function createReview(payload) {
  return api.post("/reviews", payload);
}

export function getPGReviews(pgId) {
  return api.get(`/pgs/${pgId}/reviews`);
}
