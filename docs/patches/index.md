---
id: patches
title: Patches
description: Incremental semantic updates to existing TSR surfaces.
---

# Patches

Patches are how a TSR surface changes over time. They are central to the runtime because assistant-generated interfaces are rarely static.

## Why patches exist

Without patches, the assistant would keep rebuilding the whole surface. That would make the experience:

- jumpy,
- hard to follow,
- difficult to reconcile with local state,
- and much harder to audit.

Patches let the generator or host say:

- append these results,
- update this one entity,
- replace this one view,
- show this warning,
- move the surface into fullscreen,
- or close it.

## Canonical patch envelope

```json
{
  "patchId": "patch_01",
  "surfaceId": "surf_01",
  "baseRevision": 12,
  "reason": "tool_result",
  "ops": [
    {
      "op": "collection.append",
      "collectionId": "results",
      "items": ["listing_04", "listing_05"]
    },
    {
      "op": "notice.show",
      "level": "info",
      "message": "Found 2 additional listings."
    }
  ]
}
```

`patchId` and `baseRevision` are strongly recommended even if an early implementation starts without them.

## Why semantic operations matter

TSR should use semantic patch ops at the specification boundary rather than raw JSON Patch.

For example:

- `collection.append` says what happened,
- `view.replace` says what changed,
- `surface.close` says what lifecycle transition occurred.

Internally, runtimes MAY compile these ops into reducer actions, JSON Patch, or other lower-level mechanisms.

## Starter patch operations

Recommended v0.1 operations:

- `state.set`
- `entity.upsert`
- `entity.remove`
- `collection.replace`
- `collection.append`
- `collection.reorder`
- `view.insert`
- `view.replace`
- `view.remove`
- `action.set`
- `notice.show`
- `surface.mode.set`
- `surface.close`
- `app.launch`

This set is intentionally compact but already expressive.

## Operation semantics

Some operations deserve explicit default semantics:

- `state.set` updates a declared state path, not arbitrary runtime internals.
- `action.set` replaces the addressable action set for the current surface unless the runtime documents a narrower merge mode.
- `notice.show` creates a transient runtime notice rather than a persistent structural `notice` view.
- `surface.mode.set` changes host presentation mode but does not change the surface id.
- `app.launch` enters the sandbox lane and must obey host and policy constraints.

## Patch application model

Patch application should be deterministic and in order.

Recommended runtime algorithm:

1. verify the target surface exists,
2. reject duplicate `patchId` values,
3. check ordering or `baseRevision`,
4. validate every op against the current mounted surface,
5. apply ops in order,
6. increment surface revision,
7. re-render and emit any relevant runtime notifications.

If any op is invalid, the runtime should have a documented failure strategy rather than partially mutating state unpredictably.

## Atomicity and failure handling

The safest default is atomic patch application:

- either the whole patch applies,
- or the runtime rejects it and leaves the mounted surface unchanged.

If a runtime supports partial application for specialized reasons, it should document that clearly and emit diagnostics. Silent half-applied patches are a recipe for broken surfaces.

## Versioning and replay

Once TSR supports remote or asynchronous runtimes, versioning becomes important.

Useful rules:

- patches SHOULD declare a target version or revision,
- patch ids SHOULD be idempotency keys,
- replayed patches with the same id SHOULD not apply twice,
- conflict handling SHOULD be deterministic and logged.

`baseRevision` should refer to `surface.revision` from the mounted surface model. If that revision no longer matches, the runtime should reject the patch or route it into a conflict strategy rather than guessing.

## Local state vs generator authority

This is the most important design edge in the patch model.

TSR should distinguish among:

- runtime-owned local interaction state,
- generator-owned structural state,
- and external side-effect state.

Good default guidance:

- generator patches can update task-level state and structure,
- runtime-local ephemeral state such as focus affordances or transient hover state should remain runtime-owned,
- pending confirmation and capability grant state should not be silently overwritten without explicit semantic intent.

## Optimistic UI and rollback

Some runtimes will optimistically update local state before a tool or host call completes. That is fine as long as the model is explicit.

Recommended pattern:

1. runtime emits `action.requested`,
2. runtime MAY mark an operation pending,
3. tool or host response yields success or failure,
4. assistant or host returns a confirming patch,
5. runtime clears pending state or shows failure notice.

Optimism without explicit pending state is a fast path to confusing surfaces.

## Validation rules

Validators and runtimes should enforce at least:

- patch targets an existing mounted surface,
- op payloads reference existing ids when required,
- inserted views reference valid zones and bindings,
- collection updates preserve collection invariants,
- removed entities are cleaned from collections and selection state,
- and `app.launch` obeys sandbox policy.

## Design rule

Patches should be small, semantic, and explainable. If a generator keeps replacing the whole surface, it is not really using TSR.
