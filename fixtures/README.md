# TSR Fixture Corpus

This directory contains the first machine-readable fixture corpus for the Task Surface Runtime specification.

## Layout

```text
fixtures/
  manifest.v0_1.json
  surfaces/
    compare-options.v0_1.json
    review-send.v0_1.json
    schedule-book.v0_1.json
    promoted-artifact.v0_1.json
    sandbox-escalation.v0_1.json
  events/
    compare-options.filter-change.v0_1.json
    review-send.send-requested.v0_1.json
  patches/
    compare-options.append-results.v0_1.json
    promoted-artifact.refresh.v0_1.json
  patch-sequences/
    compare-options.discovery-sequence.v0_1.json
    review-send.approve-sequence.v0_1.json
    sandbox-escalation.launch-sequence.v0_1.json
  invalid/
    events/
      surface-mismatch.filter-change.v0_1.json
      unknown-action-id.action-requested.v0_1.json
    surfaces/
      action-no-confirmation.transact.v0_1.json
      missing-zone-reference.v0_1.json
    patches/
      stale-patch-revision.v0_1.json
  expectations/
    compare-options.v0_1.expectation.json
    review-send.v0_1.expectation.json
    schedule-book.v0_1.expectation.json
    promoted-artifact.v0_1.expectation.json
    sandbox-escalation.v0_1.expectation.json
    compare-options.filter-change.v0_1.expectation.json
    review-send.send-requested.v0_1.expectation.json
    compare-options.append-results.v0_1.expectation.json
    promoted-artifact.refresh.v0_1.expectation.json
    compare-options.discovery-sequence.v0_1.expectation.json
    review-send.approve-sequence.v0_1.expectation.json
    sandbox-escalation.launch-sequence.v0_1.expectation.json
    surface-mismatch.filter-change.v0_1.expectation.json
    unknown-action-id.action-requested.v0_1.expectation.json
    action-no-confirmation.transact.v0_1.expectation.json
    missing-zone-reference.v0_1.expectation.json
    stale-patch-revision.v0_1.expectation.json
```

## Intent

Each file under `surfaces/` is a canonical happy-path TSR surface document.

Each file under `events/` is a canonical semantic runtime event tied to a context surface.

Each file under `patches/` is a canonical semantic patch envelope tied to a context surface.

Each file under `patch-sequences/` is a canonical multi-step patch flow that asserts final runtime state, not just structural validity.

Each file under `invalid/` is an intentionally invalid fixture used to prove the validator catches specific failures.

Each file under `expectations/` describes the validator expectations for the matching fixture:

- whether the fixture is valid,
- which protocol and surface metadata must be recognized,
- which key references must resolve,
- which core invariants must pass,
- and, for patch-like fixtures, which runtime state transitions must hold after apply.

These files are deliberately simple so a future `tsr-validator` can consume them directly.

## Current validation command

Run the fixture harness with:

```bash
npm run validate:fixtures
```

## Next Step

The next natural increment is to add:

- invalid patch sequences and stale chain cases,
- richer event traces that cover confirmation, completion, failure, and capability mediation,
- broader patch-op coverage for view and action mutations,
- and a publishable schema package that external validators can import directly.
