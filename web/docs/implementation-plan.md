# AlgoCasts Web Implementation Plan

> Execute inline in the requested `web/` directory. Preserve all existing exercise and competency source files.

**Goal:** A working study portal and browser coding playground, deployable to a VPS.
**Architecture:** Build-time content ingestion, Vite static UI, opaque sandbox Worker runner, local progress.
**Tech stack:** TypeScript, Vite, CodeMirror, marked, DOMPurify, Nginx, optional Caddy.
**Spec:** [design.md](design.md).

## Global constraints

- Add files under `web/`; do not edit exercise sources.
- Match reference fonts/palette, responsive keyboard-accessible UI.
- Do not run learner code on VPS; no backend credentials.

## Review focus

- Wrong/stub answers cannot become solved; skipped cases disclosed.
- Infinite loops are terminated and network access blocked.
- Missing/corrupt localStorage and backup data do not break navigation.
- Content paths including spaces, special XML labels and HTML scripts remain safe.
- Production sandbox headers permit execution while isolating the app origin.

## Tasks

- [x] 1. Content: generate problem JSON, clean AST stubs, solutions, competency documents, SVG diagrams. Test source counts, stub separation and fixture execution.
- [x] 2. Runner: implement minimal compatibility for existing tests, isolated browser bridge and timeout. Test reference solutions, failing answers and API cases.
- [x] 3. Interface: home, searchable problem list, editor, results, hints/solutions, guides, competency readers; persistent local progress and backup.
- [x] 4. VPS: Docker/Nginx, compose, optional Caddy TLS, environment example and deployment instructions.
- [x] 5. Verify: unit suite, original repo suite, production build, desktop/mobile browser flows and available Docker checks. Record evidence and remaining limits.

## Review and verification record

- UI refinements: first pass by GPT-6 Luna (high); Codex reviewed both files and corrected mobile grid shrinking, quiz-state preservation, skip-link behavior, theme state and test-result readability.
- Diagram conversion/viewer: Codex; browser measurements found no SVG text outside the canvas across all 115 diagrams.
- Web gates: 13 test groups passed, TypeScript check and Vite production build passed. Original root suite: 27 suites / 139 tests passed.
- Browser runner: all 34 reference answers passed all 176 functional cases; valid reversed Two Sum indices also accepted.
- Browser UI: 30 route/viewport checks across 320, 375, 414, 768 and 1440 px; search, bookmarks, filters, theme, keyboard skip-link, image zoom and mark-read preservation passed with no page errors.
- Deployment: both Compose configurations validate. Browser smoke with the exact Nginx CSP values passed Reverse String (3 cases), Chocolate Report (16 cases), opaque-origin/DOM/storage isolation and the embedded quiz. Docker daemon unavailable, so container startup and live VPS/TLS remain untested.

## Full-window correction

The previous screenshot-only matrix missed a native-window failure: the handed-off Chrome window retained a 1440px emulated viewport inside a 1920px window, and the workspace also had fixed minimum heights/max width. A native viewport profile and a separate viewport-fitted coding layout now address both boundaries. Regression starts red on the actual window mismatch and workspace bounds, then measures the real browser content area including browser chrome. User-facing native handoff preserves localStorage and never runs the learner draft automatically.

Native-window follow-up verification: 40 combinations across 8 physical window sizes × 5 representative problems, 5 breakpoint cases (979/980 width and 649/650 content height), and 35 small/short viewport route checks passed. Verified actual button hit targets, long statement scrolling, CodeMirror pane bounds, 29 Linked List results scrolling, route scope reset and preserved native handoff storage. 13 repository test groups and the production build passed. Browser measurements use actual innerHeight, including the 87px browser chrome difference on this host; no fixed emulation is used for the user-facing window.

Container content update: added the original competency/Container/container-review.html as the 10th competency topic, preserving source bytes, all 3 levels, quizzes and summary sections. Browser verified card→reader navigation, quiz response, mark-read persistence and widths 320/375/768; 14 test groups and production build passed.

Cloud and CI/CD content update: added competency/Cloud/cloud-skill-review.html and competency/CICD/ci-cd-review.html as the 11th and 12th competency topics, byte-identical to the sources. Cloud tags levels inside each topic instead of using "ระดับ ..." h2 headings, so its card counts its 15 topics; the other 10 cards keep their previous manifest entries. Under the production Nginx CSP, the per-topic quizzes, the Cloud randomized final exam and the CI/CD timed-set reshuffle all ran with no console errors; 16 test groups and the production build passed.

Application Security content update: added competency/Application Security/application-security-review.html as the 13th competency topic, byte-identical to the source; the other 12 cards keep their previous manifest entries. Its seven localStorage, eval, fetch and document.cookie matches are lesson text and quiz data, not executed code, so the sandboxed frame needs no storage access. Under the production Nginx CSP, a per-topic quiz answer, the Deloitte-style set (new set, submit), the final exam (reshuffle, level filter, summary) and the topic retry button all responded with no console errors; 17 test groups and the production build passed.
