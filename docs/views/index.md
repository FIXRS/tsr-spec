---
id: views
title: Views
description: Built-in presentation primitives for TSR surfaces.
---

# Views

Views are the renderable building blocks of a TSR surface. They tell the runtime how entities, collections, and surface state should be presented without forcing the generator to emit framework-specific UI code.

## Why TSR needs views

Without views, TSR would only describe data and actions. That would force every runtime to guess the right interaction structure.

A view tells the runtime things such as:

- this is a list of options,
- this is a compare surface,
- this is a form,
- this is a chart with a textual fallback,
- this is an approval panel,
- this is a thread with a composer.

## Canonical view shape

```json
{
  "id": "compare",
  "type": "compareMatrix",
  "zone": "main",
  "sourceCollection": "results",
  "props": {
    "columns": ["price", "condition", "storage", "shipping", "score"],
    "stickyFirstColumn": true
  },
  "actions": ["save", "open", "buy"],
  "emptyState": "Select at least two items to compare."
}
```

## Built-in starter view registry

TSR should ship with a small but useful built-in view set.

### Informational views

- `header`: top-level title, summary, and metadata framing.
- `summary`: compact overview or generated synopsis.
- `notice`: authored warnings, errors, success states, or advisory messages.
- `detailPane`: focused inspection of one entity.
- `tabs`: mutually exclusive subviews within the same surface.

### Browsing views

- `entityList`: vertically ordered set of entities.
- `entityGrid`: card-like or dense tile presentation.
- `dataTable`: structured tabular browse and sort.
- `gallery`: visual browse for media-first entities.
- `filterRail`: filtering controls bound to a collection.
- `sortBar`: explicit sort choices for a collection.
- `pagination`: cursor, page, or load-more controls.

### Decision views

- `compareMatrix`: side-by-side comparison across entities.
- `inspector`: structured inspection of one selected item.
- `diff`: before/after or current/proposed comparison.
- `approvalPanel`: guarded review and approval controls.

### Input and operation views

- `form`: structured field input.
- `wizard`: ordered multi-step task completion.
- `stepper`: task progress plus current stage.
- `actionBar`: grouped surface actions.
- `thread`: conversation or activity feed tied to the task.
- `composer`: text or structured drafting surface.

### Temporal, spatial, and analytic views

- `chart`: plotted metric or series view.
- `timeline`: chronological sequence.
- `calendar`: date or slot oriented presentation.
- `map`: spatial placement of entities.
- `board`: columnar triage or workflow state view.

That set is already enough to cover a large portion of assistant-native product work.

## Binding rules

A view SHOULD bind explicitly to one or more of:

- `sourceEntity`
- `sourceCollection`
- surface-level state

The runtime SHOULD NOT infer bindings from loose string matching or undocumented conventions.

### Recommended rule

Every view should have one primary data source. Secondary references can exist through props or action targets, but the main source of truth should remain obvious.

## Composition patterns

Most useful surfaces are compositions, not single widgets. Common patterns include:

- `filterRail` + `entityGrid` + `detailPane`
- `summary` + `chart` + `dataTable`
- `diff` + `composer` + `approvalPanel`
- `compareMatrix` + `actionBar`
- `board` + `inspector` + `notice`

TSR should make these compositions easy without requiring a full layout DSL.

## Structural notices vs runtime notices

TSR should distinguish between:

- a `notice` view that is part of the authored surface structure,
- and patch-driven transient notices such as `notice.show`.

The authored `notice` view is for content the generator wants persistently represented in layout. `notice.show` is for runtime-level feedback such as completion, warning, or failure messages that may be temporary.

## Zones and adaptive rendering

Views live in zones rather than absolute coordinates. That gives the runtime freedom to adapt while preserving semantics.

Examples:

- an `aside` filter rail may become a mobile drawer,
- a dense `dataTable` may degrade into stacked cards on narrow screens,
- a `detailPane` may become a modal on touch devices,
- a `compareMatrix` may turn into a swipeable summary plus expandable detail rows.

The runtime MAY change rendering form, but SHOULD preserve meaning and action availability.

## View props

Each built-in view type will need typed props over time. Examples:

- compare matrix columns,
- table columns,
- chart series mappings,
- filter facet definitions,
- stepper stage metadata,
- map pin bindings,
- diff modes.

Early TSR drafts can keep these flexible, but a serious v0.1 should define prop contracts for the most common built-in views.

## Accessibility and voice expectations

Views are part of the accessibility contract.

Examples:

- charts should expose summaries and textual alternatives,
- maps should have list or summary fallbacks,
- compare matrices should have speakable rollups,
- forms should expose labels, descriptions, and validation state,
- action bars should remain keyboardable and screen-reader clear.

If a host supports voice mode, the surface should still make sense when visual detail is reduced.

## Custom views

TSR MAY allow custom view types, but portability drops quickly when custom semantics become common.

Good guidance:

- use built-ins by default,
- namespace custom views clearly,
- keep custom props explicit and documented,
- and move to `app.launch` when the behavior is too specialized for the native grammar.

## Validation rules

Runtimes and validators should enforce at least these rules:

- the view type is built-in or clearly namespaced,
- the target zone exists,
- the bound entity or collection exists,
- referenced actions resolve,
- required props for the view type are present,
- and empty or missing data states are handled intentionally rather than failing silently.

Views are the place where semantic intent becomes interaction structure, so they need a crisp contract.
