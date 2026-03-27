---
id: host-contract
title: Host Contract
description: The out-of-band environment contract between the host, runtime, and generator.
---

# Host Contract

TSR needs a clear host contract because the same surface should behave coherently across different shells and devices without the generator hard-coding UI for each one.

## What the host contract is

The host contract is the structured environment context the host provides to the runtime and, when useful, to the generator.

It answers questions such as:

- what kind of shell is this,
- how much space is available,
- what input modes exist,
- what capabilities are available,
- what presentation modes are allowed,
- what accessibility settings are active,
- and what policy constraints the runtime must honor.

## What the host contract is not

The host contract is not:

- part of the authored surface document,
- a raw browser or OS fingerprint,
- or permission to bypass the runtime policy engine.

The surface describes the task interface. The host contract describes the environment in which that interface is rendered.

## Canonical host context shape

```json
{
  "host": {
    "id": "openclaw-desktop",
    "theme": "dark",
    "locale": "en-US",
    "deviceClass": "desktop",
    "displayMode": "panel",
    "availableSurfaceKinds": ["inline", "panel", "modal", "fullscreen"],
    "inputModes": ["keyboard", "mouse", "voice"],
    "viewport": {
      "width": 1280,
      "height": 820,
      "maxHeight": 720
    },
    "safeArea": {
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0
    },
    "accessibility": {
      "reducedMotion": false,
      "screenReader": false,
      "highContrast": false
    },
    "capabilities": {
      "fileUpload": true,
      "fileDownload": true,
      "camera": false,
      "microphone": true,
      "geolocation": false,
      "checkout": false,
      "modal": true,
      "externalNavigation": true
    }
  }
}
```

## Recommended host fields

Useful starter host fields include:

- `id`
- `theme`
- `locale`
- `deviceClass`
- `displayMode`
- `availableSurfaceKinds`
- `inputModes`
- `viewport`
- `safeArea`
- accessibility preferences
- capability availability

Hosts MAY extend this, but they should keep extensions coarse and portable where possible.

## Capability model

The host contract should expose capabilities as host-controlled facts, not generator wishes.

Useful starter capabilities:

- `fileUpload`
- `fileDownload`
- `camera`
- `microphone`
- `geolocation`
- `checkout`
- `modal`
- `externalNavigation`

The runtime must treat these as the upper bound of what a surface may request. An action still needs its own declaration and policy checks.

## Negotiation rules

The host contract influences TSR in two ways:

1. it informs generation,
2. it constrains execution.

Examples:

- a generator may avoid a `fullscreen`-optimized layout if the host does not support fullscreen,
- a runtime may adapt an `aside` zone into a modal sheet on mobile,
- a `checkout` action may render disabled when that capability is unavailable.

The generator MAY tailor surfaces to the host, but SHOULD still degrade gracefully when signals are missing or coarse.

## Privacy and minimization

The host contract should expose only what TSR actually needs. It should avoid leaking:

- fine-grained device fingerprinting detail,
- raw user agent strings unless truly necessary,
- or sensitive host state unrelated to the surface.

Coarse capability and display buckets are usually enough.

## Out-of-band relationship to the surface

This is a critical rule:

- the host contract is provided alongside the surface,
- the runtime consumes both,
- the generator may optionally receive host context as input,
- but the authored surface document should remain host-neutral.

That separation is what allows the same surface semantics to render across multiple hosts.

## Validation rules

Hosts and runtimes should enforce at least:

- reported surface kinds are actually supported,
- capability booleans reflect real host behavior,
- accessibility settings are trustworthy,
- and missing host signals fall back to conservative runtime defaults.

The host contract is where portability and real-world execution constraints meet. Without it, TSR would collapse into either guesswork or product-specific UI.
