# AI Agent Instructions - Alloc

This file defines the instructions and standards that AI agents must follow in the Alloc project.

## Core Standards (Derived from .cursorrules)

### 1. Naming & Style
- Use `camelCase` for functions and variables.
- Use descriptive names (avoid `Data`, `Info`, `Object`).
- Functions: Verbs (e.g., `calculateTotalAdjustedPrice`).
- Variables: Nouns (e.g., `userProfile`).
- Constants: `UPPER_SNAKE_CASE`.

### 2. Logic & Control Flow
- Always use curly braces `{}` for `if` statements.
- Use explicit boolean values in conditions.
- Null checks & Validations: Always use `@/utils/validators.ts` when applicable (e.g., `isNil`, `isNotEmptyArray`, `isEmptyString`). Avoid raw `length === 0` or `== null` checks if a validator exists.
- Use strict equality `===` for all other comparisons.
- Prefer early returns over `else` blocks.
- Use `??` (Nullish Coalescing) by default.

### 3. Functional Programming
- Immutability: Do not reassign variables.
- Strictly use `const`, avoid `let`.
- Extract utility logic into separate functions.
- No magic values; use constants.

### 4. TypeScript
- No `as` casting.
- No `any` type.
- Rely on type inference where clear.

### 5. React & React Native
- Component export: `export const ComponentName = ...`.
- No `setState` directly in props; use handler functions.
- Avoid `useEffect`; prefer derived state or event handlers.
- **Separation of Concerns**: Separate Business Logic (hooks, calculations) from Rendering (JSX).
- Pre-calculate values in Business Logic Area.

## Operational Principles (Working Rules)

- **Surgical Changes**: Only modify files strictly necessary for the assigned task. Avoid unrelated refactoring.
- **Explicit Git Operations**: Do not perform `git commit`, `push`, or create Pull Requests unless explicitly instructed by the user.
- **Consult Before Expanding**: If a task requires changes beyond the initial context or if additional improvements are identified, ask for user confirmation before proceeding.
- **No Unsolicited Work**: Do not initiate tasks or modifications that were not specifically requested.
- **Plan-First Approach**: Before making any file edits, provide a concise summary of the planned changes and wait for user approval.

## Pull Request Rules

- **PR Template Required**: Before creating or updating a Pull Request, open `.github/PULL_REQUEST_TEMPLATE.md` and follow its structure exactly. Do not use an arbitrary title or description format when a repository template exists.

## Documentation Rules

- **Documentation Tone**: When adding or editing project documentation, write in an imperative tone.
- **Prohibited Documentation Style**: Do not use explanatory ending forms such as `-한다`, `-합니다`, `-해야 합니다` in project documentation.
