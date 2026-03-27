---
id: events
title: Events
description: Semantic interaction events in TSR.
---

# Events

Events are how the runtime reports meaningful interaction and state transitions back to the assistant, host, and other interested systems.

## Why semantic events

Traditional GUI systems expose low-level input such as clicks, key presses, and blur events. Those are useful renderer details, but they are too noisy and too implementation-specific to be the main assistant-facing protocol.

TSR should instead emit events that preserve meaning:

- `entity.selected`
- `collection.filter.changed`
- `action.requested`
- `form.submitted`
- `surface.closed`

That keeps the assistant loop stable across runtimes and rendering frameworks.

## Event envelope

A standard TSR event envelope should look roughly like this:

```json
{
  "id": "evt_01",
  "type": "collection.filter.changed",
  "surfaceId": "surf_01",
  "actor": "user",
  "timestamp": "2026-03-27T18:20:00Z",
  "payload": {
    "collectionId": "results",
    "changes": {
      "condition": ["refurbished"]
    }
  }
}
```

Useful optional fields for mature implementations include:

- `viewId`
- `surfaceRevision`
- `requestId`
- `correlationId`
- `causationId`
- `traceId`

Those become valuable once surfaces are distributed across processes or services.

## Actors

An event may originate from:

- `user`
- `assistant`
- `tool`
- `host`
- `system`

Actor identity matters for audit, replay, and policy evaluation.

## Starter event taxonomy

### Surface lifecycle

- `surface.mounted`
- `surface.updated`
- `surface.mode.changed`
- `surface.promoted`
- `surface.closed`

### View and navigation

- `view.changed`
- `entity.focused`
- `entity.opened`

### Selection and collection interaction

- `entity.selected`
- `entity.deselected`
- `collection.selection.changed`
- `collection.filter.changed`
- `collection.sort.changed`
- `collection.page.requested`

### Forms and composition

- `form.field.changed`
- `form.field.validated`
- `form.submitted`
- `composer.edited`

### Actions

- `action.requested`
- `action.confirmed`
- `action.canceled`
- `action.completed`
- `action.failed`

### Data and capabilities

- `data.requested`
- `data.loaded`
- `data.appended`
- `data.failed`
- `capability.requested`
- `capability.granted`
- `capability.denied`

This taxonomy is enough for a solid v0.1 runtime.

## Event semantics vs state mutation

Events and state updates are related but not identical.

Examples:

- a runtime may optimistically update local selection state, then emit `entity.selected`,
- a form submit may emit `form.submitted` before any patch changes the surface,
- a failed action may emit `action.failed` without changing structural state at all.

The spec should keep this distinction explicit so runtimes do not accidentally double-apply changes.

## Ordering and reliability

At minimum, runtimes SHOULD define behavior for:

- per-surface ordering,
- duplicate event ids,
- retries after transient delivery failure,
- and idempotent consumer handling.

Recommended default:

- events are ordered within a single surface stream,
- retried deliveries reuse the same event id,
- consumers treat event id as the primary dedup key.

Events tied to one action or one patch exchange SHOULD share a correlation identifier so runtimes and devtools can reconstruct the full interaction path.

## Privacy and payload discipline

Event payloads should contain what downstream systems need, but no more.

Runtimes SHOULD avoid:

- raw secret material,
- full source documents when a reference will do,
- unnecessary PII duplication,
- and renderer-specific implementation detail.

If a payload is sensitive, the runtime should prefer references, redacted summaries, or policy-aware logging paths.

## Custom events

Hosts MAY define custom events, but they should:

- be clearly namespaced,
- preserve semantic meaning,
- avoid colliding with built-in types,
- and remain optional for portable generators.

If a host-specific interaction becomes common, it is usually a sign the spec should absorb it into the core taxonomy.

## Recommended runtime behavior

The runtime should emit events in a disciplined loop:

1. capture meaningful interaction,
2. update runtime-owned local state when appropriate,
3. emit the semantic event,
4. wait for assistant, host, or tool response,
5. apply returned patches or surface an error.

This keeps the assistant loop explainable and debuggable.

## Validation rules

Validators and runtimes should enforce at least:

- event ids are stable and unique within the relevant stream,
- event type is known or clearly namespaced,
- `surfaceId` resolves to a mounted surface,
- actor is explicit,
- timestamp is recorded,
- and payload shape matches the event type.

Semantic events are one of the biggest reasons TSR can remain portable across hosts.
