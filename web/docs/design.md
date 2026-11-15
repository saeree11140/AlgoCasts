# AlgoCasts Practice Web

Scope: standalone `web/` inside AlgoCasts, built with Vite, with the menus listed under Design decisions, styled after `competency/Database Design/database-design-review.html`, plus VPS deployment files. The coding playground design was left to the implementer.

## Design decisions

- Vanilla TypeScript + Vite + CodeMirror. Static production build, no server execution or account database. Drafts, bookmarks and progress stay in the current browser; export/import provides backup.
- Home, Problems, Solutions, Guides, Developer Competency. All 27 AlgoCasts exercises, Chocolate Report and six competency coding exercises have executable tests. Competency HTML documents retain their original interactive exams in sandboxed frames. Draw.io pages become local SVG guides.
- IBM Plex Sans Thai typography, self-hosted from `@fontsource/ibm-plex-sans-thai` so the app renders offline (replacing the reference's Prompt), navy ink `#172345`, blue `#1f6fe5`, pale blue canvas, white cards, rounded outlines and semantic colored category chips from the reference. Dense workspace for solving; quieter reading views.
- Generate content at build time from sibling folders without editing originals. Recreate clean stubs from TypeScript AST, keeping helper modules ready to use. Solutions are public study material, deliberately not secret judge data.
- Run transpiled modules in a disposable Worker inside an opaque-origin sandbox iframe. Network disabled by CSP; async API problems use deterministic in-memory fixtures. Parent enforces 8-second timeout and bounds output. This is practice, not a tamper-proof examination service.
- Node multi-stage Docker build with unprivileged Nginx, health check, optional Caddy HTTPS, local-bound default port. Deploy full repository as build context; runtime image contains only static output.

## Alternatives

1. Static reading portal: simplest but lacks runnable practice.
2. Browser sandbox (selected): usable practice without executing visitors' code on VPS.
3. Server judge: suitable for graded multi-user exams, requires containers, queue, authentication and storage; outside this first release.

## Verification

Real reference solutions must pass browser harness; empty and wrong answers fail. Check syntax errors, runtime errors, infinite loop timeout, API pagination/retries, disabled network, draft persistence, filters, documents/quizzes, generated SVGs, mobile overflow and production build. Docker deployment is tested if a daemon is available; otherwise explicitly report the limit.
