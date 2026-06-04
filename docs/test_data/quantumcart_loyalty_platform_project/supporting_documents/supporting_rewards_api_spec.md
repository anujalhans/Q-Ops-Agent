# QuantumCart Rewards OpenAPI Specification

This supporting API spec should classify as API_SPEC.

## POST /v1/rewards/reservations
Request payload: customerId, cartId, pointsRequested, idempotencyKey.
Response payload: reservationId, reservedPoints, expiresAt, status.

## POST /v1/rewards/commit
Commits a reservation after order confirmation.

## DELETE /v1/rewards/reservations/{reservationId}
Releases reserved points when checkout fails or expires.

Validation notes:
- idempotencyKey is mandatory.
- pointsRequested must not exceed available balance.
- expired reservations cannot be committed.
