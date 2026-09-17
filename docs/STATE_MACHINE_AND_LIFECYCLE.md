# State Machine and Lifecycle

## Job and verification

Jobs move `draft -> pending_checklist -> published -> closed`. Publication requires a current approved checklist. Verification assignments move through active, completed, released, or expired states; the active unique index and expiry prevent claim theft or abandoned lockout.

Applications move through scoring, verification, submission, mock, Client decision/interview, offer, and placement states according to `application_state_transitions`. The transition trigger rejects edges absent from that table.

## Submission, mocks and interviews

Client submission requires `status = verified` and effective Match >=60. Submission records snapshot candidate and score fields. Mock interviews can be scheduled/booked, completed or cancelled; a completed mock with a submitted current scorecard is required before a Client interview.

Client decisions keep a current row plus history. Rejection requires a reason. Interview round numbers are server/database-derived. Active-round uniqueness and candidate/Client HR overlap checks prevent collisions. Reschedules and status changes retain history, and a completed prior round permits the next round.

## Feedback, offer and placement

Feedback belongs to the latest relevant completed interview and supports selected, rejected, and on-hold decisions with revision history.

```text
selected -> offer_received -> offer_accepted -> placed
```

Student acceptance changes the offer to accepted and the application to `offer_accepted`; it never creates a placement. Placement HR/Admin explicitly confirms placement, atomically creating the placement and moving the application to `placed`. Decline or pre-placement withdrawal returns the application to `selected` when replacement-offer eligibility applies.

Placement lifecycle history is separate from offer history. Allowed operational transitions cover placed, joined, joining deferred, offer revoked, candidate declined after acceptance, and closed, with reasons required for adverse/terminal changes.
