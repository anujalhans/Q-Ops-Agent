# AstraCart Test Strategy Seed

## Primary Test Themes

- Identity and session lifecycle: registration, login, logout, reset, lockout, expired token.
- Catalog discovery: search, filters, sort, recommendation fallback, inventory visibility.
- Checkout reliability: quote, address serviceability, coupon/tax/shipping calculation, inventory recheck.
- Payment gateway resilience: redirect/webhook conflict, timeout, duplicate webhook, retry, fraud hold.
- Order tracking: timeline event accuracy, invoice, cancellation, return, refund.

## Negative Tests

| Area | Scenario | Expected Result |
| --- | --- | --- |
| Auth | Unknown email reset | Generic success message |
| Listing | Filter combination returns no products | Empty state with reset filters |
| PDP | Invalid SKU variant | Add to Cart disabled with reason |
| Checkout | Quote expires during payment retry | Return to cart review |
| Payment | Redirect success and webhook failure | Final status follows webhook |
| Orders | User opens another user's order URL | Safe 404 |

## Automation Notes

API tests should stub gateway webhooks. UI tests should cover keyboard-only checkout and mobile filter drawer behavior.
