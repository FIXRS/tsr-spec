---
id: core-concepts
title: Core Concepts
description: The stable conceptual vocabulary behind TSR.
---

# Core Concepts

TSR should keep a small conceptual core even as implementations evolve. The names below are not documentation decoration; they define the boundary between the generator, runtime, host, and tool layers.

## Concept glossary

| Concept | Meaning | Primary owner |
| --- | --- | --- |
| Surface | The full task-specific interface instance currently mounted for the user. | Generator creates it, runtime mounts it |
| Entity | A typed thing the user is inspecting, comparing, editing, or acting on. | Generator or normalizer |
| Collection | An ordered or grouped set of entities with interaction rules. | Generator or normalizer |
| View | A renderable presentation primitive bound to entities, collections, or state. | Generator chooses it, runtime renders it |
| Action | A typed, policy-aware capability the user can trigger. | Generator declares it, runtime governs it |
| State | The current interaction context for the mounted surface. | Shared, with runtime-owned local portions |
| Event | A semantic record of something meaningful that happened on or around the surface. | Runtime emits it |
| Patch | A semantic update that changes an existing surface. | Generator or host emits it |
| Runtime | The system that validates, renders, updates, and governs surfaces. | Runtime implementation |
| Generator | The system that decides what surface should exist and how it should evolve. | Assistant or compiler |
| Host | The shell or application in which the runtime operates. | Host implementation |
| Sandbox app | A richer custom interface launched when the built-in grammar is not enough. | Runtime + sandbox adapter |
| Provenance | Metadata about where user-visible information came from. | Generator, normalizer, runtime |
| Lifecycle | The creation, use, update, promotion, persistence, and closure of a surface. | Shared |

## Surface

A surface is the top-level TSR object. It represents one active task environment for one user in one context.

A surface is not usually:

- a permanent application,
- a free-form component tree,
- or a raw transport envelope.

A surface is usually:

- scoped to one task or task cluster,
- incrementally updateable,
- explicit about what the user can do next,
- and able to preserve context across interaction.

## Entity

An entity is a typed object shown on the surface. Examples include a listing, document, profile, message draft, calendar slot, task, or metric series.

Entities should carry enough structure for the runtime to support:

- inspection,
- comparison,
- sorting and filtering,
- action targeting,
- provenance display,
- and accessibility summaries.

## Collection

A collection is more than an array. It carries the behavior around a set of entities:

- ordering,
- grouping,
- filter state,
- pagination,
- selection rules,
- compare limits,
- and ranking or scoring hints.

Collections are central to browsing, triage, search, and compare workflows.

## View

A view is a semantic presentation primitive such as a list, grid, compare matrix, form, chart, calendar, detail pane, or approval panel.

The view says what structure is needed. The runtime decides the host-specific rendering details.

## Action

An action is a user-triggerable capability. TSR actions are typed and policy-aware, not arbitrary callbacks.

An action should describe:

- what class of operation it is,
- what it targets,
- how it invokes work,
- what confirmation it needs,
- what capabilities it requires,
- and whether it is reversible or auditable.

## State

State is the current interaction context for the mounted surface. It includes things such as:

- focused entity,
- selected entities,
- active filters and sort,
- local drafts,
- pending confirmations,
- pending operations,
- and non-destructive UI mode.

TSR should clearly distinguish between:

- runtime-owned local state,
- generator-owned structural state,
- and external system state.

## Event

An event is a semantic record of something meaningful that happened. Good TSR events describe intent and outcome rather than low-level input mechanics.

For example, TSR should care about:

- `entity.selected`,
- `collection.filter.changed`,
- `action.requested`,
- `form.submitted`,
- `surface.closed`.

It should not expose raw DOM noise as the primary assistant-facing protocol.

## Patch

A patch is an incremental update applied to a mounted surface. It lets the assistant or host say:

- append new results,
- update one entity,
- replace one view,
- show a warning,
- change surface mode,
- or close the surface.

Patches make the surface durable across interaction instead of disposable.

## Runtime

The runtime is the system that turns a surface document into a usable interface. It is responsible for:

- validation,
- rendering,
- local state management,
- event emission,
- patch application,
- policy enforcement,
- host adaptation,
- and sandbox launches when necessary.

The runtime is not the same thing as the generator.

## Generator

The generator decides what surface should exist and how it should evolve. It may be:

- model-driven,
- rules-driven,
- template-driven,
- or hybrid.

Its job is to emit valid TSR surfaces and patches, not to directly render pixels.

## Host

The host is the environment in which the runtime runs. Examples include a desktop assistant shell, a web app, a mobile shell, or another agent host.

The host provides context such as:

- viewport and display mode,
- theme and locale,
- input modes,
- safe area,
- navigation behavior,
- and available capabilities.

## Sandbox app

A sandbox app is the escape hatch for tasks that exceed the native TSR grammar. It should be:

- explicit,
- capability-bounded,
- isolated from unrestricted host state,
- and launched through a governed runtime boundary.

TSR should prefer native primitives before using this lane.

## Provenance

Provenance explains where data came from. TSR should preserve distinctions among:

- user input,
- tool output,
- retrieved content,
- partner-provided data,
- model inference,
- and host or system metadata.

This matters for trust, ranking explanation, action safety, and auditability.

## Lifecycle

A surface moves through a lifecycle:

1. generation,
2. validation,
3. mounting,
4. interaction,
5. patch-driven updates,
6. optional persistence or promotion,
7. closure or rehydration.

Lifecycle is not implementation noise. It is part of the contract between the generator, runtime, and host.

## Ownership boundaries

TSR works best when ownership is explicit:

- The generator owns intent, structure, view selection, and action declarations.
- The runtime owns local interaction handling, deterministic state transitions, and policy enforcement.
- The host owns capabilities, navigation, windowing, and trusted system integration.
- Tools own side effects and fresh external data.

Confusion here leads directly to race conditions and unsafe behavior.

## Relationship among concepts

The steady-state TSR loop is:

1. raw inputs are normalized into entities and collections,
2. the generator emits a surface,
3. the runtime validates and mounts it,
4. the runtime renders views and governs actions,
5. the user interacts,
6. the runtime emits semantic events,
7. the generator or host returns patches,
8. the surface updates without losing continuity.

That loop is the heart of TSR.
