---
id: security-model
title: Security Model
description: Trust, permissions, confirmations, provenance, and sandbox boundaries for TSR.
---

# Security Model

Dynamic interface generation is powerful, which means TSR has to treat security and trust as core protocol concerns from the beginning.

## Security goals

A TSR implementation should aim to ensure that:

- interfaces do not misrepresent what actions do,
- the assistant cannot silently exceed host capabilities,
- sensitive actions require explicit confirmation,
- provenance is preserved where trust depends on it,
- sandbox escape hatches remain bounded,
- and high-risk activity is auditable.

## Trust boundaries

TSR usually spans multiple trust boundaries:

- the user,
- the generator or assistant,
- the runtime,
- the host,
- tools and external services,
- optional sandbox apps.

The spec should never assume those actors are equally trusted.

## Primary threat classes

The main risks TSR should defend against include:

- deceptive interface generation,
- hidden or mislabeled side effects,
- capability overreach,
- provenance laundering,
- prompt-injected data being surfaced as trusted guidance,
- event or patch replay confusion,
- sandbox escape,
- and unnecessary exposure of sensitive user data.

## Provenance as a security primitive

Provenance is not only documentation. It is part of the trust model.

TSR should preserve and expose distinctions among:

- user input,
- tool output,
- retrieved web or document content,
- partner-provided data,
- model inference,
- host or system metadata.

For sensitive fields, runtimes SHOULD be able to show:

- source badges,
- freshness,
- inference indicators,
- and warnings when confidence is low or provenance is indirect.

## Permission and capability model

TSR surfaces should never inherit arbitrary host powers by default.

Actions that depend on host capabilities must declare them explicitly. Examples:

- checkout,
- file upload,
- camera,
- microphone,
- geolocation,
- external navigation,
- modal presentation.

The runtime and host MUST mediate those capabilities. The generator MUST NOT directly claim them.

## Confirmation model

Sensitive operations need confirmation floors that the generator cannot silently weaken.

At minimum, these classes should be treated as high risk:

- `communicate`
- `transact`
- `destructive`
- `privileged`

Hosts MAY impose stronger confirmation than the surface requests. They SHOULD do so when local policy or regulation requires it.

## Anti-deception rules

Generated interfaces create unusual risks because the assistant is participating in UI construction. TSR should explicitly prohibit patterns such as:

- imitating trusted system UI without disclosure,
- hiding material side effects behind vague labels,
- making dangerous actions easier to trigger than safe alternatives,
- obscuring provenance or freshness,
- blending inferred content with source-backed facts without marking the difference,
- and presenting rankings or recommendations without enough explanation when they materially affect user choice.

## Prompt injection and tainted data

External content can contain adversarial instructions. TSR should assume that retrieved or tool-sourced content may be tainted.

Good defenses include:

- keeping retrieved content provenance visible,
- preventing untrusted content from directly defining privileged actions,
- separating raw content from host capability execution,
- and requiring the assistant or normalizer to pass through policy checks before data influences high-risk UI decisions.

Hosts should treat external content as untrusted even when it looks authoritative. Retrieval quality and truthfulness are separate questions from execution privilege.

## Auditability

High-risk activity should leave an audit trail that records:

- what action was shown,
- what the user requested,
- what confirmation was completed,
- what capability was used,
- what external system was touched,
- and what outcome occurred.

Audit logs should be tamper-evident where feasible and SHOULD avoid leaking secrets or full sensitive payloads.

## Sandboxed applications

When TSR launches a richer custom application, that application should run in a sandbox with:

- explicit capabilities,
- explicit communication channels,
- no unrestricted host state access,
- controlled navigation,
- and clear host disclosure that the user is entering a richer app lane.

The sandbox path is valuable only if it stays bounded.

Hosts should also verify sandbox resource identity and origin before launch. A sandbox lane without resource trust checks is only a prettier version of arbitrary code execution.

## Privacy considerations

Security and privacy overlap heavily here. Mature TSR implementations should define:

- which events and action outcomes are logged,
- which drafts or user inputs are persisted,
- how ephemeral and saved surfaces differ,
- how voice summaries redact sensitive data,
- how retention and deletion work for promoted artifacts.

The safest default is disciplined minimization rather than storing everything.

## Minimum runtime enforcement checklist

A serious runtime should at least:

1. validate action classes, confirmations, and capability declarations,
2. reject surfaces that reference unsupported privileged behavior,
3. preserve provenance for trust-relevant fields,
4. require explicit sandbox launch policy,
5. keep high-risk actions auditable,
6. avoid logging secrets in event or action traces.

If a runtime skips those, it is not implementing the spirit of TSR even if the UI renders correctly.
