---
id: conformance
title: Conformance
description: What it means to conform to TSR and the immediate next increment to make the spec testable.
---

# Conformance

TSR needs a conformance story, not just a vocabulary. Without one, different runtimes and generators will all claim support while meaning subtly different things.

## Why conformance matters

Conformance is how TSR becomes:

- interoperable across hosts,
- testable across implementations,
- governable in high-trust environments,
- and evolvable without silent breakage.

If the protocol cannot be tested, it is still only an idea.

## Conformance targets

TSR has multiple conforming roles. An implementation does not need to implement all of them, but it should say which ones it supports.

### 1. Surface document producer

A producer emits valid TSR surface documents.

To conform, it should:

- emit the declared TSR protocol version,
- produce structurally valid surfaces,
- keep ids and references resolvable,
- respect action and policy rules,
- and avoid inventing unsupported semantics without namespacing.

### 2. Patch producer

A patch producer emits valid semantic updates against mounted surfaces.

To conform, it should:

- reference the correct target surface,
- use valid patch operations,
- include revision information when sequencing matters,
- and avoid partial structural assumptions the runtime cannot validate.

### 3. Runtime

A runtime consumes surfaces, renders them, emits events, applies patches, and enforces policy.

To conform, it should:

- validate authored documents and patches,
- reject structurally invalid or policy-invalid input,
- preserve semantic meaning during rendering adaptation,
- emit standard event types with correct payloads,
- apply patches deterministically,
- and enforce capability, confirmation, and sandbox boundaries.

### 4. Host adapter

A host adapter provides trustworthy environment context and trusted capability mediation.

To conform, it should:

- expose a stable host contract,
- report capability availability honestly,
- enforce host-side capability gates,
- and not allow the generator to bypass runtime controls.

### 5. Validator and devtools

A validator or devtooling implementation supports conformance by checking authored documents, patches, and event traces.

To conform, it should:

- implement the published schema and cross-field rules it claims to support,
- report failures deterministically,
- and stay aligned with the protocol version it validates.

### 6. Sandbox adapter

A sandbox adapter launches richer micro-apps through the governed TSR escape hatch.

To conform, it should:

- verify app resource identity,
- enforce declared capability limits,
- keep bridge communication bounded,
- and preserve surrounding TSR audit and lifecycle behavior.

## Minimum conformance matrix

The minimum useful conformance floor for a TSR ecosystem is:

- one producer that emits valid surfaces,
- one runtime that validates and renders them,
- one validator that can catch structural and policy errors,
- and one fixture set that proves the first three agree.

That is the smallest unit that turns the spec into an interoperable system.

## Compatibility rules

Good conformance also requires clear compatibility behavior.

Recommended rules:

- unsupported built-in semantics should fail explicitly, not silently degrade into different meaning,
- custom extensions should be namespaced,
- runtimes may omit unsupported advanced features, but should advertise that clearly,
- protocol version mismatches should be rejected or negotiated explicitly,
- revision mismatches should reject stale patches rather than guessing.

## What a runtime may vary

Runtimes are allowed to differ in:

- visual design,
- component implementation,
- adaptive layout form,
- persistence backing store,
- transport details,
- observability tooling.

Runtimes should not differ in:

- action class meaning,
- confirmation floors,
- capability mediation,
- event semantics,
- patch semantics,
- or sandbox trust boundaries.

Those are protocol concerns, not product skinning choices.

## Reference fixture corpus

The first concrete fixture corpus now lives in `tsr-spec/fixtures/`.

That corpus is the first executable layer of the spec.

### What the fixture corpus should include

At minimum:

- canonical surface documents for the core happy paths,
- canonical event traces for common interactions,
- canonical patch sequences for incremental updates,
- invalid events, documents, and patches for negative testing,
- expected validator outcomes,
- expected runtime state transitions where relevant.

### The first fixture set should cover

1. option comparison
2. review, approve, and send
3. schedule and book
4. promotion from ephemeral to artifact
5. sandbox micro-app escalation

### Current repo layout

```text
fixtures/
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
  manifest.v0_1.json
```

### Why this is the right next step

A fixture corpus forces the spec to answer questions prose can hide:

- what exact ids resolve where,
- what fields are required in practice,
- what event payloads actually look like,
- how revisions behave,
- which failures are rejected,
- and what a conforming validator or runtime must do.

That makes the next round of work much more valuable than adding more broad narrative text.

## Validator harness

The corpus now has a minimal executable validator harness:

```bash
npm run validate:fixtures
```

That runner:

1. reads `fixtures/manifest.v0_1.json`,
2. loads each referenced fixture plus any context surface it needs,
3. validates core structural, policy, and sequencing rules,
4. applies runtime-state assertions for patch-like fixtures when expectations declare them,
5. compares outcomes against the matching expectation file,
6. reports deterministic pass or fail results.

That is the first real conformance loop for TSR.

## Immediate next increment

The immediate next step has now been completed in stronger form:

1. canonical event fixtures exist,
2. canonical patch fixtures exist,
3. invalid event fixtures exist,
4. multi-step patch sequence fixtures exist,
5. patch and patch-sequence expectations assert final runtime state,
6. invalid surfaces and invalid patches exist,
7. expected diagnostics exist for those failure cases.

That moves TSR beyond happy-path surface validation and into first-pass interoperability, behavioral validation, and failure-mode testing.

## After the next corpus expansion

The natural increments after that are:

1. publish a formal JSON Schema package,
2. grow the validator into a reference validator package,
3. add invalid patch sequences and richer trace-style event sets,
4. cover more patch ops such as view mutation and action replacement,
5. publish a minimal reference runtime,
6. add interoperability tests against the shared fixtures.

That sequence turns TSR from a good draft into a real standard candidate.
