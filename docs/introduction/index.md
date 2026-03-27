---
id: introduction
title: Introduction
description: Why TSR exists, what problem it solves, and the architectural frame for assistant-generated task surfaces.
---

# Introduction

TSR starts from a simple observation: the next interface layer for assistants is not only conversation and not only tool calling. It is the ability to create **task-specific interfaces at runtime**.

## The product problem

Users regularly ask assistants to do work that is awkward in plain chat:

- compare several options,
- review a draft before sending,
- inspect a dataset,
- fill a structured form,
- triage a queue,
- or manage a multi-step operational task.

These tasks need scanning, filtering, selection, guarded action, and visible state. A paragraph is not enough, but a bespoke hard-coded screen for every possible request does not scale.

## The architecture problem

Current systems usually fall into one of four patterns:

- conversation-only flows,
- tool results dumped into chat,
- product-specific cards and widgets,
- or fully custom embedded apps.

Each pattern is useful, but none gives a shared, portable answer to this question:

> What is the right interface for this task right now?

TSR is the proposed answer to that missing layer.

## Why existing approaches stop short

### Text is too linear

Chat is excellent for explanation and coordination, but weak for comparison, bulk review, browsing, and guarded high-risk action.

### Hard-coded screens do not scale

A product team cannot prebuild screens for every dynamic task an assistant may need to support.

### Raw generated UI code is too risky as a default

Letting a model emit arbitrary HTML or React into the main shell creates safety, accessibility, portability, and maintainability problems.

### Embedded apps are necessary but too heavy for every task

Sandboxed apps are the right escape hatch, but they should not be the default for simple compare surfaces, forms, approval panels, or triage flows.

## When TSR should be used

TSR is the right abstraction when the user needs:

- structured inspection of entities or records,
- visual comparison across multiple options,
- local interface state that persists across turns,
- guarded or auditable actions,
- adaptive rendering across hosts,
- or incremental updates to an active task surface.

TSR is usually unnecessary when:

- the answer is short and conversational,
- the task has no meaningful structure or follow-on interaction,
- or a dedicated sandboxed micro-app is clearly required from the start.

## Design goals

The best version of TSR should achieve six things well.

### 1. Dynamic task surfaces

An assistant should be able to generate a usable interface as part of solving a task, not only return text.

### 2. Host-neutral semantics

The generator should describe meaning and structure. The runtime should adapt that structure to the host.

### 3. Replaceable generation

TSR should work with model-driven, rule-driven, and hybrid generators. The surface contract matters more than the generator implementation.

### 4. Continuity across interaction

A mounted surface should preserve state and evolve through patches so the task feels coherent over time.

### 5. Explicit safety

High-risk actions, capabilities, provenance, and confirmations should be modeled directly instead of inferred from styling or prompt text.

### 6. Promotion into reusable assets

Useful generated surfaces should be promotable into pinned workspaces, reusable templates, or saved artifacts.

## Failure modes TSR must avoid

TSR will fail if it becomes any of the following:

- a vague schema with no runtime rules,
- a generic GUI toolkit with no task focus,
- a wrapper for arbitrary generated code,
- a surface model with hidden capability jumps,
- a renderer that loses provenance and confirmation semantics,
- or a polished visual system with weak accessibility and auditability.

## The strategic claim behind TSR

If TSR works, assistants stop being limited to "generate an answer" and start becoming capable of generating **temporary operational environments** for the task at hand.

That is the deeper intent:

> an assistant should be able to generate the right software surface for the current task, not only the right paragraph.

## What success looks like

A strong TSR ecosystem would make the following true:

- the same surface can render in multiple hosts,
- runtimes can compete on quality without fragmenting the protocol,
- tools can feed normalized data into a shared interface layer,
- users can develop stable expectations around confirmations and trust signals,
- and generated surfaces can become durable artifacts when they prove useful.

The rest of this specification turns that thesis into a concrete runtime model.
