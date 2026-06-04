# AstraCart API Contract Notes

## Identity APIs

| API | Method | Path | Success | Failure |
| --- | --- | --- | --- | --- |
| Register | POST | `/v1/auth/register` | `201 CUSTOMER_CREATED` | `409 ACCOUNT_EXISTS`, `422 VALIDATION_FAILED` |
| Login | POST | `/v1/auth/login` | `200 SESSION_CREATED` | `401 INVALID_CREDENTIALS`, `423 ACCOUNT_LOCKED` |
| Logout | POST | `/v1/auth/logout` | `204` | `401 SESSION_EXPIRED` |
| Reset Request | POST | `/v1/auth/password-reset` | `202 RESET_LINK_SENT_OR_IGNORED` | `429 TOO_MANY_REQUESTS` |

## Checkout APIs

`POST /v1/checkout/quote`

```json
{
  "cartId": "cart_123",
  "addressId": "addr_789",
  "couponCodes": ["ASTRA10"],
  "deliveryPromiseRequired": true
}
```

Response includes `quoteId`, `priceLockUntil`, `taxBreakup`, `shippingOptions`, `inventorySnapshot`, and `paymentEligibleMethods`.

## Payment APIs

`POST /v1/payments/orders` must be idempotent using `Idempotency-Key`.
Gateway webhook validates signature, event timestamp, gateway order id, transaction id, and amount.

## Order APIs

`GET /v1/orders/{orderId}/timeline` returns ordered events: placed, paid, packed, shipped, out_for_delivery, delivered, cancelled, return_requested, refund_initiated, refunded.
