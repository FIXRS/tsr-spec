---
id: entities
title: Entities
description: The typed objects, field model, and collections shown on a TSR surface.
---

# Entities

Entities are the data-bearing objects that appear on a surface. In practice, most TSR interfaces exist to help a user inspect, compare, edit, approve, or act on entities.

## What counts as an entity

An entity is a typed object with stable identity inside the surface. Examples include:

- a product,
- a listing,
- a document,
- a message draft,
- a profile,
- a time slot,
- a task,
- a location,
- or a metric series.

An entity does not need to map 1:1 to a database row. It only needs to be a coherent object the user can reason about.

## Base entity shape

TSR should keep the base entity model small and let domains extend it.

```json
{
  "id": "listing_01",
  "type": "Listing",
  "title": "iPhone 13 128GB Blue",
  "subtitle": "Seller rating 99.1%",
  "summary": "Used listing with free shipping.",
  "fields": {
    "price": {
      "value": 489,
      "sourceRef": "src_market_1",
      "confidence": 1,
      "inferred": false
    },
    "condition": {
      "value": "used",
      "sourceRef": "src_market_1"
    }
  },
  "badges": ["Recommended"],
  "status": "available",
  "score": 0.92,
  "media": [
    {
      "kind": "image",
      "url": "https://example.com/listing-01.jpg",
      "alt": "Front view of blue phone"
    }
  ]
}
```

## Field model

Fields should support more than raw values. At minimum, TSR field values should allow:

- `value`
- `sourceRef`
- `confidence`
- `inferred`

Runtimes MAY add formatting hints, but generators SHOULD prefer structured values over preformatted strings whenever possible.

### Recommended typed value discipline

Generators should keep values typed wherever possible:

- numbers as numbers,
- booleans as booleans,
- timestamps as timestamps,
- enumerated states as stable symbols,
- currencies and units as structured values or clearly typed fields.

If everything is flattened into display strings, sorting, filtering, and accessibility degrade quickly.

### Why this matters

Generated task surfaces often combine:

- direct tool output,
- retrieved content,
- user input,
- and model inference.

The field model needs enough structure to expose those differences.

## Provenance expectations

Not every field needs the same provenance fidelity, but high-trust fields usually do. Examples:

- price,
- availability,
- due date,
- sender,
- compliance status,
- confidence score,
- ranking explanation.

For sensitive or consequential fields, runtimes SHOULD be able to show:

- source badges,
- provenance drawers,
- freshness timestamps,
- and inference warnings.

## Media model

Entities MAY contain media references such as images, video, audio, or files. Media should include:

- media kind,
- URL or resource reference,
- alt text when applicable.

Runtimes SHOULD treat missing alt text as an accessibility deficiency, not as a styling issue.

## Collections

Collections group entities into navigable sets. A collection should carry the behavior around the set, not just the items list.

```json
{
  "id": "results",
  "entityType": "Listing",
  "items": ["listing_01", "listing_02", "listing_03"],
  "selectionMode": "multi",
  "compareLimit": 4,
  "filters": {
    "condition": ["used", "refurbished"]
  },
  "sort": {
    "field": "price",
    "direction": "asc"
  },
  "pagination": {
    "cursor": "next_01",
    "hasMore": true
  },
  "groupBy": "seller"
}
```

Collections are where TSR becomes useful for search, compare, triage, and browse workflows.

## Selection semantics

Collections SHOULD explicitly declare whether selection is:

- `none`
- `single`
- `multi`

The runtime should not guess whether clicking an item means "open it", "focus it", "select it", or "queue it for compare".

## Canonical starter entity types

A practical v0.1 starter set is:

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

The goal is not exhaustive taxonomy. The goal is a stable core plus extension rules.

## Extension rules

Generators MAY emit domain-specific entity types, but they should do so carefully:

- extend from a stable base shape,
- keep titles and key fields predictable,
- avoid host-specific visual details in the entity model,
- and preserve backwards-compatible meaning when possible.

If a domain type requires a completely different interaction model, it may be a sign that TSR needs a new built-in view or a sandbox app lane instead of a new entity type alone.

## Normalization guidance

Before a generator emits entities, raw source data should be normalized.

Good normalizers:

- preserve stable source identifiers,
- keep numbers, currencies, dates, and booleans typed,
- normalize units and time zones,
- separate observed facts from inferred summaries,
- and keep missing data absent rather than invented.

Poor normalization creates messy surfaces even if the runtime is excellent.

## Validation rules

A conforming runtime or validator should enforce at least these invariants:

- entity ids are unique,
- collection items resolve to declared entities,
- collection `entityType` matches the entities it contains,
- `compareLimit` is only present when the collection supports meaningful comparison,
- selected ids obey the collection selection mode,
- and field provenance references resolve when present.

## Generator anti-patterns

Generators should avoid:

- flattening all fields into strings,
- inventing unsupported facts to fill sparse source data,
- mixing multiple conceptual objects into one entity,
- hiding key trust distinctions inside prose summaries,
- or overloading entities with host-specific rendering instructions.

TSR works best when entities stay semantic, typed, and auditable.
