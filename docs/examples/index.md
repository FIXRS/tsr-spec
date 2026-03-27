---
id: examples
title: Examples
description: Detailed TSR surface patterns, event flows, and patch-driven updates.
---

# Examples

Examples are where TSR stops being abstract. The patterns below show how the same core model supports different classes of assistant work without falling back to raw app code.

## Example 1: Option comparison surface

### User intent

"Compare several used phone listings and help me choose one."

### Surface shape

The generator emits:

- a `summary` view in the header,
- a `filterRail` bound to a listings collection,
- a `compareMatrix` in the main zone,
- an `actionBar` with save, open, and buy actions.

### Critical state

- selected listings,
- focused listing,
- active filters,
- sort order.

### Interaction sequence

1. The user narrows condition to `refurbished`.
2. The runtime emits `collection.filter.changed`.
3. The assistant requests more results from tools.
4. A patch appends entities and updates the collection.
5. The runtime preserves existing selections where still valid.

### Why TSR helps

The task needs scanning, filtering, and comparison. Text alone is too linear, but a sandbox app would be heavier than necessary.

## Example 2: Review, approve, and send

### User intent

"Draft a message to the customer, let me review it, then send it."

### Surface shape

The generator emits:

- a `diff` or `summary` view showing changes,
- a `composer` bound to a `MessageDraft` entity,
- an `approvalPanel`,
- `edit`, `approve`, and `send` actions.

### Key action semantics

- `approve` is usually a local or assistant-routed action,
- `send` is a `communicate` action and should require at least hard confirmation,
- host or tool invocation is explicit, not hidden in the composer view.

### Interaction sequence

1. The user edits the draft.
2. The runtime emits `composer.edited`.
3. The assistant patches the summary and readiness state.
4. The user requests send.
5. The runtime enforces confirmation, emits `action.requested`, invokes the send path, then emits `action.completed` or `action.failed`.

### Why TSR helps

This keeps drafting, review, and guarded sending inside one explainable surface instead of scattering them across chat text and hidden side effects.

## Example 3: Schedule and book

### User intent

"Find a time next week and book it."

### Surface shape

The generator emits:

- slot entities or time-range entities,
- a `calendar` or `entityList` view,
- conflict indicators,
- `hold` and `book` actions,
- policy rules that mark booking as high risk.

### Event and patch flow

1. The runtime mounts candidate slots.
2. The user selects a slot, producing `entity.selected`.
3. The assistant checks conflicts and availability.
4. A patch updates the selected slot status and may show a `notice`.
5. The user requests `book`.
6. The runtime requires hard confirmation, then routes the action to a tool or host integration.

### Why TSR helps

Scheduling depends on visible alternatives and availability checks. The user should not have to infer state from a sequence of paragraphs.

## Example 4: Operational triage board

### User intent

"Show me the open incidents and help me triage them."

### Surface shape

The generator emits:

- incident entities,
- a `board` or `dataTable` view,
- quick filters,
- an `inspector` for the focused issue,
- actions such as assign, snooze, escalate, and resolve.

### Behavioral notes

- many actions are `mutate`,
- some may require approvals based on policy,
- the runtime should preserve triage context as patches update individual items.

### Interaction sequence

1. The user filters to critical incidents.
2. The runtime emits `collection.filter.changed`.
3. The assistant patches counts, notices, and board columns.
4. The user resolves one issue.
5. The runtime invokes the action path and applies an `entity.upsert` or `collection.reorder` patch to move it out of the active queue.

### Why TSR helps

This example shows TSR is not only for consumer browse surfaces. It also supports operational workflows that need structured state and guarded actions.

## Example 5: Promotion from temporary surface to artifact

### User intent

"This dashboard is useful. Save it so I can come back to it."

### Surface shape

The user may have started with an `explore_data` or `monitor_triage` surface. After several refinements, the runtime promotes it.

### Promotion flow

1. The runtime captures the current surface state, filters, and layout.
2. The surface lifecycle changes from `ephemeral` to `saved` or `artifact`.
3. The runtime records a `resumeKey`.
4. Future sessions can rehydrate the same surface without losing identity or trust metadata.

### Why TSR helps

Useful generated interfaces should not vanish into chat history. Promotion is how temporary task surfaces become reusable assets.

## Example 6: Sandbox micro-app escalation

### User intent

"Open a workflow editor so I can design the full sequence visually."

### Surface shape

The assistant may start in a native TSR planning surface with:

- a summary of the workflow intent,
- a small `form` or `stepper` for setup,
- an action labeled `Open editor`.

### Escalation flow

1. The user requests the editor.
2. The runtime emits `action.requested`.
3. Policy verifies that sandbox launch is allowed.
4. The runtime applies or receives an `app.launch` operation.
5. The host opens the bounded micro-app with explicit capabilities and bridge rules.

### Why TSR helps

This keeps the sandbox lane as a governed escalation path. The system does not start with arbitrary code, but it still has a principled way to go beyond the native grammar when genuinely necessary.

## What these examples demonstrate

Across all of these patterns, TSR keeps the same core loop:

1. surface describes the task,
2. runtime renders it natively,
3. user interaction produces semantic events,
4. assistant and tools respond with patches,
5. the task stays inside one coherent governed interface.

That continuity is the main product value of TSR.
