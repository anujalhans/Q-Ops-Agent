# AstraCart Delta Requirements - Loyalty Wallet and Store Credit

Date: 2026-06-05
Source type: Supporting requirement addendum
Change intent: Introduce loyalty wallet, store credit, and split tender behavior that is not covered in the original MVP scope.

## Requirement FRD-LOY-007 - Loyalty Wallet Balance and Redemption

AstraCart customers can earn loyalty points from completed orders and redeem eligible wallet balance during checkout.

### Business Rules

- Wallet balance is visible on cart review and payment method selection when the customer is logged in.
- Guest checkout must not show loyalty wallet redemption.
- Wallet redemption can be combined with card, UPI, or net banking payment when wallet balance is lower than order total.
- Wallet-only payment is allowed when wallet balance covers the full payable amount.
- Wallet redemption must be reversed automatically when payment fails or when the order is cancelled before fulfilment.
- Loyalty points are earned only after order status becomes delivered and return window has expired.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| LOY-AC-01 | Logged-in customer opens cart with wallet balance | Wallet balance, eligible redemption amount, and final payable amount are shown |
| LOY-AC-02 | Guest customer opens cart | Wallet section is hidden and checkout continues without wallet prompt |
| LOY-AC-03 | Customer applies partial wallet redemption | Payment order is created for remaining payable amount only |
| LOY-AC-04 | Customer uses wallet-only payment | Order is confirmed without external gateway redirect |
| LOY-AC-05 | Gateway payment fails after wallet redemption | Wallet hold is released and cart remains recoverable |
| LOY-AC-06 | Customer cancels before fulfilment | Wallet debit is reversed and reversal event is visible in support audit |

### API and Data Impact

| API | Method | Path | Notes |
| --- | --- | --- | --- |
| Wallet balance | GET | `/v1/wallet/balance` | Requires active session and returns available, held, and expiring balance |
| Wallet hold | POST | `/v1/wallet/holds` | Creates idempotent wallet hold for checkout quote |
| Wallet release | POST | `/v1/wallet/holds/{holdId}/release` | Releases wallet hold after failure or cancellation |
| Wallet capture | POST | `/v1/wallet/holds/{holdId}/capture` | Captures wallet amount after order confirmation |

### Test Coverage Guidance

- Add backlog coverage for wallet visibility, partial redemption, wallet-only payment, reversal, and expiry messaging.
- Add story test cases for positive, negative, boundary, accessibility, security, and reconciliation categories.
- RTM must map FRD-LOY-007 to wallet-related stories and generated wallet test cases.

## Requirement FRD-LOY-008 - Store Credit Refund Destination

Customers may choose store credit as a refund destination for eligible prepaid orders.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| LOY-AC-07 | Customer selects store credit refund | Refund destination is persisted and shown in return summary |
| LOY-AC-08 | Store credit refund succeeds | Wallet balance increases and order timeline shows refund-to-wallet event |
| LOY-AC-09 | Store credit refund fails | Support audit records failure reason and customer sees retry-safe message |

### Risks and Edge Cases

- Wallet hold and gateway payment capture must remain idempotent during browser refresh.
- Wallet balance must not leak across user sessions.
- Store credit refund must not be available for COD or fraud-held orders.
