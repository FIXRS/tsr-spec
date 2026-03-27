---
id: runtime-behavior
title: Runtime Behavior
description: Responsibilities, lifecycle, and execution model of a TSR runtime.
---

# Runtime Behavior

The runtime is the execution environment that turns a TSR surface into a usable interface. A good runtime is not only a renderer; it is also a validator, state store, event bridge, policy engine, and sandbox governor.

The runtime consumes both the authored surface document and the out-of-band [Host Contract](/host-contract).

## Runtime responsibilities

A conforming runtime should handle at least:

- surface ingestion and mounting,
- schema and cross-field validation,
- normalization into deterministic runtime state,
- rendering of built-in views,
- local interaction state management,
- semantic event emission,
- patch application,
- confirmation and capability enforcement,
- host adaptation,
- persistence and rehydration hooks,
- and sandbox app launches when required.

## Recommended runtime architecture

The runtime usually needs these internal pieces:

- a validator,
- a normalized store,
- a renderer registry,
- an event bridge,
- a patch reducer,
- a policy engine,
- a host adapter,
- a sandbox adapter,
- and optional persistence and observability adapters.

These may live in one package or several, but the responsibilities should stay clear.

## Runtime lifecycle

The canonical runtime loop is:

1. receive a surface document,
2. validate schema and cross-field invariants,
3. normalize arrays into indexed runtime state,
4. mount the surface,
5. render built-in views for the current host,
6. collect meaningful user interaction,
7. emit semantic events,
8. receive patches or outcomes,
9. apply deterministic updates,
10. persist, promote, close, or rehydrate when needed.

The user should experience one coherent task surface, not a series of unrelated re-renders.

## Validation phases

Validation should happen in layers.

### 1. Schema validation

Check required fields, data types, enum values, and basic shape.

### 2. Reference validation

Check that:

- ids are unique,
- zones exist,
- entity and collection references resolve,
- action bindings resolve,
- and state references are valid.

### 3. Policy validation

Check that:

- restricted actions have adequate confirmation,
- required capabilities are declared,
- external navigation obeys host policy,
- sandbox launches are allowed,
- and trust or provenance rules are not violated.

The runtime MUST NOT silently render a structurally invalid or policy-invalid surface as if it were safe.

## Rendering behavior

The runtime should render views through host-native primitives where possible. It MAY adapt layout and specific component form based on host context, but SHOULD preserve:

- task meaning,
- action availability,
- confirmation behavior,
- accessibility,
- and trust signals.

The generator should never need to think in DOM nodes or framework-specific component trees.

## Local state management

The runtime should maintain local state such as:

- focused entity,
- current selection,
- active drafts,
- pending confirmations,
- pending operations,
- non-destructive layout mode.

The runtime should also document when incoming patches override local state and when local state is preserved across structural updates.

## Event emission

The runtime should convert user interaction into semantic events and deliver them through a stable interface.

Good runtime behavior includes:

- suppressing noisy renderer detail,
- preserving event order within a surface,
- attaching stable ids and timestamps,
- and only emitting events meaningful to the assistant loop.

## Action execution loop

For actions, the runtime should behave predictably:

1. resolve the action and target,
2. enforce confirmation and capability policy,
3. emit `action.requested`,
4. invoke the declared local, tool, host, navigation, or sandbox path,
5. emit success or failure outcome events,
6. apply resulting patches or show notices.

This loop is where TSR becomes safe or unsafe in practice.

## Patch reducer behavior

A good runtime should normalize mounted state into maps and order arrays so reducers stay deterministic.

At minimum, patch application should:

- validate the patch against current state,
- check surface revision when versioning is enabled,
- apply ops in order,
- reconcile affected selections and focus,
- preserve runtime-owned ephemeral state when appropriate,
- update the rendered output incrementally.

Deterministic reduction is more important than clever rendering tricks.

## Host adaptation

The runtime should adapt surfaces based on host context such as:

- viewport size,
- device class,
- input modes,
- safe area,
- locale,
- theme,
- and display mode.

The runtime MAY collapse, expand, reorder, or restyle views to fit the host. It SHOULD NOT change the semantic contract in ways the assistant cannot reason about.

## Persistence and promotion

A mature runtime should support more than temporary mounting.

Useful capabilities include:

- serializing mounted surfaces,
- rehydrating them after navigation or restart,
- promoting ephemeral surfaces into pinned or saved artifacts,
- preserving source references, state, and action semantics during promotion.

Promotion is especially important because many useful generated surfaces should outlive the original chat turn.

## Sandboxed micro-app lane

When a native surface is not expressive enough, the runtime may launch a sandboxed micro-app.

That flow should be explicit:

1. validate that sandbox launch is allowed,
2. verify resource identity and requested mode,
3. grant only bounded capabilities,
4. keep host communication on a controlled bridge,
5. preserve the surrounding TSR lifecycle and audit model.

The sandbox lane should extend TSR, not bypass it.

## Observability and devtools

Good TSR runtimes should be easy to debug. Useful tools include:

- a surface inspector,
- event logs,
- patch replay,
- reference-resolution diagnostics,
- provenance inspection,
- action audit trails.

Debuggability is part of runtime quality, not a later convenience.

## Conformance levels

TSR could reasonably define layered runtime conformance:

- `minimal`: validate, render a small built-in set, emit events, apply patches.
- `standard`: add policy enforcement, persistence hooks, accessibility support, and sandbox launch handling.
- `advanced`: add rehydration, promotion, deep observability, offline replay, and richer host adaptation.

Conformance levels help hosts adopt TSR incrementally without diluting the core contract.
