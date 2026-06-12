# AstraCart Delta Requirements - Fraud Review, Consent, and Support Operations

Date: 2026-06-05
Source type: Risk and operations addendum
Change intent: Add operational controls that require new backlog, test case, and traceability coverage beyond the original checkout/payment MVP.

## Requirement FRD-RISK-011 - Step-Up Verification for Risky Orders

AstraCart must trigger step-up verification when fraud risk signals exceed configured thresholds before payment capture or fulfilment.

### Risk Signals

- High order value above configured threshold.
- Mismatch between billing country, shipping country, and card issuing country.
- Multiple failed payment attempts within the same session.
- New account with high-value electronics or gift card-like items.
- Velocity anomaly from same device fingerprint or IP address.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| RISK-AC-01 | Risk score is below threshold | Customer proceeds without step-up verification |
| RISK-AC-02 | Risk score exceeds threshold before payment | Customer must complete OTP or email verification before payment capture |
| RISK-AC-03 | Step-up verification expires | Payment capture is blocked and customer can request a new challenge |
| RISK-AC-04 | Customer fails verification three times | Order is placed on fraud hold and support audit records reason code |
| RISK-AC-05 | Fraud hold is released by support | Order resumes fulfilment and customer receives status update |

## Requirement FRD-PRIV-012 - Consent and Analytics Preference Controls

Customers must be able to manage analytics and marketing consent without disrupting checkout or order support flows.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| PRIV-AC-01 | Customer opts out of marketing analytics | Non-essential campaign events are suppressed while required order events continue |
| PRIV-AC-02 | Customer changes consent during checkout | Checkout remains active and consent audit event is recorded |
| PRIV-AC-03 | Customer requests consent history | Account page shows latest consent state and last modified timestamp |
| PRIV-AC-04 | Anonymous guest rejects analytics cookies | Guest checkout continues with essential-only telemetry |

### Accessibility Requirements

- Consent controls must be reachable by keyboard.
- Toggle state must be announced by screen readers.
- Error summaries must identify failed consent save attempts.

## Requirement FRD-SUP-013 - Support Console Event Replay

Support agents need a read-only event replay for checkout, payment, wallet, shipment, fraud, and refund events.

### Acceptance Criteria

| ID | Scenario | Expected Result |
| --- | --- | --- |
| SUP-AC-01 | Support opens event replay for an order | Timeline shows checkout quote, payment, wallet, shipment, fraud, refund, and support events in chronological order |
| SUP-AC-02 | Event contains sensitive payment data | Sensitive fields are masked by default |
| SUP-AC-03 | Agent filters events by type | Timeline updates without losing order context |
| SUP-AC-04 | Event replay service is unavailable | Support console shows retry-safe failure and does not expose raw error payload |

### Test Coverage Guidance

- Add backlog stories for step-up verification, fraud hold release, consent controls, and support event replay.
- Add story test cases for risk thresholds, consent opt-out, telemetry suppression, data masking, support filtering, and failure recovery.
- RTM must map FRD-RISK-011, FRD-PRIV-012, and FRD-SUP-013 to generated stories and generated test cases.
