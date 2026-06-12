# AstraCart Delta Requirements - Marketplace Sellers and Split Shipments

Date: 2026-06-05
Source type: Supporting functional addendum
Change intent: Extend AstraCart from single-warehouse fulfilment to marketplace seller fulfilment with split shipment visibility.

## Requirement FRD-MKT-009 - Seller-Aware Cart and Checkout

AstraCart can list products fulfilled by different sellers. Cart and checkout must group items by seller and show shipment-level commitments before payment.

### Business Rules

- Product detail page displays seller name, seller rating, return window, and fulfilment promise.
- Cart groups line items by seller and shows separate shipping charges when applicable.
- Checkout quote includes seller groups, shipment groups, inventory snapshot, tax breakup, and delivery promise for each shipment.
- Coupon eligibility can be cart-level or seller-specific.
- If one seller group becomes unavailable after quote creation, the customer can remove that group and continue with remaining items.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| MKT-AC-01 | Cart contains items from three sellers | Cart groups items by seller and shows shipment count before checkout |
| MKT-AC-02 | Seller-specific coupon is applied to wrong seller item | Coupon is rejected with seller eligibility message |
| MKT-AC-03 | One seller group is no longer serviceable | Customer can remove unavailable group and continue checkout |
| MKT-AC-04 | Product detail page loads marketplace item | Seller name, rating, return window, and fulfilment promise are visible |
| MKT-AC-05 | Customer uses keyboard navigation in seller-grouped cart | Focus order follows seller group, item controls, coupon, and checkout actions |

## Requirement FRD-MKT-010 - Split Shipment Order Tracking

Orders can contain multiple shipments. Customers and support users must see shipment-level status, ETA, delay reason, and carrier tracking.

### Order Timeline Changes

| Timeline Entity | Required Fields |
| --- | --- |
| order | orderId, orderStatus, paymentStatus, totalShipmentCount |
| shipment | shipmentId, sellerId, carrierName, trackingNumber, shipmentStatus, promisedDeliveryDate, currentEta |
| shipment_event | shipmentId, eventType, eventTime, location, customerVisibleMessage |

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| MKT-AC-06 | Order has two shipments delivered on different dates | Order tracking shows separate shipment cards and final order completion after both are delivered |
| MKT-AC-07 | One shipment is delayed | Delayed shipment card shows new ETA and support link without marking entire order failed |
| MKT-AC-08 | One shipment is cancelled by seller after payment | Customer receives partial cancellation, partial refund, and updated order total |
| MKT-AC-09 | Customer filters order history by partially delivered | Orders with at least one delivered shipment and one open shipment are included |

### API Impact

| API | Method | Path | Notes |
| --- | --- | --- | --- |
| Quote | POST | `/v1/checkout/quote` | Add `sellerGroups[]`, `shipmentGroups[]`, and `sellerCouponBreakup[]` |
| Order details | GET | `/v1/orders/{orderId}` | Include shipment cards and seller fulfilment status |
| Shipment timeline | GET | `/v1/orders/{orderId}/shipments/{shipmentId}/timeline` | Returns shipment-level timeline events |

### Test Coverage Guidance

- Add backlog stories for seller grouping, seller coupon validation, split shipment tracking, partial cancellation, and partial refund.
- Add story test cases for multi-seller cart, mixed serviceability, delayed shipment, partial delivery, and accessibility of shipment cards.
- RTM must show FRD-MKT-009 and FRD-MKT-010 mapped to marketplace and split-shipment stories plus generated test cases.
