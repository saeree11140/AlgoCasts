# TypeScript Migration Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Convert every repository JavaScript source and test to TypeScript while preserving behavior and updating libraries.

**Architecture:** Compile strict TypeScript to ignored `dist/`, then run Jest against compiled CommonJS. Keep starter exercises unfinished and compare every existing test outcome against the original JavaScript baseline.

**Tech Stack:** Node.js 22+, TypeScript 7, Jest 30, current jQuery CDN for browser examples.

**Spec:** User request in this session: migrate all `.js` to `.ts`, verify identical behavior, update libraries where present.

## Global Constraints

- Preserve completed algorithms and unfinished exercise behavior.
- Typecheck source and tests with strict mode; no `any` or TypeScript suppression directives.
- Use local dependencies and a committed lockfile; no global upgrades.
- Work in the existing clean `feature/convert-to-ts` checkout; leave changes uncommitted for review.

## Review Focus

- Empty collections, null links, and unsupported algorithm inputs preserve current results or exceptions.
- Generic containers accept the same string/number examples, including the original raw `Node.next` test.
- Console tests preserve output and restore spies.
- Both starter and completed tests keep every assertion and test name.
- Browser event example still logs both handlers and unregisters clicks after updating jQuery.

### Task 1: Capture baseline and provide current tooling

**Files:** root `package.json`, `package-lock.json`, temporary baseline results.

**Interfaces:** Local `tsc` and `jest` binaries; JSON baseline recording test names and outcomes.

- [x] Install current TypeScript, Jest, Jest types, Node 22 types.
- [x] Run every original JavaScript test; record counts and per-test statuses separately for both directories.
- [x] Verify migration check currently fails because `.js` files remain.

### Task 2: Migrate source, tests, and configuration

**Files:** every `exercises/**/*.js`, `completed_exercises/**/*.js`, root `tsconfig.json`, `jest.*.json`, nested `package.json`, `.gitignore`.

**Interfaces:** Preserve CommonJS exports using typed `import = require` and `export =`; generic collections and explicit nullable links.

- [x] Rename all JavaScript files, add parameter/property/return types, preserve algorithms and assertions.
- [x] Supply type-only starter declarations without filling in exercise solutions.
- [x] Build to `dist/`; configure separate completed, starter, and combined test commands.
- [x] Typecheck, build, run both suites, compare every original outcome with baseline.

### Task 3: Update examples, documentation, and verify

**Files:** both `events/example.html`, `README.md`, verification record.

**Interfaces:** jQuery CDN with matching integrity hash; documented root and per-directory commands.

- [x] Update jQuery to current stable, verify browser event behavior.
- [x] Document install, typecheck, build, test filtering, and expected starter failures.
- [x] Run clean install, typecheck, complete suite, baseline comparison, emitted CommonJS smoke checks, dependency audit and outdated checks.
- [x] Review diff for changed runtime behavior, retained JavaScript sources, unsafe types, and stale documentation.

## Execution record

All tasks completed inline on `feature/convert-to-ts`; changes left uncommitted for review. Runtime and baseline evidence is summarized in `docs/typescript-migration-verification.md`. Final independent review found no issues. A final CLI check caught npm consuming forwarded Jest options; adding `--` to the root test wrapper fixed it, verified with `npm test -- --listTests`.
