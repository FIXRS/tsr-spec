---
id: integration
title: Integration
description: How TSR fits into an assistant architecture and how to adopt it without collapsing layers together.
---

# Integration

TSR only becomes useful when it fits cleanly into a real assistant stack. This section describes the boundaries among the generator, runtime, host, tools, and sandbox layer.

## The core architecture

A healthy TSR system separates five concerns:

1. the specification,
2. the generator or compiler,
3. the runtime,
4. the host adapter,
5. external tools and sandbox apps.

You can ship them together in one product, but they should still remain conceptually distinct.

## End-to-end request flow

The basic integration loop looks like this:

1. the user asks for help,
2. the assistant interprets task intent,
3. normalizers convert raw tool or retrieval output into entities and collections,
4. the generator emits a TSR surface,
5. the runtime validates and mounts it,
6. the user interacts with the surface,
7. the runtime emits semantic events,
8. the assistant, host, or tools respond with patches or action outcomes,
9. the runtime updates or closes the surface.

That loop should be stable regardless of whether the runtime is local, remote, or embedded in another application.

## Deployment patterns

TSR should support at least three practical deployment shapes:

1. local runtime and generator in the same client shell,
2. local runtime with a remote generator service,
3. remote or embedded runtime controlled by a host bridge.

The protocol should remain stable across all three.

## Where TSR sits relative to tools

TSR does not replace tools. It gives tool use a coherent interface layer.

In a tool-centric stack, the flow becomes:

- tools fetch or mutate data,
- normalizers shape results into TSR-friendly entities,
- the generator chooses views and actions,
- the runtime governs presentation and interaction.

This means tools stop needing to ship bespoke UI for every task. They can focus on capability and data.

## Where TSR sits relative to skills and planning

If the assistant has skill systems or planner modules, TSR can plug in at multiple points:

- skills can teach the assistant which surface shapes fit which tasks,
- planners can decide whether a turn needs chat, a TSR surface, or a sandbox app,
- tool adapters can expose normalized entities,
- policy modules can influence action classes and confirmation strength.

TSR should compose with those systems, not compete with them.

## Generator responsibilities

The generator or compiler should be responsible for:

- deciding whether a surface is warranted,
- selecting intent and view composition,
- mapping normalized data into entities and collections,
- declaring actions and policy,
- and emitting patches in response to runtime events.

The generator should not be responsible for direct rendering or unrestricted host execution.

## Runtime responsibilities at the integration boundary

The runtime should expose a stable API surface for:

- mount surface,
- emit events,
- apply patches,
- request capabilities,
- launch sandbox apps,
- persist or promote surfaces.

Internally it may be implemented however the host chooses, but those behaviors should remain predictable to the generator.

## Host adapter responsibilities

The host adapter is where environment-specific behavior belongs. It should provide:

- viewport and display context,
- theme and locale,
- trusted capabilities,
- navigation behavior,
- safe area information,
- persistence hooks,
- sandbox container management.

Keeping that boundary clean prevents the generator from depending on one product shell.

## Sandbox integration

A good integration strategy treats sandbox apps as a formal extension lane:

1. the generator decides the native grammar is insufficient,
2. the runtime validates sandbox policy,
3. the host launches the bounded app container,
4. the surrounding TSR lifecycle and audit trail remain intact.

The sandbox path should be powerful, but it should not become the default shortcut around the native model.

## Migration from hard-coded UI

Teams adopting TSR do not need to replace everything at once. A practical migration path is:

1. identify one workflow where chat is clearly insufficient,
2. normalize the relevant data model,
3. implement a narrow set of built-in views,
4. add events and patches,
5. move existing hard-coded screens behind the same action and policy model,
6. expand only after the runtime loop is stable.

Starting narrow is better than inventing a huge surface grammar up front.

## Suggested build order

If you are building TSR from scratch, a pragmatic sequence is:

1. define schema and validator rules,
2. publish a shared fixture corpus,
3. build a validator harness against that corpus,
4. add event, patch, and invalid-case fixtures,
5. build one deterministic runtime,
6. add a small built-in view registry,
7. build one generator for a narrow domain,
8. wire the event and patch loop,
9. add policy enforcement and capability handling,
10. add persistence and promotion,
11. add sandbox integration for overflow cases.

## Repo strategy

If TSR is intended to become a real standard, keep the layers separable:

- `tsr-spec`: canonical protocol and docs
- `tsr-schema`: types and schemas
- `tsr-validator`: cross-field and policy checks
- `tsr-runtime-core`: state store, reducer, event loop
- `tsr-renderer-web`: reference renderer
- `tsr-host-adapter`: host bridge and capability contract
- `tsr-compiler`: structured generator
- `tsr-normalizers`: source-to-entity conversion
- `tsr-devtools`: fixtures, replay, inspectors
- `tsr-sandbox-adapter`: micro-app launch path

First-party implementations can bundle these, but the standard should remain portable.

## The integration test that matters

A good TSR stack should be able to answer yes to all of these:

1. Can one assistant generate the same surface for multiple hosts?
2. Can the runtime render it without generator-specific logic?
3. Can user interaction round-trip as semantic events?
4. Can the assistant update the mounted surface through patches instead of full re-renders?
5. Can the host still enforce capabilities, confirmations, and sandbox boundaries?

If the answer is yes, the integration boundary is healthy.
