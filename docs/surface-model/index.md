---
id: surface-model
title: Surface Model
description: The canonical top-level document shape for TSR surfaces.
---

# Surface Model

The surface model defines the main TSR document. It is the contract a runtime consumes and the generator produces.

## Purpose of the surface document

A surface document should contain everything the runtime needs to:

- understand the task context,
- render a usable interface,
- bind views to data,
- govern actions safely,
- preserve interaction continuity,
- and adapt presentation to the host.

The surface document is not a component tree. It is a semantic contract.

## Canonical top-level shape

```json
{
  "version": "tsr/0.1",
  "surface": {
    "id": "surf_compare_01",
    "revision": 12,
    "kind": "panel",
    "intent": "compare_options",
    "title": "Compare used phone listings",
    "summary": "Four shortlisted listings with price, condition, and seller score.",
    "layout": {
      "template": "split",
      "zones": [
        {"id": "header", "role": "header"},
        {"id": "main", "role": "main"},
        {"id": "aside", "role": "aside"},
        {"id": "footer", "role": "footer"}
      ]
    },
    "entities": [],
    "collections": [],
    "views": [],
    "actions": [],
    "state": {},
    "policy": {},
    "sources": [],
    "accessibility": {},
    "lifecycle": {}
  }
}
```

## Required top-level concerns

Every surface should define these concerns, whether explicitly or by runtime defaults:

- `version`: the TSR protocol version of the outer document.
- `id`: stable identifier for the mounted surface instance.
- `revision`: monotonic authored revision for patch sequencing and replay safety.
- `kind`: how the surface should be presented at the host level.
- `intent`: the task shape the surface is meant to support.
- `title` and `summary`: concise user-facing framing.
- `layout`: template plus zones, not absolute coordinates.
- `entities` and `collections`: the data model the views bind to.
- `views`: the renderable structure of the surface.
- `actions`: user-triggerable capabilities.
- `state`: current interaction context.
- `policy`: confirmations, capabilities, trust rules, and surface-wide safety controls.
- `sources`: provenance references for user-visible data.
- `accessibility`: voice and accessibility metadata.
- `lifecycle`: persistence, promotion, and restore behavior.

## Host context is out-of-band

The surface document should remain host-neutral. Host context belongs in the [Host Contract](/host-contract), not inside the authored surface payload.

The generator may receive host context as input, but the emitted surface should still describe semantic task structure rather than host-specific implementation detail.

## Surface kinds

TSR should start with a small set of surface kinds:

- `inline`: embedded in the main conversation or content flow.
- `panel`: rendered in a docked or adjacent work area.
- `modal`: rendered as a temporary blocking or focused layer.
- `fullscreen`: rendered in a dedicated immersive area.
- `artifact`: rendered as a saved, durable, or promoted surface.

The runtime MAY restrict which kinds are allowed in a given host.

## Surface intents

Intent is not decorative metadata. It helps the runtime and generator align on structure, policy, and accessibility expectations.

Recommended starter intents:

- `browse_options`
- `compare_options`
- `inspect_item`
- `review_approve`
- `compose_send`
- `fill_submit`
- `schedule_book`
- `transact`
- `explore_data`
- `monitor_triage`
- `create_edit`

A host MAY support custom intents, but the built-in set should be enough for the most common assistant-native workflows.

## Layout model

TSR should express **layout intent**, not pixel coordinates.

### Templates

Useful starter templates:

- `stack`
- `split`
- `grid`
- `tabs`
- `wizard`
- `dashboard`

### Zones

Zones give the runtime structural placement targets such as:

- `header`
- `main`
- `aside`
- `footer`
- `modal`
- `floating`

The same surface can then adapt cleanly across desktop, mobile, voice, compact, and fullscreen hosts.

## Revisioning

Every mounted surface should have a revision model, even if early implementations keep it simple.

Recommended rule:

- `surface.revision` is incremented whenever the generator or host materially changes the surface through a patch,
- runtimes use it to reject stale patches,
- event payloads may include the revision they were emitted from.

Without a revision story, replay and conflict handling get muddy very quickly.

## State model

The surface state should be explicit and small. A good default state model includes:

- `selected`
- `focused`
- `filters`
- `sort`
- `drafts`
- `ui`
- `pendingOps`
- `confirmations`

### Ownership rules

TSR should treat state ownership carefully:

- runtime-owned local state includes focus, temporary selection, layout affordances, and in-progress confirmations,
- generator-owned updates include structural changes and task-level state changes returned as patches,
- host-owned state includes navigation, windowing, and trusted capability status.

If multiple parties can silently overwrite the same state, the surface will drift or behave unpredictably.

## Lifecycle and persistence

Every surface should be able to move through this lifecycle:

1. created,
2. validated,
3. mounted,
4. interacted with,
5. updated through patches,
6. optionally promoted or persisted,
7. closed or rehydrated later.

Recommended persistence values:

- `ephemeral`
- `pinned`
- `saved`
- `artifact`

Useful optional lifecycle metadata includes:

- `resumeKey`
- `promotable`
- restore hints for runtime rehydration

## Source references

The `sources` array is the registry that field-level `sourceRef` values resolve against.

Each source should ideally include:

- `id`
- `kind`
- `label`
- optional URI or internal reference
- retrieval timestamp where freshness matters

The source registry is what makes provenance portable across fields, entities, and summaries.

## Policy, provenance, and accessibility

These are surface-level concerns because they affect the whole document:

- default confirmation rules,
- per-action-class policy,
- allowed capabilities,
- external navigation policy,
- inference display rules,
- voice redaction rules,
- source badge behavior,
- voice summary,
- preferred focus,
- landmark metadata.

None of these should be bolted on as afterthoughts.

## Validation invariants

Schema validation alone is not enough. A runtime should also enforce cross-field rules such as:

- all ids within a namespace are unique,
- every view zone exists,
- every `sourceEntity`, `sourceCollection`, and referenced action resolves,
- `focused` is either null or references an existing entity,
- selected ids resolve and obey collection selection rules,
- `artifact` or `saved` surfaces have enough lifecycle metadata to restore them,
- `revision` is monotonic when present,
- high-risk actions do not bypass confirmation policy,
- and views that require data bindings do not silently mount with missing data.

## Generator checklist

Before a generator emits a surface, it should answer:

1. What exact user task is this surface optimizing for?
2. Which entities and collections are the stable objects on the surface?
3. Which view composition best serves the task?
4. Which actions are actually meaningful and safe here?
5. What state must persist locally?
6. What provenance and accessibility data must be attached?
7. Is this truly a native surface, or should it be a sandboxed micro-app instead?

If the generator cannot answer those questions cleanly, the surface is probably underspecified.

## Practical design rule

A good TSR surface is:

- task-scoped,
- understandable at a glance,
- incrementally updateable,
- explicit about actions and trust,
- and promotable when it proves useful.

A bad TSR surface is an unbounded application dump disguised as a document.
