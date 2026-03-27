---
id: actions
title: Actions
description: User-triggerable capabilities on a TSR surface.
---

# Actions

Actions define what the user can do on a surface. In TSR they are first-class, typed, policy-aware objects. They are not anonymous callbacks.

## Why actions matter

The moment an assistant can generate new actions dynamically, safety and clarity become core protocol concerns. The runtime must know:

- what class of action is being offered,
- what it targets,
- how it invokes work,
- what confirmation is required,
- what host capabilities are needed,
- and whether the action should be audited or reversible.

## Canonical action shape

```json
{
  "id": "buy",
  "label": "Buy now",
  "actionClass": "transact",
  "target": "focused",
  "confirmation": "hard",
  "invoke": {
    "kind": "host",
    "ref": "checkout.request",
    "params": {
      "entityRef": "$state.focused"
    }
  },
  "style": "primary",
  "reversible": false,
  "requiresCapabilities": ["checkout"]
}
```

## Action classes

TSR should define a small starter taxonomy because class drives policy.

- `view`: local non-destructive interaction such as expand, inspect, or switch view.
- `navigate`: move to another location or open another surface.
- `query`: fetch, refine, refresh, or search.
- `mutate`: save, update, assign, or otherwise change state.
- `communicate`: send or transmit information to another party.
- `transact`: spend money, book, commit, or exchange something of value.
- `destructive`: delete or irreversibly remove.
- `privileged`: invoke a high-sensitivity host capability or protected system path.

The runtime SHOULD apply default confirmation, logging, and presentation behavior based on class even if the generator does not style the action carefully.

## Targets

An action target tells the runtime what object the action applies to. Recommended target forms:

- `surface`
- `focused`
- `selected`
- `entity:<id>`
- `collection:<id>`

Generators MAY carry additional scoping inside `invoke.params`, but the main target should still be explicit.

### Target resolution rules

The runtime should resolve targets deterministically:

- `surface` resolves to the mounted surface itself,
- `focused` resolves to the current focused entity and should be unavailable when focus is null,
- `selected` resolves to the current selected set and should respect collection selection rules,
- `entity:<id>` and `collection:<id>` must resolve directly or the action is invalid.

The runtime SHOULD disable impossible actions before invocation when it can explain why they are unavailable.

## Invocation kinds

TSR should distinguish how an action is fulfilled:

- `local`: handled entirely within runtime state.
- `assistant`: routed back into assistant reasoning.
- `tool`: invokes an external tool or service adapter.
- `host`: invokes a trusted host capability.
- `navigate`: opens a location or new surface.
- `launch_app`: opens a sandboxed micro-app.

This is a trust-boundary distinction, not only an implementation detail.

## Confirmation policy

Confirmation should be part of the action contract.

Recommended confirmation levels:

- `none`
- `soft`
- `hard`
- `typed`

### Suggested policy floor by class

- `view`: usually `none`
- `query`: `none` or `soft`
- `navigate`: `none` for safe internal navigation, `soft` for external navigation
- `mutate`: at least `soft`, stronger when irreversible or high-impact
- `communicate`: at least `hard`
- `transact`: at least `hard`
- `destructive`: at least `hard`, often `typed`
- `privileged`: at least `hard`, often `typed`

The runtime MUST be allowed to raise confirmation strength based on host policy. The generator MUST NOT be able to weaken required safeguards silently.

## Capability requirements

Actions may depend on host capabilities such as:

- file upload,
- checkout,
- camera,
- geolocation,
- microphone,
- modal presentation,
- external navigation.

An action that requires unavailable or ungranted capabilities MUST NOT execute. The runtime should either disable it, route it through a capability request flow, or reject it with a clear error state.

## Availability and preconditions

Many actions are only valid in certain states. Common preconditions include:

- a focused entity exists,
- one or more selected entities exist,
- a form validates successfully,
- required capability grants are active,
- policy gates have been satisfied.

TSR surfaces should make those dependencies explicit enough that the runtime can render disabled states honestly instead of letting the user discover invalid actions only after a failed click.

## Reversibility and undo

Actions SHOULD declare whether they are reversible. This affects:

- confirmation strength,
- presentation,
- whether undo affordances are possible,
- and how the runtime logs outcomes.

Reversibility is especially important for `mutate` actions that are not fully destructive but still change external state.

## Action lifecycle

The runtime action loop should be explicit:

1. render the action with class-aware affordances,
2. resolve the target,
3. enforce capability and policy checks,
4. request confirmation if needed,
5. invoke the action through the declared path,
6. emit outcome events,
7. apply returned patches or show failure state.

That lifecycle should be deterministic and auditable.

## Audit and logging expectations

High-risk actions SHOULD be auditable, especially:

- `communicate`
- `transact`
- `destructive`
- `privileged`

Useful audit records include:

- action id,
- action class,
- target resolution,
- resolved parameters when safe to log,
- actor,
- timestamp,
- confirmation outcome,
- invocation path,
- success or failure status.

## Presentation guidance

Action styling should reinforce meaning, not hide risk.

Examples:

- destructive actions should be visually separated or danger-styled,
- transact actions may be primary but still confirmation-gated,
- communicate actions should make the destination explicit,
- disabled actions should explain whether policy, permissions, or missing state is blocking them.

The spec should not dictate exact colors, but it should care about honest, consistent semantics.

## Validation rules

Validators and runtimes should enforce at least these rules:

- every action id is unique,
- every referenced target resolves or is runtime-resolvable,
- `invoke.kind` is supported,
- required capabilities are declared,
- high-risk classes do not use `confirmation: none`,
- navigation to external URLs is explicit,
- and actions bound into views or surfaces are actually reachable in context.

TSR becomes trustworthy when actions are boringly explicit.
