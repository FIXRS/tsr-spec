import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const SURFACE_KINDS = new Set(["inline", "panel", "modal", "fullscreen", "artifact"]);
const SURFACE_INTENTS = new Set([
  "browse_options",
  "compare_options",
  "inspect_item",
  "review_approve",
  "compose_send",
  "fill_submit",
  "schedule_book",
  "transact",
  "explore_data",
  "monitor_triage",
  "create_edit"
]);
const ACTION_CLASSES = new Set([
  "view",
  "navigate",
  "query",
  "mutate",
  "communicate",
  "transact",
  "destructive",
  "privileged"
]);
const CONFIRMATION_LEVELS = new Set(["none", "soft", "hard", "typed"]);
const HIGH_RISK_CLASSES = new Set(["communicate", "transact", "destructive", "privileged"]);
const EVENT_TYPES = new Set([
  "surface.mounted",
  "surface.updated",
  "surface.closed",
  "surface.promoted",
  "surface.mode.changed",
  "view.changed",
  "entity.focused",
  "entity.opened",
  "entity.selected",
  "entity.deselected",
  "collection.selection.changed",
  "collection.filter.changed",
  "collection.sort.changed",
  "collection.page.requested",
  "form.field.changed",
  "form.field.validated",
  "form.submitted",
  "composer.edited",
  "action.requested",
  "action.confirmed",
  "action.canceled",
  "action.completed",
  "action.failed",
  "data.requested",
  "data.loaded",
  "data.appended",
  "data.failed",
  "capability.requested",
  "capability.granted",
  "capability.denied"
]);
const EVENT_ACTORS = new Set(["user", "assistant", "tool", "host", "system"]);
const PATCH_REASONS = new Set(["assistant", "tool_result", "host", "system"]);
const PATCH_OPS = new Set([
  "state.set",
  "entity.upsert",
  "entity.remove",
  "collection.replace",
  "collection.append",
  "collection.reorder",
  "view.insert",
  "view.replace",
  "view.remove",
  "action.set",
  "notice.show",
  "surface.mode.set",
  "surface.close",
  "app.launch"
]);

const CONFIRMATION_RANK = {
  none: 0,
  soft: 1,
  hard: 2,
  typed: 3
};

const SURFACE_CORE_CHECKS = [
  "document.version.supported",
  "surface.id.present",
  "surface.kind.supported",
  "surface.intent.supported",
  "layout.zones.resolve",
  "views.bindings.resolve",
  "actions.targets.resolve",
  "sources.references.resolve",
  "state.focused.resolve",
  "state.selected.resolve"
];

const EVENT_CORE_CHECKS = [
  "document.version.supported",
  "event.id.present",
  "event.type.supported",
  "event.actor.supported",
  "event.timestamp.present",
  "event.surface_id.matches_context",
  "event.payload.by_type.valid"
];

const PATCH_CORE_CHECKS = [
  "document.version.supported",
  "patch.id.present",
  "patch.surface_id.matches_context",
  "patch.base_revision.matches_surface",
  "patch.reason.supported",
  "patch.ops.non_empty",
  "patch.ops.supported",
  "patch.ops.references.resolve"
];

const PATCH_SEQUENCE_CORE_CHECKS = [
  "document.version.supported",
  "patch_sequence.id.present",
  "patch_sequence.surface_id.matches_context",
  "patch_sequence.patches.non_empty",
  "patch_sequence.patches.id.present",
  "patch_sequence.patches.revisions.chain",
  "patch_sequence.patches.supported",
  "patch_sequence.patches.references.resolve"
];

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArrayOfStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function makeDiagnostic(code, message) {
  return { code, severity: "error", message };
}

function createSurfaceIndexes(surface) {
  const entities = Array.isArray(surface.entities) ? surface.entities : [];
  const collections = Array.isArray(surface.collections) ? surface.collections : [];
  const views = Array.isArray(surface.views) ? surface.views : [];
  const actions = Array.isArray(surface.actions) ? surface.actions : [];
  const sources = Array.isArray(surface.sources) ? surface.sources : [];
  const layout = isObject(surface.layout) ? surface.layout : {};
  const zones = Array.isArray(layout.zones) ? layout.zones : [];

  return {
    surface,
    entities,
    collections,
    views,
    actions,
    sources,
    layout,
    zones,
    entitiesById: new Map(entities.map((entity) => [entity.id, entity])),
    collectionsById: new Map(collections.map((collection) => [collection.id, collection])),
    viewsById: new Map(views.map((view) => [view.id, view])),
    actionsById: new Map(actions.map((action) => [action.id, action])),
    sourcesById: new Map(sources.map((source) => [source.id, source]))
  };
}

function emptySurfaceIndexes() {
  return createSurfaceIndexes({});
}

function collectFieldSourceRefs(entities) {
  const refs = [];
  for (const entity of entities) {
    const fields = isObject(entity.fields) ? entity.fields : {};
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      if (isObject(fieldValue) && nonEmptyString(fieldValue.sourceRef)) {
        refs.push({
          entityId: entity.id,
          fieldName,
          sourceRef: fieldValue.sourceRef
        });
      }
    }
  }
  return refs;
}

function createSurfaceContext(document, expectation, protocolVersion) {
  return {
    kind: "surface",
    document,
    expectation,
    protocolVersion,
    ...createSurfaceIndexes(document.surface ?? {})
  };
}

function createEventContext(document, expectation, protocolVersion, contextDocument) {
  const event = document.event ?? {};
  const surfaceIndexes = contextDocument?.surface
    ? createSurfaceIndexes(contextDocument.surface)
    : emptySurfaceIndexes();

  return {
    kind: "event",
    document,
    expectation,
    protocolVersion,
    event,
    contextSurfaceDocument: contextDocument ?? null,
    contextSurface: contextDocument?.surface ?? null,
    ...surfaceIndexes
  };
}

function createPatchContext(document, expectation, protocolVersion, contextDocument) {
  const patch = document.patch ?? {};
  const surfaceIndexes = contextDocument?.surface
    ? createSurfaceIndexes(contextDocument.surface)
    : emptySurfaceIndexes();

  return {
    kind: "patch",
    document,
    expectation,
    protocolVersion,
    patch,
    contextSurfaceDocument: contextDocument ?? null,
    contextSurface: contextDocument?.surface ?? null,
    ...surfaceIndexes
  };
}

function createPatchSequenceContext(document, expectation, protocolVersion, contextDocument) {
  const patchSequence = document.patchSequence ?? {};
  const surfaceIndexes = contextDocument?.surface
    ? createSurfaceIndexes(contextDocument.surface)
    : emptySurfaceIndexes();

  return {
    kind: "patch-sequence",
    document,
    expectation,
    protocolVersion,
    patchSequence,
    contextSurfaceDocument: contextDocument ?? null,
    contextSurface: contextDocument?.surface ?? null,
    ...surfaceIndexes
  };
}

function getRuntimeStateFromSurfaceDocument(contextDocument) {
  return {
    surface: structuredClone(contextDocument.surface),
    notices: [],
    launchedApps: [],
    status: "mounted"
  };
}

function findIndexById(items, id) {
  return items.findIndex((item) => item?.id === id);
}

function getValueByPath(target, pathSegments) {
  let current = target;
  for (const segment of pathSegments) {
    if (!isObject(current) && !Array.isArray(current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function setValueByPath(target, pathSegments, value) {
  let current = target;
  for (let index = 0; index < pathSegments.length - 1; index += 1) {
    const segment = pathSegments[index];
    const nextValue = current[segment];
    if (!isObject(nextValue) && !Array.isArray(nextValue)) {
      current[segment] = {};
    }
    current = current[segment];
  }
  current[pathSegments.at(-1)] = value;
}

function setStatePath(runtimeState, path, value) {
  const trimmed = path.startsWith("state.") ? path.slice("state.".length) : path;
  const segments = trimmed.split(".").filter(Boolean);
  if (segments.length === 0) {
    return;
  }
  setValueByPath(runtimeState.surface.state, segments, structuredClone(value));
}

function upsertById(items, item) {
  const next = structuredClone(item);
  const index = findIndexById(items, next.id);
  if (index === -1) {
    items.push(next);
  } else {
    items[index] = next;
  }
}

function removeEntityReferences(runtimeState, entityId) {
  for (const collection of runtimeState.surface.collections ?? []) {
    collection.items = (collection.items ?? []).filter((itemId) => itemId !== entityId);
  }

  const selected = Array.isArray(runtimeState.surface.state?.selected)
    ? runtimeState.surface.state.selected
    : [];
  runtimeState.surface.state.selected = selected.filter((itemId) => itemId !== entityId);
  if (runtimeState.surface.state?.focused === entityId) {
    runtimeState.surface.state.focused = null;
  }
}

function createPatchReferenceDiagnostics(surfaceIndexes, patch, code) {
  const diagnostics = [];

  for (const op of patch.ops ?? []) {
    switch (op.op) {
      case "state.set": {
        if (!nonEmptyString(op.path)) {
          diagnostics.push(makeDiagnostic(code, "state.set must include a non-empty path."));
        }
        break;
      }

      case "entity.upsert": {
        if (!Array.isArray(op.entities) || op.entities.length === 0) {
          diagnostics.push(makeDiagnostic(code, "entity.upsert must include a non-empty entities array."));
          break;
        }
        for (const ref of collectFieldSourceRefs(op.entities)) {
          if (!surfaceIndexes.sourcesById.has(ref.sourceRef)) {
            diagnostics.push(
              makeDiagnostic(
                code,
                `Patched entity ${ref.entityId} field ${ref.fieldName} references missing source ${ref.sourceRef}.`
              )
            );
          }
        }
        break;
      }

      case "entity.remove": {
        if (!isArrayOfStrings(op.entityIds) || op.entityIds.length === 0) {
          diagnostics.push(makeDiagnostic(code, "entity.remove must include a non-empty entityIds array."));
          break;
        }
        for (const entityId of op.entityIds) {
          if (!surfaceIndexes.entitiesById.has(entityId)) {
            diagnostics.push(makeDiagnostic(code, `entity.remove references missing entity ${entityId}.`));
          }
        }
        break;
      }

      case "collection.replace": {
        if (!isObject(op.collection) || !nonEmptyString(op.collection.id)) {
          diagnostics.push(makeDiagnostic(code, "collection.replace must include a collection with a non-empty id."));
        }
        break;
      }

      case "collection.append":
      case "collection.reorder": {
        if (!nonEmptyString(op.collectionId) || !surfaceIndexes.collectionsById.has(op.collectionId)) {
          diagnostics.push(makeDiagnostic(code, `${op.op} must reference an existing collectionId.`));
        }
        if (!isArrayOfStrings(op.items) || op.items.length === 0) {
          diagnostics.push(makeDiagnostic(code, `${op.op} must include a non-empty items array.`));
        }
        break;
      }

      case "view.insert":
      case "view.replace": {
        const view = op.view;
        if (!isObject(view) || !nonEmptyString(view.id)) {
          diagnostics.push(makeDiagnostic(code, `${op.op} must include a view with a non-empty id.`));
          break;
        }
        const zoneIds = new Set(surfaceIndexes.zones.map((zone) => zone.id));
        if (!zoneIds.has(view.zone)) {
          diagnostics.push(makeDiagnostic(code, `${op.op} view ${view.id} references unknown zone ${String(view.zone)}.`));
        }
        break;
      }

      case "view.remove": {
        if (!nonEmptyString(op.viewId) || !surfaceIndexes.viewsById.has(op.viewId)) {
          diagnostics.push(makeDiagnostic(code, "view.remove must reference an existing viewId."));
        }
        break;
      }

      case "action.set": {
        if (!Array.isArray(op.actions) || op.actions.length === 0) {
          diagnostics.push(makeDiagnostic(code, "action.set must include a non-empty actions array."));
          break;
        }
        for (const action of op.actions) {
          if (!nonEmptyString(action.id) || !ACTION_CLASSES.has(action.actionClass)) {
            diagnostics.push(makeDiagnostic(code, "action.set must include actions with valid ids and action classes."));
          }
        }
        break;
      }

      case "notice.show": {
        if (!nonEmptyString(op.message)) {
          diagnostics.push(makeDiagnostic(code, "notice.show must include a non-empty message."));
        }
        break;
      }

      case "surface.mode.set": {
        if (!SURFACE_KINDS.has(op.kind)) {
          diagnostics.push(makeDiagnostic(code, `surface.mode.set must use a supported kind, found ${String(op.kind)}.`));
        }
        break;
      }

      case "app.launch": {
        const resourceUri = op.resourceUri ?? op.app?.resourceUri;
        if (!nonEmptyString(resourceUri)) {
          diagnostics.push(makeDiagnostic(code, "app.launch must declare a non-empty resourceUri."));
        }
        break;
      }

      case "surface.close":
        break;

      default:
        break;
    }
  }

  return diagnostics;
}

function applyPatchEnvelope(runtimeState, patch) {
  if (patch.baseRevision !== runtimeState.surface.revision) {
    return [
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Patch ${patch.patchId} expected baseRevision ${patch.baseRevision} but runtime surface is at revision ${runtimeState.surface.revision}.`
      )
    ];
  }

  for (const op of patch.ops ?? []) {
    switch (op.op) {
      case "state.set":
        setStatePath(runtimeState, op.path, op.value);
        break;

      case "entity.upsert":
        for (const entity of op.entities ?? []) {
          upsertById(runtimeState.surface.entities, entity);
        }
        break;

      case "entity.remove":
        runtimeState.surface.entities = (runtimeState.surface.entities ?? []).filter(
          (entity) => !(op.entityIds ?? []).includes(entity.id)
        );
        for (const entityId of op.entityIds ?? []) {
          removeEntityReferences(runtimeState, entityId);
        }
        break;

      case "collection.replace":
        upsertById(runtimeState.surface.collections, op.collection);
        break;

      case "collection.append": {
        const collection = (runtimeState.surface.collections ?? []).find((item) => item.id === op.collectionId);
        if (collection) {
          collection.items = [...(collection.items ?? []), ...(op.items ?? [])];
        }
        break;
      }

      case "collection.reorder": {
        const collection = (runtimeState.surface.collections ?? []).find((item) => item.id === op.collectionId);
        if (collection) {
          collection.items = [...(op.items ?? [])];
        }
        break;
      }

      case "view.insert": {
        const views = runtimeState.surface.views ?? [];
        const existingIndex = findIndexById(views, op.view.id);
        if (existingIndex !== -1) {
          views[existingIndex] = structuredClone(op.view);
        } else if (Number.isInteger(op.index) && op.index >= 0 && op.index <= views.length) {
          views.splice(op.index, 0, structuredClone(op.view));
        } else {
          views.push(structuredClone(op.view));
        }
        runtimeState.surface.views = views;
        break;
      }

      case "view.replace":
        upsertById(runtimeState.surface.views, op.view);
        break;

      case "view.remove":
        runtimeState.surface.views = (runtimeState.surface.views ?? []).filter((view) => view.id !== op.viewId);
        break;

      case "action.set":
        runtimeState.surface.actions = structuredClone(op.actions ?? []);
        break;

      case "notice.show":
        runtimeState.notices.push({
          level: op.level,
          message: op.message
        });
        break;

      case "surface.mode.set":
        runtimeState.surface.kind = op.kind;
        break;

      case "surface.close":
        runtimeState.status = "closed";
        break;

      case "app.launch":
        runtimeState.launchedApps.push({
          resourceUri: op.resourceUri ?? op.app?.resourceUri,
          mode: op.mode ?? op.app?.mode,
          title: op.title ?? op.app?.title
        });
        break;

      default:
        break;
    }
  }

  runtimeState.surface.revision += 1;
  return [];
}

function assertRuntimeState(runtimeState, expectedRuntimeState) {
  const diagnostics = [];

  if (!isObject(expectedRuntimeState)) {
    return diagnostics;
  }

  if (expectedRuntimeState.revision !== undefined && runtimeState.surface.revision !== expectedRuntimeState.revision) {
    diagnostics.push(
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Expected surface revision ${expectedRuntimeState.revision} but found ${runtimeState.surface.revision}.`
      )
    );
  }

  if (expectedRuntimeState.kind !== undefined && runtimeState.surface.kind !== expectedRuntimeState.kind) {
    diagnostics.push(
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Expected surface kind ${expectedRuntimeState.kind} but found ${runtimeState.surface.kind}.`
      )
    );
  }

  if (expectedRuntimeState.status !== undefined && runtimeState.status !== expectedRuntimeState.status) {
    diagnostics.push(
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Expected runtime status ${expectedRuntimeState.status} but found ${runtimeState.status}.`
      )
    );
  }

  if (Array.isArray(expectedRuntimeState.entityIdsContains)) {
    const entityIds = new Set((runtimeState.surface.entities ?? []).map((entity) => entity.id));
    for (const entityId of expectedRuntimeState.entityIdsContains) {
      if (!entityIds.has(entityId)) {
        diagnostics.push(
          makeDiagnostic(
            "runtime_state.matches_expectation",
            `Expected runtime surface to contain entity ${entityId}.`
          )
        );
      }
    }
  }

  if (Array.isArray(expectedRuntimeState.entityIdsExact)) {
    const entityIds = (runtimeState.surface.entities ?? []).map((entity) => entity.id);
    if (!deepEqual(entityIds, expectedRuntimeState.entityIdsExact)) {
      diagnostics.push(
        makeDiagnostic(
          "runtime_state.matches_expectation",
          `Expected entity ids ${JSON.stringify(expectedRuntimeState.entityIdsExact)} but found ${JSON.stringify(entityIds)}.`
        )
      );
    }
  }

  if (isObject(expectedRuntimeState.collectionLengths)) {
    for (const [collectionId, expectedLength] of Object.entries(expectedRuntimeState.collectionLengths)) {
      const collection = (runtimeState.surface.collections ?? []).find((item) => item.id === collectionId);
      const actualLength = collection?.items?.length;
      if (actualLength !== expectedLength) {
        diagnostics.push(
          makeDiagnostic(
            "runtime_state.matches_expectation",
            `Expected collection ${collectionId} length ${expectedLength} but found ${String(actualLength)}.`
          )
        );
      }
    }
  }

  if (isObject(expectedRuntimeState.collectionItemsExact)) {
    for (const [collectionId, expectedItems] of Object.entries(expectedRuntimeState.collectionItemsExact)) {
      const collection = (runtimeState.surface.collections ?? []).find((item) => item.id === collectionId);
      const actualItems = collection?.items;
      if (!deepEqual(actualItems, expectedItems)) {
        diagnostics.push(
          makeDiagnostic(
            "runtime_state.matches_expectation",
            `Expected collection ${collectionId} items ${JSON.stringify(expectedItems)} but found ${JSON.stringify(actualItems)}.`
          )
        );
      }
    }
  }

  if (isObject(expectedRuntimeState.statePaths)) {
    for (const [relativePath, expectedValue] of Object.entries(expectedRuntimeState.statePaths)) {
      const actualValue = getValueByPath(runtimeState.surface.state, relativePath.split("."));
      if (!deepEqual(actualValue, expectedValue)) {
        diagnostics.push(
          makeDiagnostic(
            "runtime_state.matches_expectation",
            `Expected state path ${relativePath} to equal ${JSON.stringify(expectedValue)} but found ${JSON.stringify(actualValue)}.`
          )
        );
      }
    }
  }

  if (expectedRuntimeState.noticesCount !== undefined && runtimeState.notices.length !== expectedRuntimeState.noticesCount) {
    diagnostics.push(
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Expected noticesCount ${expectedRuntimeState.noticesCount} but found ${runtimeState.notices.length}.`
      )
    );
  }

  if (Array.isArray(expectedRuntimeState.noticeMessagesExact)) {
    const actualMessages = runtimeState.notices.map((notice) => notice.message);
    if (!deepEqual(actualMessages, expectedRuntimeState.noticeMessagesExact)) {
      diagnostics.push(
        makeDiagnostic(
          "runtime_state.matches_expectation",
          `Expected notice messages ${JSON.stringify(expectedRuntimeState.noticeMessagesExact)} but found ${JSON.stringify(actualMessages)}.`
        )
      );
    }
  }

  if (isObject(expectedRuntimeState.lastNotice)) {
    const lastNotice = runtimeState.notices.at(-1);
    if (!lastNotice) {
      diagnostics.push(makeDiagnostic("runtime_state.matches_expectation", "Expected a lastNotice but no notices were recorded."));
    } else {
      for (const [key, value] of Object.entries(expectedRuntimeState.lastNotice)) {
        if (!deepEqual(lastNotice[key], value)) {
          diagnostics.push(
            makeDiagnostic(
              "runtime_state.matches_expectation",
              `Expected lastNotice.${key} to equal ${JSON.stringify(value)} but found ${JSON.stringify(lastNotice[key])}.`
            )
          );
        }
      }
    }
  }

  if (expectedRuntimeState.launchedAppsCount !== undefined && runtimeState.launchedApps.length !== expectedRuntimeState.launchedAppsCount) {
    diagnostics.push(
      makeDiagnostic(
        "runtime_state.matches_expectation",
        `Expected launchedAppsCount ${expectedRuntimeState.launchedAppsCount} but found ${runtimeState.launchedApps.length}.`
      )
    );
  }

  if (isObject(expectedRuntimeState.lastLaunchedApp)) {
    const lastLaunchedApp = runtimeState.launchedApps.at(-1);
    if (!lastLaunchedApp) {
      diagnostics.push(
        makeDiagnostic("runtime_state.matches_expectation", "Expected a lastLaunchedApp but no launched apps were recorded.")
      );
    } else {
      for (const [key, value] of Object.entries(expectedRuntimeState.lastLaunchedApp)) {
        if (!deepEqual(lastLaunchedApp[key], value)) {
          diagnostics.push(
            makeDiagnostic(
              "runtime_state.matches_expectation",
              `Expected lastLaunchedApp.${key} to equal ${JSON.stringify(value)} but found ${JSON.stringify(lastLaunchedApp[key])}.`
            )
          );
        }
      }
    }
  }

  return diagnostics;
}

function runRuntimeAssertionForPatchLikeFixture(kind, ctx, expectation) {
  if (!ctx.contextSurfaceDocument || !isObject(expectation.expectedRuntimeState)) {
    return [];
  }

  const runtimeState = getRuntimeStateFromSurfaceDocument(ctx.contextSurfaceDocument);

  if (kind === "patch") {
    return [
      ...applyPatchEnvelope(runtimeState, ctx.patch),
      ...assertRuntimeState(runtimeState, expectation.expectedRuntimeState)
    ];
  }

  if (kind === "patch-sequence") {
    const diagnostics = [];
    for (const patch of ctx.patchSequence.patches ?? []) {
      diagnostics.push(...applyPatchEnvelope(runtimeState, patch));
      if (diagnostics.length > 0) {
        return diagnostics;
      }
    }
    diagnostics.push(...assertRuntimeState(runtimeState, expectation.expectedRuntimeState));
    return diagnostics;
  }

  return [];
}

function checkDocumentVersionSupported(ctx) {
  if (ctx.document.version !== ctx.protocolVersion) {
    return [
      makeDiagnostic(
        "document.version.supported",
        `Expected protocol version ${ctx.protocolVersion} but found ${String(ctx.document.version)}.`
      )
    ];
  }
  return [];
}

function checkSurfaceIdPresent(ctx) {
  if (!nonEmptyString(ctx.surface.id)) {
    return [makeDiagnostic("surface.id.present", "Surface id must be a non-empty string.")];
  }
  return [];
}

function checkSurfaceKindSupported(ctx) {
  if (!SURFACE_KINDS.has(ctx.surface.kind)) {
    return [makeDiagnostic("surface.kind.supported", `Unsupported surface kind ${String(ctx.surface.kind)}.`)];
  }
  return [];
}

function checkSurfaceIntentSupported(ctx) {
  if (!SURFACE_INTENTS.has(ctx.surface.intent)) {
    return [makeDiagnostic("surface.intent.supported", `Unsupported surface intent ${String(ctx.surface.intent)}.`)];
  }
  return [];
}

function checkSurfaceRevisionMonotonic(ctx) {
  if (!Number.isInteger(ctx.surface.revision) || ctx.surface.revision < 0) {
    return [makeDiagnostic("surface.revision.monotonic", "Surface revision must be a non-negative integer.")];
  }
  return [];
}

function checkLayoutZonesResolve(ctx) {
  const diagnostics = [];
  const zoneIds = new Set();

  for (const zone of ctx.zones) {
    if (!nonEmptyString(zone.id)) {
      diagnostics.push(makeDiagnostic("layout.zones.resolve", "Every layout zone must have a non-empty id."));
      continue;
    }
    if (zoneIds.has(zone.id)) {
      diagnostics.push(makeDiagnostic("layout.zones.resolve", `Duplicate layout zone id ${zone.id}.`));
    }
    zoneIds.add(zone.id);
  }

  for (const view of ctx.views) {
    if (!zoneIds.has(view.zone)) {
      diagnostics.push(makeDiagnostic("layout.zones.resolve", `View ${view.id} references unknown zone ${String(view.zone)}.`));
    }
  }

  return diagnostics;
}

function checkCollectionsSelectionModeValid(ctx) {
  const diagnostics = [];
  const validModes = new Set(["none", "single", "multi", undefined]);

  for (const collection of ctx.collections) {
    if (!validModes.has(collection.selectionMode)) {
      diagnostics.push(
        makeDiagnostic(
          "collections.selection_mode.valid",
          `Collection ${collection.id} has invalid selection mode ${String(collection.selectionMode)}.`
        )
      );
    }
    if (
      collection.compareLimit !== undefined &&
      (!Number.isInteger(collection.compareLimit) || collection.compareLimit < 2)
    ) {
      diagnostics.push(
        makeDiagnostic(
          "collections.selection_mode.valid",
          `Collection ${collection.id} has invalid compareLimit ${String(collection.compareLimit)}.`
        )
      );
    }
  }

  return diagnostics;
}

function checkCollectionsItemsResolve(ctx) {
  const diagnostics = [];
  for (const collection of ctx.collections) {
    for (const itemId of collection.items ?? []) {
      const entity = ctx.entitiesById.get(itemId);
      if (!entity) {
        diagnostics.push(makeDiagnostic("collections.items.resolve", `Collection ${collection.id} references missing entity ${itemId}.`));
        continue;
      }
      if (nonEmptyString(collection.entityType) && entity.type !== collection.entityType) {
        diagnostics.push(
          makeDiagnostic(
            "collections.items.resolve",
            `Collection ${collection.id} expects entity type ${collection.entityType} but found ${entity.type} for ${itemId}.`
          )
        );
      }
    }
  }
  return diagnostics;
}

function checkViewsBindingsResolve(ctx) {
  const diagnostics = [];
  for (const view of ctx.views) {
    if (nonEmptyString(view.sourceEntity) && !ctx.entitiesById.has(view.sourceEntity)) {
      diagnostics.push(makeDiagnostic("views.bindings.resolve", `View ${view.id} references missing entity ${view.sourceEntity}.`));
    }
    if (nonEmptyString(view.sourceCollection) && !ctx.collectionsById.has(view.sourceCollection)) {
      diagnostics.push(
        makeDiagnostic(
          "views.bindings.resolve",
          `View ${view.id} references missing collection ${view.sourceCollection}.`
        )
      );
    }
    for (const actionId of view.actions ?? []) {
      if (!ctx.actionsById.has(actionId)) {
        diagnostics.push(makeDiagnostic("views.bindings.resolve", `View ${view.id} references missing action ${actionId}.`));
      }
    }
  }
  return diagnostics;
}

function isValidActionTarget(ctx, target) {
  if (target === undefined) {
    return true;
  }
  if (["surface", "focused", "selected"].includes(target)) {
    return true;
  }
  if (typeof target !== "string") {
    return false;
  }
  if (target.startsWith("entity:")) {
    return ctx.entitiesById.has(target.slice("entity:".length));
  }
  if (target.startsWith("collection:")) {
    return ctx.collectionsById.has(target.slice("collection:".length));
  }
  return false;
}

function checkActionsTargetsResolve(ctx) {
  const diagnostics = [];
  const actionIds = new Set();

  for (const action of ctx.actions) {
    if (!nonEmptyString(action.id)) {
      diagnostics.push(makeDiagnostic("actions.targets.resolve", "Every action must have a non-empty id."));
      continue;
    }
    if (actionIds.has(action.id)) {
      diagnostics.push(makeDiagnostic("actions.targets.resolve", `Duplicate action id ${action.id}.`));
    }
    actionIds.add(action.id);
    if (!ACTION_CLASSES.has(action.actionClass)) {
      diagnostics.push(makeDiagnostic("actions.targets.resolve", `Action ${action.id} has unsupported action class ${String(action.actionClass)}.`));
    }
    if (!isValidActionTarget(ctx, action.target)) {
      diagnostics.push(makeDiagnostic("actions.targets.resolve", `Action ${action.id} has unresolved target ${String(action.target)}.`));
    }
  }

  return diagnostics;
}

function checkHighRiskConfirmation(ctx, targetClass, code) {
  const diagnostics = [];
  for (const action of ctx.actions) {
    if (action.actionClass !== targetClass) {
      continue;
    }
    const confirmation = action.confirmation ?? ctx.surface?.policy?.defaultConfirmation ?? "soft";
    if ((CONFIRMATION_RANK[confirmation] ?? -1) < CONFIRMATION_RANK.hard) {
      diagnostics.push(makeDiagnostic(code, `Action ${action.id} in class ${targetClass} must use confirmation hard or typed.`));
    }
  }
  return diagnostics;
}

function checkActionsHighRiskConfirmationEnforced(ctx) {
  const diagnostics = [];
  for (const action of ctx.actions) {
    if (!HIGH_RISK_CLASSES.has(action.actionClass)) {
      continue;
    }
    const confirmation = action.confirmation ?? ctx.surface?.policy?.defaultConfirmation ?? "soft";
    if ((CONFIRMATION_RANK[confirmation] ?? -1) < CONFIRMATION_RANK.hard) {
      diagnostics.push(makeDiagnostic("actions.high_risk_confirmation.enforced", `High-risk action ${action.id} must use confirmation hard or typed.`));
    }
  }
  return diagnostics;
}

function checkActionsRequiredCapabilitiesDeclared(ctx) {
  const diagnostics = [];
  const allowedCapabilities = new Set(ctx.surface?.policy?.allowedCapabilities ?? []);
  for (const action of ctx.actions) {
    const requiredCapabilities = action.requiresCapabilities ?? [];
    if (!Array.isArray(requiredCapabilities)) {
      diagnostics.push(makeDiagnostic("actions.required_capabilities.declared", `Action ${action.id} must declare requiresCapabilities as an array.`));
      continue;
    }
    for (const capability of requiredCapabilities) {
      if (!allowedCapabilities.has(capability)) {
        diagnostics.push(
          makeDiagnostic(
            "actions.required_capabilities.declared",
            `Action ${action.id} requires capability ${capability} that is not declared in surface policy.allowedCapabilities.`
          )
        );
      }
    }
  }
  return diagnostics;
}

function checkPolicyAllowedCapabilitiesDeclared(ctx) {
  if (!Array.isArray(ctx.surface?.policy?.allowedCapabilities)) {
    return [makeDiagnostic("policy.allowed_capabilities.declared", "surface.policy.allowedCapabilities must be an array.")];
  }
  return [];
}

function checkSourcesReferencesResolve(ctx) {
  const diagnostics = [];
  for (const ref of collectFieldSourceRefs(ctx.entities)) {
    if (!ctx.sourcesById.has(ref.sourceRef)) {
      diagnostics.push(
        makeDiagnostic(
          "sources.references.resolve",
          `Entity ${ref.entityId} field ${ref.fieldName} references missing source ${ref.sourceRef}.`
        )
      );
    }
  }
  return diagnostics;
}

function checkStateFocusedResolve(ctx) {
  const focused = ctx.surface?.state?.focused;
  if (focused !== null && focused !== undefined && !ctx.entitiesById.has(focused)) {
    return [makeDiagnostic("state.focused.resolve", `State focused references missing entity ${String(focused)}.`)];
  }
  return [];
}

function checkStateSelectedResolve(ctx) {
  const diagnostics = [];
  const selected = Array.isArray(ctx.surface?.state?.selected) ? ctx.surface.state.selected : [];
  const allCollectionItems = new Set(ctx.collections.flatMap((collection) => collection.items ?? []));
  for (const entityId of selected) {
    if (!ctx.entitiesById.has(entityId)) {
      diagnostics.push(makeDiagnostic("state.selected.resolve", `State selected references missing entity ${entityId}.`));
      continue;
    }
    if (!allCollectionItems.has(entityId)) {
      diagnostics.push(
        makeDiagnostic(
          "state.selected.resolve",
          `State selected entity ${entityId} does not belong to any declared collection.`
        )
      );
    }
  }
  return diagnostics;
}

function checkPolicyClassPoliciesValid(ctx) {
  const diagnostics = [];
  const classPolicies = ctx.surface?.policy?.classPolicies ?? [];
  if (!Array.isArray(classPolicies)) {
    return [makeDiagnostic("policy.class_policies.valid", "surface.policy.classPolicies must be an array when present.")];
  }
  for (const policy of classPolicies) {
    if (!ACTION_CLASSES.has(policy.actionClass)) {
      diagnostics.push(
        makeDiagnostic(
          "policy.class_policies.valid",
          `Unsupported action class ${String(policy.actionClass)} in class policy.`
        )
      );
    }
    if (!CONFIRMATION_LEVELS.has(policy.confirmation)) {
      diagnostics.push(
        makeDiagnostic(
          "policy.class_policies.valid",
          `Unsupported confirmation ${String(policy.confirmation)} in class policy.`
        )
      );
    }
  }
  return diagnostics;
}

function checkAccessibilityVoiceSummaryPresent(ctx) {
  if (!nonEmptyString(ctx.surface?.accessibility?.voiceSummary)) {
    return [makeDiagnostic("accessibility.voice_summary.present", "surface.accessibility.voiceSummary must be a non-empty string.")];
  }
  return [];
}

function checkLifecycleResumeKeyPresentForArtifact(ctx) {
  const persistence = ctx.surface?.lifecycle?.persistence;
  const needsResumeKey = ctx.surface.kind === "artifact" || persistence === "artifact";
  if (needsResumeKey && !nonEmptyString(ctx.surface?.lifecycle?.resumeKey)) {
    return [makeDiagnostic("lifecycle.resume_key.present_for_artifact", "Artifact surfaces must declare lifecycle.resumeKey.")];
  }
  return [];
}

function checkPolicyExternalNavigationExplicit(ctx) {
  const needsExternalNavigation = ctx.actions.some((action) => {
    return action.invoke?.kind === "navigate" || (action.requiresCapabilities ?? []).includes("externalNavigation");
  });
  if (needsExternalNavigation && ctx.surface?.policy?.allowExternalNavigation !== true) {
    return [makeDiagnostic("policy.external_navigation.explicit", "Surface must explicitly allow external navigation when navigate actions are present.")];
  }
  return [];
}

function checkSandboxLaunchReferencePresent(ctx) {
  const diagnostics = [];
  for (const action of ctx.actions) {
    if (action.invoke?.kind !== "launch_app") {
      continue;
    }
    const resourceUri = action.invoke?.ref ?? action.invoke?.params?.resourceUri;
    if (!nonEmptyString(resourceUri)) {
      diagnostics.push(makeDiagnostic("sandbox.launch_reference.present", `Sandbox launch action ${action.id} must declare a resource reference.`));
    }
  }
  return diagnostics;
}

function checkEventIdPresent(ctx) {
  if (!nonEmptyString(ctx.event.id)) {
    return [makeDiagnostic("event.id.present", "Event id must be a non-empty string.")];
  }
  return [];
}

function checkEventTypeSupported(ctx) {
  if (!EVENT_TYPES.has(ctx.event.type)) {
    return [makeDiagnostic("event.type.supported", `Unsupported event type ${String(ctx.event.type)}.`)];
  }
  return [];
}

function checkEventActorSupported(ctx) {
  if (!EVENT_ACTORS.has(ctx.event.actor)) {
    return [makeDiagnostic("event.actor.supported", `Unsupported event actor ${String(ctx.event.actor)}.`)];
  }
  return [];
}

function checkEventTimestampPresent(ctx) {
  if (!nonEmptyString(ctx.event.timestamp)) {
    return [makeDiagnostic("event.timestamp.present", "Event timestamp must be a non-empty string.")];
  }
  return [];
}

function checkEventSurfaceIdMatchesContext(ctx) {
  if (!ctx.contextSurface) {
    return [makeDiagnostic("event.surface_id.matches_context", "Event fixtures must declare a context surface.")];
  }
  if (ctx.event.surfaceId !== ctx.contextSurface.id) {
    return [
      makeDiagnostic(
        "event.surface_id.matches_context",
        `Event surfaceId ${String(ctx.event.surfaceId)} does not match context surface ${ctx.contextSurface.id}.`
      )
    ];
  }
  return [];
}

function checkEventViewIdResolveWhenPresent(ctx) {
  if (!nonEmptyString(ctx.event.viewId)) {
    return [];
  }
  if (!ctx.viewsById.has(ctx.event.viewId)) {
    return [makeDiagnostic("event.view_id.resolve_when_present", `Event viewId ${ctx.event.viewId} does not resolve against the context surface.`)];
  }
  return [];
}

function checkEventPayloadByTypeValid(ctx) {
  const payload = ctx.event.payload;
  if (!isObject(payload)) {
    return [makeDiagnostic("event.payload.by_type.valid", "Event payload must be an object.")];
  }

  switch (ctx.event.type) {
    case "collection.filter.changed":
      if (!nonEmptyString(payload.collectionId) || !ctx.collectionsById.has(payload.collectionId)) {
        return [makeDiagnostic("event.payload.by_type.valid", "collection.filter.changed must reference a known collectionId.")];
      }
      if (!isObject(payload.changes)) {
        return [makeDiagnostic("event.payload.by_type.valid", "collection.filter.changed must include a changes object.")];
      }
      return [];

    case "action.requested":
      if (!nonEmptyString(payload.actionId) || !ctx.actionsById.has(payload.actionId)) {
        return [makeDiagnostic("event.payload.by_type.valid", "action.requested must reference a known actionId.")];
      }
      if (payload.params !== undefined && !isObject(payload.params)) {
        return [makeDiagnostic("event.payload.by_type.valid", "action.requested params must be an object when present.")];
      }
      return [];

    default:
      return [];
  }
}

function checkPatchIdPresent(ctx) {
  if (!nonEmptyString(ctx.patch.patchId)) {
    return [makeDiagnostic("patch.id.present", "Patch patchId must be a non-empty string.")];
  }
  return [];
}

function checkPatchSurfaceIdMatchesContext(ctx) {
  if (!ctx.contextSurface) {
    return [makeDiagnostic("patch.surface_id.matches_context", "Patch fixtures must declare a context surface.")];
  }
  if (ctx.patch.surfaceId !== ctx.contextSurface.id) {
    return [makeDiagnostic("patch.surface_id.matches_context", `Patch surfaceId ${String(ctx.patch.surfaceId)} does not match context surface ${ctx.contextSurface.id}.`)];
  }
  return [];
}

function checkPatchBaseRevisionMatchesSurface(ctx) {
  if (!Number.isInteger(ctx.patch.baseRevision)) {
    return [makeDiagnostic("patch.base_revision.matches_surface", "Patch baseRevision must be an integer.")];
  }
  if (!ctx.contextSurface) {
    return [makeDiagnostic("patch.base_revision.matches_surface", "Patch fixtures must declare a context surface.")];
  }
  if (ctx.patch.baseRevision !== ctx.contextSurface.revision) {
    return [
      makeDiagnostic(
        "patch.base_revision.matches_surface",
        `Patch baseRevision ${ctx.patch.baseRevision} does not match context surface revision ${ctx.contextSurface.revision}.`
      )
    ];
  }
  return [];
}

function checkPatchReasonSupported(ctx) {
  if (ctx.patch.reason !== undefined && !PATCH_REASONS.has(ctx.patch.reason)) {
    return [makeDiagnostic("patch.reason.supported", `Unsupported patch reason ${String(ctx.patch.reason)}.`)];
  }
  return [];
}

function checkPatchOpsNonEmpty(ctx) {
  if (!Array.isArray(ctx.patch.ops) || ctx.patch.ops.length === 0) {
    return [makeDiagnostic("patch.ops.non_empty", "Patch ops must be a non-empty array.")];
  }
  return [];
}

function checkPatchOpsSupported(ctx) {
  const diagnostics = [];
  for (const op of ctx.patch.ops ?? []) {
    if (!PATCH_OPS.has(op?.op)) {
      diagnostics.push(makeDiagnostic("patch.ops.supported", `Unsupported patch op ${String(op?.op)}.`));
    }
  }
  return diagnostics;
}

function checkPatchOpsReferencesResolve(ctx) {
  return createPatchReferenceDiagnostics(createSurfaceIndexes(ctx.contextSurface ?? {}), ctx.patch, "patch.ops.references.resolve");
}

function checkPatchSequenceIdPresent(ctx) {
  if (!nonEmptyString(ctx.patchSequence.sequenceId)) {
    return [makeDiagnostic("patch_sequence.id.present", "Patch sequence must declare a non-empty sequenceId.")];
  }
  return [];
}

function checkPatchSequenceSurfaceIdMatchesContext(ctx) {
  if (!ctx.contextSurface) {
    return [makeDiagnostic("patch_sequence.surface_id.matches_context", "Patch sequence fixtures must declare a context surface.")];
  }
  if (ctx.patchSequence.surfaceId !== ctx.contextSurface.id) {
    return [
      makeDiagnostic(
        "patch_sequence.surface_id.matches_context",
        `Patch sequence surfaceId ${String(ctx.patchSequence.surfaceId)} does not match context surface ${ctx.contextSurface.id}.`
      )
    ];
  }
  return [];
}

function checkPatchSequencePatchesNonEmpty(ctx) {
  if (!Array.isArray(ctx.patchSequence.patches) || ctx.patchSequence.patches.length === 0) {
    return [makeDiagnostic("patch_sequence.patches.non_empty", "Patch sequence must include a non-empty patches array.")];
  }
  return [];
}

function checkPatchSequencePatchesIdPresent(ctx) {
  const diagnostics = [];
  for (const patch of ctx.patchSequence.patches ?? []) {
    if (!nonEmptyString(patch.patchId)) {
      diagnostics.push(makeDiagnostic("patch_sequence.patches.id.present", "Each patch in a patch sequence must declare a non-empty patchId."));
    }
  }
  return diagnostics;
}

function checkPatchSequencePatchesRevisionsChain(ctx) {
  const diagnostics = [];
  if (!ctx.contextSurface) {
    return [makeDiagnostic("patch_sequence.patches.revisions.chain", "Patch sequence fixtures must declare a context surface.")];
  }
  let expectedRevision = ctx.contextSurface.revision;
  for (const patch of ctx.patchSequence.patches ?? []) {
    if (!Number.isInteger(patch.baseRevision)) {
      diagnostics.push(makeDiagnostic("patch_sequence.patches.revisions.chain", `Patch ${patch.patchId ?? "<missing>"} must declare an integer baseRevision.`));
      continue;
    }
    if (patch.baseRevision !== expectedRevision) {
      diagnostics.push(
        makeDiagnostic(
          "patch_sequence.patches.revisions.chain",
          `Patch ${patch.patchId ?? "<missing>"} expected baseRevision ${expectedRevision} but found ${patch.baseRevision}.`
        )
      );
    } else {
      expectedRevision += 1;
    }
  }
  return diagnostics;
}

function checkPatchSequencePatchesSupported(ctx) {
  const diagnostics = [];
  for (const patch of ctx.patchSequence.patches ?? []) {
    for (const op of patch.ops ?? []) {
      if (!PATCH_OPS.has(op?.op)) {
        diagnostics.push(makeDiagnostic("patch_sequence.patches.supported", `Patch ${patch.patchId ?? "<missing>"} uses unsupported op ${String(op?.op)}.`));
      }
    }
  }
  return diagnostics;
}

function checkPatchSequencePatchesReferencesResolve(ctx) {
  if (!ctx.contextSurfaceDocument) {
    return [makeDiagnostic("patch_sequence.patches.references.resolve", "Patch sequence fixtures must declare a context surface.")];
  }

  const diagnostics = [];
  const runtimeState = getRuntimeStateFromSurfaceDocument(ctx.contextSurfaceDocument);

  for (const patch of ctx.patchSequence.patches ?? []) {
    diagnostics.push(...createPatchReferenceDiagnostics(createSurfaceIndexes(runtimeState.surface), patch, "patch_sequence.patches.references.resolve"));
    if (diagnostics.length > 0) {
      break;
    }
    const applyDiagnostics = applyPatchEnvelope(runtimeState, patch);
    if (applyDiagnostics.length > 0) {
      diagnostics.push(
        ...applyDiagnostics.map((diagnostic) =>
          makeDiagnostic("patch_sequence.patches.references.resolve", diagnostic.message)
        )
      );
      break;
    }
  }

  return diagnostics;
}

const CHECKS = {
  "document.version.supported": checkDocumentVersionSupported,
  "surface.id.present": checkSurfaceIdPresent,
  "surface.kind.supported": checkSurfaceKindSupported,
  "surface.intent.supported": checkSurfaceIntentSupported,
  "surface.revision.monotonic": checkSurfaceRevisionMonotonic,
  "layout.zones.resolve": checkLayoutZonesResolve,
  "collections.selection_mode.valid": checkCollectionsSelectionModeValid,
  "collections.items.resolve": checkCollectionsItemsResolve,
  "views.bindings.resolve": checkViewsBindingsResolve,
  "actions.targets.resolve": checkActionsTargetsResolve,
  "actions.high_risk_confirmation.enforced": checkActionsHighRiskConfirmationEnforced,
  "actions.communicate_confirmation.enforced": (ctx) =>
    checkHighRiskConfirmation(ctx, "communicate", "actions.communicate_confirmation.enforced"),
  "actions.transact_confirmation.enforced": (ctx) =>
    checkHighRiskConfirmation(ctx, "transact", "actions.transact_confirmation.enforced"),
  "actions.privileged_confirmation.enforced": (ctx) =>
    checkHighRiskConfirmation(ctx, "privileged", "actions.privileged_confirmation.enforced"),
  "actions.required_capabilities.declared": checkActionsRequiredCapabilitiesDeclared,
  "policy.allowed_capabilities.declared": checkPolicyAllowedCapabilitiesDeclared,
  "sources.references.resolve": checkSourcesReferencesResolve,
  "state.focused.resolve": checkStateFocusedResolve,
  "state.selected.resolve": checkStateSelectedResolve,
  "policy.class_policies.valid": checkPolicyClassPoliciesValid,
  "accessibility.voice_summary.present": checkAccessibilityVoiceSummaryPresent,
  "lifecycle.resume_key.present_for_artifact": checkLifecycleResumeKeyPresentForArtifact,
  "policy.external_navigation.explicit": checkPolicyExternalNavigationExplicit,
  "sandbox.launch_reference.present": checkSandboxLaunchReferencePresent,
  "event.id.present": checkEventIdPresent,
  "event.type.supported": checkEventTypeSupported,
  "event.actor.supported": checkEventActorSupported,
  "event.timestamp.present": checkEventTimestampPresent,
  "event.surface_id.matches_context": checkEventSurfaceIdMatchesContext,
  "event.view_id.resolve_when_present": checkEventViewIdResolveWhenPresent,
  "event.payload.by_type.valid": checkEventPayloadByTypeValid,
  "patch.id.present": checkPatchIdPresent,
  "patch.surface_id.matches_context": checkPatchSurfaceIdMatchesContext,
  "patch.base_revision.matches_surface": checkPatchBaseRevisionMatchesSurface,
  "patch.reason.supported": checkPatchReasonSupported,
  "patch.ops.non_empty": checkPatchOpsNonEmpty,
  "patch.ops.supported": checkPatchOpsSupported,
  "patch.ops.references.resolve": checkPatchOpsReferencesResolve,
  "patch_sequence.id.present": checkPatchSequenceIdPresent,
  "patch_sequence.surface_id.matches_context": checkPatchSequenceSurfaceIdMatchesContext,
  "patch_sequence.patches.non_empty": checkPatchSequencePatchesNonEmpty,
  "patch_sequence.patches.id.present": checkPatchSequencePatchesIdPresent,
  "patch_sequence.patches.revisions.chain": checkPatchSequencePatchesRevisionsChain,
  "patch_sequence.patches.supported": checkPatchSequencePatchesSupported,
  "patch_sequence.patches.references.resolve": checkPatchSequencePatchesReferencesResolve
};

function getCoreChecks(kind) {
  switch (kind) {
    case "event":
      return EVENT_CORE_CHECKS;
    case "patch":
      return PATCH_CORE_CHECKS;
    case "patch-sequence":
      return PATCH_SEQUENCE_CORE_CHECKS;
    case "surface":
    default:
      return SURFACE_CORE_CHECKS;
  }
}

function runChecks(ctx, kind) {
  const requiredChecks = Array.isArray(ctx.expectation.requiredChecks) ? ctx.expectation.requiredChecks : [];
  const codes = [...new Set([...getCoreChecks(kind), ...requiredChecks])];
  const diagnostics = [];
  const checkResults = [];

  for (const code of codes) {
    const checker = CHECKS[code];
    if (!checker) {
      diagnostics.push(makeDiagnostic(code, `No validator check is implemented for ${code}.`));
      checkResults.push({ code, passed: false });
      continue;
    }
    const result = checker(ctx);
    if (result.length > 0) {
      diagnostics.push(...result);
      checkResults.push({ code, passed: false });
    } else {
      checkResults.push({ code, passed: true });
    }
  }

  return { diagnostics, checkResults };
}

function formatDiagnostics(diagnostics) {
  return diagnostics.map((diagnostic) => `    - ${diagnostic.code}: ${diagnostic.message}`).join("\n");
}

function normalizeExpectedDiagnosticCodes(expectation) {
  return (expectation.expectedDiagnostics ?? [])
    .map((item) => (typeof item === "string" ? item : item?.code))
    .filter(Boolean)
    .sort();
}

function matchesExpectation(result, expectation) {
  const actualDiagnosticCodes = [...new Set(result.diagnostics.map((diagnostic) => diagnostic.code))].sort();
  const expectedDiagnosticCodes = normalizeExpectedDiagnosticCodes(expectation);
  const diagnosticMatch = expectation.diagnosticMatch ?? "exact";

  if (expectation.expectedValidity === "valid") {
    return actualDiagnosticCodes.length === 0;
  }

  if (diagnosticMatch === "contains") {
    return expectedDiagnosticCodes.every((code) => actualDiagnosticCodes.includes(code));
  }

  return (
    actualDiagnosticCodes.length === expectedDiagnosticCodes.length &&
    actualDiagnosticCodes.every((code, index) => code === expectedDiagnosticCodes[index])
  );
}

async function loadContextDocument(fixturesRoot, entry) {
  if (!nonEmptyString(entry.contextSurface)) {
    return null;
  }
  return readJson(path.resolve(fixturesRoot, entry.contextSurface));
}

function createContextForEntry(kind, document, expectation, protocolVersion, contextDocument) {
  switch (kind) {
    case "event":
      return createEventContext(document, expectation, protocolVersion, contextDocument);
    case "patch":
      return createPatchContext(document, expectation, protocolVersion, contextDocument);
    case "patch-sequence":
      return createPatchSequenceContext(document, expectation, protocolVersion, contextDocument);
    case "surface":
    default:
      return createSurfaceContext(document, expectation, protocolVersion);
  }
}

function buildRuntimeAssertionResult(kind, ctx, expectation) {
  if (!["patch", "patch-sequence"].includes(kind) || !isObject(expectation.expectedRuntimeState)) {
    return null;
  }

  const diagnostics = runRuntimeAssertionForPatchLikeFixture(kind, ctx, expectation);
  return {
    code: "runtime_state.matches_expectation",
    passed: diagnostics.length === 0,
    diagnostics
  };
}

async function validateFixture(manifestPath, entry, protocolVersion) {
  const fixturesRoot = path.dirname(manifestPath);
  const fixturePath = path.resolve(fixturesRoot, entry.fixture);
  const expectationPath = path.resolve(fixturesRoot, entry.expectation);
  const kind = entry.kind ?? "surface";

  const document = await readJson(fixturePath);
  const expectation = await readJson(expectationPath);
  const contextDocument = await loadContextDocument(fixturesRoot, entry);
  const ctx = createContextForEntry(kind, document, expectation, protocolVersion, contextDocument);
  const result = runChecks(ctx, kind);
  const runtimeAssertion = buildRuntimeAssertionResult(kind, ctx, expectation);
  if (runtimeAssertion) {
    result.checkResults.push({
      code: runtimeAssertion.code,
      passed: runtimeAssertion.passed
    });
    result.diagnostics.push(...runtimeAssertion.diagnostics);
  }
  const expectationMatch = matchesExpectation(result, expectation);

  return {
    entry,
    kind,
    fixturePath,
    expectationPath,
    result,
    expectation,
    passed: expectationMatch
  };
}

async function main() {
  const manifestArg = process.argv[2] ?? "fixtures/manifest.v0_1.json";
  const manifestPath = path.resolve(projectRoot, manifestArg);
  const manifest = await readJson(manifestPath);
  const protocolVersion = manifest.protocolVersion;
  const fixtureEntries = Array.isArray(manifest.fixtures) ? manifest.fixtures : [];

  if (!nonEmptyString(protocolVersion)) {
    throw new Error("Manifest protocolVersion must be a non-empty string.");
  }

  const results = [];
  for (const entry of fixtureEntries) {
    results.push(await validateFixture(manifestPath, entry, protocolVersion));
  }

  let hasFailure = false;
  for (const result of results) {
    const checkCount = result.result.checkResults.length;
    if (result.passed) {
      process.stdout.write(`PASS ${result.entry.id} [${result.kind}] (${checkCount} checks)\n`);
      continue;
    }

    hasFailure = true;
    process.stderr.write(`FAIL ${result.entry.id} [${result.kind}]\n`);
    process.stderr.write(`  fixture: ${path.relative(projectRoot, result.fixturePath)}\n`);
    process.stderr.write(`  expectation: ${path.relative(projectRoot, result.expectationPath)}\n`);
    if (nonEmptyString(result.entry.contextSurface)) {
      process.stderr.write(`  contextSurface: ${result.entry.contextSurface}\n`);
    }
    if (result.result.diagnostics.length > 0) {
      process.stderr.write(`${formatDiagnostics(result.result.diagnostics)}\n`);
    } else {
      process.stderr.write("    - expectation mismatch without diagnostics\n");
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Validated ${results.length} fixture(s) successfully.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
