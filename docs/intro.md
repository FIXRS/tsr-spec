---
id: intro
title: Task Surface Runtime (TSR)
slug: /
description: What TSR is, why it exists, and how to read the specification.
---

# Task Surface Runtime (TSR)

Task Surface Runtime (TSR) is a protocol for assistant-generated task interfaces. It gives assistants a way to describe structured, stateful interfaces for live tasks without falling back to raw UI code or requiring a custom application for every workflow.

TSR is for the layer between chat and software. Some tasks need more than a paragraph: comparing options, reviewing a draft before sending it, stepping through a scheduling flow, triaging a queue, or working through a structured form. Those tasks need state, visible structure, and explicit action semantics. They also need guardrails. TSR is the contract for that layer.

The point is not to standardize pixels. The point is to standardize meaning: what task the surface exists to support, what the user is working with, what actions are available, what policy governs them, what state persists, and how the surface changes over time.

## Why this exists

Without a shared surface model, every host ends up inventing its own private UI protocol. That leads to fragmented implementations, inconsistent safety behavior, weak portability, and interfaces that are difficult to reason about across systems. TSR makes that layer explicit so it can be implemented, validated, and improved as a real system.

## What TSR covers

TSR defines the surface document itself, the host contract around it, a shared model for entities, views, actions, and state, a semantic event model, an incremental patch model, and a governed sandbox lane for cases where the native grammar is not enough.

## What TSR does not standardize

TSR does not require one model provider, one runtime implementation, one rendering framework, one visual design system, or one transport protocol. Different hosts can render the same semantic surface differently as long as the meaning, behavior, and safety guarantees remain intact.

## Design principles

TSR standardizes semantics, not presentation. The assistant or generator describes intent, structure, actions, and policy. The runtime decides how that should render in a desktop shell, web shell, mobile host, or other environment.

TSR is native first and sandbox second. Common task surfaces should use built-in primitives. If a task genuinely exceeds the native grammar, TSR should launch a sandboxed micro-app instead of letting arbitrary generated UI become the default execution model.

TSR also assumes continuity. Mounted surfaces should evolve through semantic patches so the user stays inside one task surface instead of being bounced through disposable screens. Safety is part of that contract, not product polish added later.

## The three rendering lanes

TSR works best with a strict three-lane model:

1. Host-native primitives for common tasks such as lists, tables, forms, charts, compare views, and approval panels.
2. Richer declarative surfaces composed from those same primitives.
3. Sandboxed micro-apps for tasks that truly exceed the built-in grammar.

The default should be simple: native first, sandbox second, arbitrary code never as the primary host contract.

## Spec language

This draft uses **MUST**, **SHOULD**, and **MAY** in their conventional specification sense. **MUST** means required for conformance. **SHOULD** means strongly recommended unless a host has a documented reason to differ. **MAY** means optional.

## v0.1 priorities

The first solid TSR release should stay focused. It does not need to solve every interface problem. It needs to prove the core architecture on a small set of tasks: comparison, review and send, scheduling and booking, promotion into durable artifacts, and sandbox escalation only when the native grammar truly runs out.

If TSR handles comparison, review-and-send, and scheduling/booking well, the core architecture is real.
