# TypeScript migration verification

Date: 2026-10-31. Baseline: original JavaScript at `feeab87`; tests run with the same local Jest version before and after migration.

## Existing test outcomes

- `completed`: 27 suites; 139 passed, 0 failed, 0 skipped, 139 total tests. Every test name and status matches baseline.
- `exercises`: 27 suites; 32 passed, 78 failed, 30 skipped, 140 total tests. Every test name and status matches baseline.

The practice directory is intentionally incomplete. Its failures are preserved, not hidden, skipped, or converted to passing tests. `npm test` selects completed solutions; `npm run test:exercises` and `npm run test:all` include these existing failures and return exit code 1.

## TypeScript and runtime checks

- All 122 original `.js` files have `.ts` counterparts; no repository JavaScript source remains outside dependencies and ignored build output.
- Strict typechecking covers both source trees and all 54 original test files, without `any`, `@ts-ignore`, or `@ts-nocheck`.
- CommonJS build emits to ignored `dist/`, with declarations and source maps.
- Tests retain their original names and assertions. Only imports, generic arguments, non-null assertions, and typed spy access changed.
- Starter class `declare` members have no emitted implementation. Starter function bodies still return `undefined`.
- Existing algorithm preconditions and edge-case limitations remain unchanged; this migration does not claim algorithms now support previously unsupported inputs.

- 79 differential runtime checks compare original and compiled modules, including return values, thrown error names/messages, console output, empty containers, links, and traversals. All matched.
- Both HTML files loaded in headless Chrome from their actual CDN URL with SRI enabled. jQuery reports `4.0.0+slim`. Completed example logs exactly `Hello`, `There!`; clicking afterward adds no logs. Starter page logs nothing and remains usable.
- Fresh-context code review found no Critical, Important, or Minor issues.

## Verified commands

- `npm ci`: successful clean installation from lockfile.
- `npm run typecheck`: successful.
- `npm test`: 139 passing completed tests.
- `npm run test:all`: expected exit code 1 from original unsolved exercises; 171 passed, 78 failed, 30 skipped across 54 suites.
- Nested `npm test -- linkedlist` in completed solutions: 29 passing tests. Nested starter filtering also selects the intended exercise.
- `npm test -- --listTests`: passes Jest options through the npm wrapper and lists all 27 completed suites.
- `npm ls --depth=0`: dependency tree resolves.
- `npm outdated`: only the newer Node type major is reported; `@types/node` stays on current 22.x to match the supported Node.js floor.
- `git diff --check`: clean.

## Dependencies

- TypeScript 7.0.2, Jest 30.5.2, `@types/jest` 30.0.0, and Node.js 22 type definitions are pinned in the root lockfile.
- Compile before Jest instead of using `ts-jest`, whose current peer dependency requires TypeScript <7.
- Both HTML event examples use jQuery 4.0.0 slim from the official CDN. SHA-256 was calculated from the downloaded file and matches the HTML integrity attribute.
- Jest uses `watchman: false`: the host Watchman installation fails to load `libicudata.74.dylib`; Node filesystem crawling works without that global tool.
- `npm audit` reports 5 low-severity development dependency findings, all from the single `deepmerge` advisory [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), propagated through Jest. Latest published `deepmerge` is 4.3.1 and has no patched release. The proposed automatic fix downgrades Jest to 25.1.0; that downgrade was not applied.

## Original failing practice tests

These 78 named tests failed before migration and fail identically after migration:

- `anagrams`: "hello" is an anagram of "llohe"
- `anagrams`: "Whoa! Hi!" is an anagram of "Hi! Whoa!"
- `bst`: Node can insert correctly
- `bst`: Contains returns node with the same data
- `bst`: Contains returns null if value not found
- `capitalize`: capitalizes the first letter of every word in a sentence
- `capitalize`: capitalizes the first letter
- `chunk`: chunk divides an array of 10 elements with chunk size 2
- `chunk`: chunk divides an array of 3 elements with chunk size 1
- `chunk`: chunk divides an array of 5 elements with chunk size 3
- `chunk`: chunk divides an array of 13 elements with chunk size 5
- `circular`: circular detects circular linked lists
- `circular`: circular detects circular linked lists linked at the head
- `circular`: circular detects non-circular linked lists
- `events`: Events can be registered then triggered
- `events`: Multiple events can be registered then triggered
- `events`: Events can be triggered multiple times
- `events`: Events can have different names
- `events`: Events can be toggled off
- `fib`: calculates correct fib value for 1
- `fib`: calculates correct fib value for 2
- `fib`: calculates correct fib value for 3
- `fib`: calculates correct fib value for 4
- `fib`: calculates correct fib value for 15
- `fizzbuzz`: Calling fizzbuzz with `5` prints out 5 statements
- `fizzbuzz`: Calling fizzbuzz with 15 prints out the correct values
- `fromlast`: fromLast returns the node n elements from the end
- `levelwidth`: levelWidth returns number of nodes at widest point
- `levelwidth`: levelWidth returns number of nodes at widest point
- `matrix`: matrix produces a 2x2 array
- `matrix`: matrix produces a 3x3 array
- `matrix`: matrix produces a 4x4 array
- `maxchar`: Finds the most frequently used char
- `maxchar`: Works with numbers in the string
- `midpoint`: Midpoint returns the middle node of an odd numbered list when the list has 3 elements
- `midpoint`: Midpoint returns the middle node of an odd numbered list when the list has 5 elements
- `midpoint`: Midpoint returns the middle node of an even numbered list when the list has 2 elements
- `midpoint`: Midpoint returns the middle node of an even numbered list when the list has 4 elements
- `palindrome`: "aba" is a palindrome
- `palindrome`: "1000000001" a palindrome
- `palindrome`: "pennep" a palindrome
- `pyramid`: prints a pryamid for n = 2
- `pyramid`: prints a pryamid for n = 3
- `pyramid`: prints a pryamid for n = 4
- `qfroms`: can add elements to a queue
- `qfroms`: can remove elements from a queue
- `qfroms`: Order of elements is maintained
- `qfroms`: peek returns, but does not remove, the first value
- `queue`: can add elements to a queue
- `queue`: can remove elements from a queue
- `queue`: Order of elements is maintained
- `reverseint`: ReverseInt handles 0 as an input
- `reverseint`: ReverseInt flips a positive number
- `reverseint`: ReverseInt flips a negative number
- `reversestring`: Reverse reverses a string
- `reversestring`: Reverse reverses a string
- `sorting`: Bubble sort sorts an array
- `sorting`: Selection sort sorts an array
- `sorting`: Merge sort merge function can join together two sorted arrays
- `sorting`: Merge sort sorts an array
- `stack`: stack can add and remove items
- `stack`: stack can follows first in, last out
- `stack`: peek returns the first element but doesnt pop it
- `steps`: steps called with n = 1
- `steps`: steps called with n = 2
- `steps`: steps called with n = 3
- `tree`: Node Node has a data and children properties
- `tree`: Node Node can add children
- `tree`: Node Node can remove children
- `validate`: Validate recognizes a valid BST
- `validate`: Validate recognizes an invalid BST
- `vowels`: returns the number of vowels used
- `vowels`: returns the number of vowels used when they are capitalized
- `vowels`: returns the number of vowels used
- `vowels`: returns the number of vowels used
- `weave`: queues have a peek function
- `weave`: peek returns, but does not remove, the first value
- `weave`: weave can combine two queues
