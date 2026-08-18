# PGFindr — Testing Checklist

Manual test checklist. Run through this after any significant backend change.

## Authentication
- [ ] Student registration (role=student) succeeds, redirects to student dashboard
- [ ] Owner registration (role=owner) succeeds, redirects to owner dashboard
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password returns 401, generic "Invalid credentials" (does not reveal whether email exists)
- [ ] Registering with a duplicate email returns 409
- [ ] Logout clears the session (refresh -> redirected to login on protected pages)
- [ ] Rate limiting: 20+ rapid login attempts in 15 min returns 429

## Owner flows
- [ ] Add PG: all fields save correctly, at least one room type required
- [ ] Edit PG: changes persist, existing photos can be deleted, cover photo can be changed
- [ ] Delete PG: requires confirmation, removes Cloudinary images
- [ ] Upload images: non-image files rejected, files >5MB rejected
- [ ] Update availability via Edit PG: availableRooms > totalRooms is rejected
- [ ] View booking requests (My PGs -> Booking Requests)
- [ ] Accept a booking: room's availableRooms decrements by 1
- [ ] Accept a booking on a room with 0 available: rejected with 409
- [ ] Reject a booking: status flips to rejected, no room count change

## Student flows
- [ ] Search PGs by name/city/college
- [ ] Filter by price range, gender, room type, amenities, availability
- [ ] Sort by price and rating
- [ ] View a PG's full details page
- [ ] Check room-level availability on PG details
- [ ] Request a booking (room select, move-in date, duration, occupants, message)
- [ ] Cancel a pending booking
- [ ] Cancel an approved booking: room's availableRooms increments back by 1
- [ ] Save a PG to favorites, then remove it
- [ ] Duplicate favorite add returns 409, not a duplicate row
- [ ] Write a review after an approved booking's move-in date has passed
- [ ] Attempting to review before move-in date / before approval is blocked

## Security — role & ownership boundaries
- [ ] Student cannot create a PG (POST /api/pgs as student -> 403)
- [ ] Student cannot approve/reject a booking (PUT /api/owner/bookings/:id/approve as student -> 403)
- [ ] Owner A cannot edit Owner B's PG (PUT /api/pgs/:id -> 403)
- [ ] Owner A cannot delete Owner B's PG (DELETE /api/pgs/:id -> 403)
- [ ] Owner A cannot see Owner B's booking requests (GET /api/owner/bookings only returns own)
- [ ] Student A cannot view Student B's booking via GET /api/bookings/:id (-> 403)
- [ ] Student A cannot cancel Student B's booking (-> 403)
- [ ] Unauthenticated requests to any protected route return 401, not a crash or data leak
- [ ] No endpoint ever returns a user's `password` field (check /api/auth/me, /api/pgs/:id owner field, etc.)

## Concurrency (the "extremely important" one from the spec)
- [ ] Last available room in a room type: only one of two simultaneous approve
      requests should succeed; the other gets a 409, and availableRooms never
      goes negative. (Hard to trigger manually — verified by code review of
      the atomic `$gt: 0` conditional update in `ownerController.approveBooking`;
      worth a scripted concurrent-request test if you want to verify it directly.)

## General
- [ ] No `.env` file or secrets ever appear in `git log` / GitHub
- [ ] All error responses follow `{ success: false, message }` shape
- [ ] No stack traces appear in API responses (check with NODE_ENV=production)
- [ ] Empty states show a message instead of a blank page (no PGs found, no bookings, etc.)
