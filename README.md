# Task Surface Runtime (TSR) Specification

Task Surface Runtime (TSR) is a protocol for assistant-generated task interfaces. It defines how an assistant can describe a structured, stateful interface for a live task without falling back to raw UI code or requiring a bespoke application for every workflow.

This repository contains the Docusaurus documentation site for the TSR draft specification, along with the first machine-readable fixture corpus used to make the spec testable.

## What TSR covers

TSR standardizes the semantic contract for:

- the top-level surface document,
- entities, collections, views, actions, and state,
- the out-of-band host contract,
- semantic runtime events,
- semantic incremental patches,
- governed sandbox micro-app escalation,
- security rules around capabilities, confirmation, provenance, and auditability,
- and a conformance model backed by fixtures.

TSR does **not** standardize one rendering framework, one visual design system, one model provider, or one transport. Hosts can render the same surface differently as long as the meaning, behavior, and safety guarantees stay intact.

## Core design rules

- **Semantics, not pixels.** Generators describe task intent, structure, actions, policy, and state. Runtimes decide how that renders for the host.
- **Host-neutral surfaces.** Authored surface documents stay host-neutral; host context is supplied separately through the host contract.
- **Native first, sandbox second.** Common task surfaces should use built-in primitives. Sandboxed micro-apps are the escape hatch, not the default.
- **Patch-driven continuity.** Mounted surfaces evolve through semantic patches instead of being rebuilt from scratch every turn.
- **Safety is part of the protocol.** Actions are typed, capabilities are explicit, confirmations have floors, provenance is preserved, and high-risk behavior is auditable.

## v0.1 scope

The current draft focuses on proving the core architecture on a small set of task shapes:

- option comparison,
- review, approve, and send,
- scheduling and booking,
- promotion from ephemeral surfaces into saved artifacts,
- and sandbox escalation only when the native grammar is insufficient.

The docs use **MUST**, **SHOULD**, and **MAY** in their conventional specification sense.

## Built-in vocabulary in the current draft

### Surface kinds

- `inline`
- `panel`
- `modal`
- `fullscreen`
- `artifact`

### Starter intents

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

### Starter entity types

- `Item`
- `Product`
- `Listing`
- `Profile`
- `Document`
- `MessageDraft`
- `Event`
- `Task`
- `Location`
- `Media`
- `Offer`
- `MetricSeries`

### Built-in view registry

- `header`
- `summary`
- `notice`
- `detailPane`
- `tabs`
- `entityList`
- `entityGrid`
- `dataTable`
- `gallery`
- `filterRail`
- `sortBar`
- `pagination`
- `compareMatrix`
- `inspector`
- `diff`
- `approvalPanel`
- `form`
- `wizard`
- `stepper`
- `actionBar`
- `thread`
- `composer`
- `chart`
- `timeline`
- `calendar`
- `map`
- `board`

### Action classes

- `view`
- `navigate`
- `query`
- `mutate`
- `communicate`
- `transact`
- `destructive`
- `privileged`

### Invocation kinds

- `local`
- `assistant`
- `tool`
- `host`
- `navigate`
- `launch_app`

### Semantic patch operations

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

### Starter event taxonomy

- surface lifecycle events such as `surface.mounted`, `surface.updated`, and `surface.closed`
- interaction events such as `entity.selected`, `collection.filter.changed`, and `form.submitted`
- action events such as `action.requested`, `action.confirmed`, `action.completed`, and `action.failed`
- capability and data events such as `capability.requested`, `capability.granted`, `data.loaded`, and `data.failed`

## Repository structure

- `docs/intro.md`: landing page for the specification
- `docs/introduction/`: problem statement, design goals, and scope
- `docs/core-concepts/`: stable TSR vocabulary and ownership boundaries
- `docs/surface-model/`: canonical top-level TSR surface shape
- `docs/entities/`: entity, field, media, and collection model
- `docs/views/`: built-in presentation primitives
- `docs/actions/`: typed, policy-aware user actions
- `docs/events/`: semantic event model
- `docs/patches/`: semantic patch protocol
- `docs/host-contract/`: out-of-band host environment contract
- `docs/runtime-behavior/`: validation, rendering, state, and patch application behavior
- `docs/security-model/`: trust boundaries, confirmations, capabilities, provenance, and sandbox rules
- `docs/conformance/`: conformance roles and fixture-driven validation
- `docs/examples/`: concrete end-to-end TSR patterns
- `docs/integration/`: how TSR fits into a larger assistant stack
- `fixtures/`: canonical happy-path, patch, event, invalid, and expectation fixtures
- `scripts/validate-fixtures.mjs`: current fixture validation harness

## Fixture corpus

The fixture corpus is the first executable layer of the spec. It includes:

- canonical surface documents,
- canonical semantic events,
- canonical patches and patch sequences,
- intentionally invalid fixtures for negative testing,
- and expectation files describing what validators and runtimes should recognize or reject.

Current fixture themes include:

- option comparison,
- review, approve, and send,
- schedule and book,
- promotion to a saved artifact,
- and sandbox micro-app escalation.

Run the harness with:

```bash
npm run validate:fixtures
```

## Local development

TSR docs currently run as a Docusaurus site and require Node.js 20 or newer.

Install dependencies:

```bash
npm install
```

Start the local docs site:

```bash
npm run start
```

Build the site:

```bash
npm run build
```

Type-check the docs project:

```bash
npm run typecheck
```

## Status

This repository reflects the current TSR draft for `tsr/0.1`: a semantics-first, host-neutral, patch-driven protocol for assistant-native task surfaces.
