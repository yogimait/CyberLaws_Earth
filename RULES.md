# RULES.md — Cyber-Sphere Project Coding Rules

@AGENTS.md

---

## Documentation & explanation style — maximize visualizers

When asked to **document, explain, plan, audit, or compare** anything, lead with visuals, not
prose. Default to the richest visualizer the content allows:

- **Mermaid diagrams** in ```mermaid fences for any flow, relationship, or lifecycle:
  `flowchart` (data/control flow, architecture), `sequenceDiagram` (request lifecycles, multi-actor
  interactions), `stateDiagram-v2` (state machines), `erDiagram` (model relationships),
  `gantt`/dependency graphs (roadmaps).
- **Tables** for any comparison, matrix, or enumerable set: findings (id/severity/effort/tier),
  current-vs-target, per-item property maps, API surface indexes, option trade-offs.
- **Callouts, checklists, severity/emoji legends** to make scannable.

Rules of thumb:
- If a paragraph describes a flow, a hierarchy, or "A then B then C" — draw it instead.
- Quote Mermaid node labels that contain punctuation (`N["Purge: crypto erase"]`) so they render.
- Every non-trivial doc gets: a **system/overview diagram** near the top and a **summary table** of
  the key points; prose only fills gaps the visuals can't carry.
- Keep evidence precise alongside visuals — cite `file:line`
  (e.g. `src/policy/engine.ts:88` for the deny-by-default branch).
- Renders natively on GitHub; note that VS Code needs a Mermaid preview extension.

---

## 1. API response envelope — mandatory, no exceptions

**Every** API response from **every** endpoint uses this envelope. No bare objects, no bare arrays.

### Success

```json
{
  "status": true,
  "statusCode": 200,
  "data": { }
}
```

### Error

```json
{
  "status": false,
  "statusCode": 402,
  "message": "Transaction amount $2.00 exceeds the per-transaction limit of $0.10.",
  "error": {
    "code": "PER_TRANSACTION_LIMIT_EXCEEDED",
    "details": { "requested": "2.00", "limit": "0.10" }
  }
}
```

| Field | Type | Present when | Notes |
|---|---|---|---|
| `status` | `boolean` | always | `true` on 2xx, `false` on 4xx/5xx |
| `statusCode` | `number` | always | must equal the actual HTTP status |
| `data` | `object \| array` | success | the payload. `null` when there is nothing to return |
| `message` | `string` | errors; optional on success | human-readable, safe to show a user |
| `error.code` | `string` | errors | SCREAMING_SNAKE_CASE |
| `error.details` | `object` | optional | machine-readable context |

### How to comply

Never build a `Response` by hand. Use the helpers — they are the single enforcement point:

```ts
import { ok, fail } from "@/lib/http";

export async function GET() {
  const agents = await listAgents();
  return ok({ agents, total: agents.length });        // -> { status, statusCode, data }
}

export async function POST() {
  return fail("PER_TRANSACTION_LIMIT_EXCEEDED", { requested: "2.00", limit: "0.10" });
}
```

Rules:
- `ok(data, statusCode?)` for every success. `fail(code, details?, message?)` for every error.
- `statusCode` in the body always matches the HTTP status of the response.
- The frontend reads `res.data`. It never reads a top-level field other than `status` / `message`.

---

## 2. Naming conventions

| Thing | Case | Example |
|---|---|---|
| Variables, functions, methods, object keys | `camelCase` | `dailyBudgetMinor`, `evaluatePayment()` |
| JSON request and response fields | `camelCase` | `intentId`, `riskScore`, `txHash` |
| Types, interfaces, React components, classes | `PascalCase` | `PaymentIntent`, `DecisionFeed` |
| Constants and enum-like literal maps | `SCREAMING_SNAKE_CASE` | `ERROR_CODES`, `USDC_DECIMALS` |
| Error codes and event types | `SCREAMING_SNAKE_CASE` | `BUDGET_EXCEEDED`, `PAYMENT_SETTLED` |
| Database tables and columns | `snake_case` | `payment_intents`, `amount_minor` |
| Files: modules, utilities | `camelCase.ts` | `allowToken.ts`, `guardedFetch.ts` |
| Files: React components and pages | `kebab-case.tsx` | `decision-feed.tsx`, `agent-detail.tsx` |
| Folders | `kebab-case` | `api-client/`, `attack-drills/` |
| Route segments | `kebab-case` | `/api/v1/payments/evaluate` |

### Naming quality

- Say what it **is**, not what it does mechanically: `remainingDailyBudgetMinor`, not `calcVal`.
- Booleans read as a question: `isFrozen`, `hasActivePolicy`, `canSettle`.
- Async functions that fetch are `get*` / `list*`; ones that mutate are `create*` / `update*`.
- No invented abbreviations. `evaluation`, not `eval`; `request`, not `req` (except the framework's
  own handler parameter); `configuration`, not `cfg`.

---

## 3. Comments

Write code that does not need explaining, then explain only what the code cannot say.

**Do:**
- One short file header — what the file is and who owns it. Two lines maximum.
- One line above a non-obvious decision, explaining **why**, never **what**.
- `// TODO(owner): …` for a real, tracked gap.

**Do not:**
- Multi-line banner blocks, ASCII art, or section dividers inside implementation files.
- Comments restating the code (`// loop over agents` above a loop over agents).
- Commented-out code. Delete it — git remembers.
- JSDoc on every function. Add it only to exported public APIs where the signature is not enough.

---

## 4. Code style, briefly

- TypeScript `strict`. Prefer `unknown` and narrow it.
- Validate every request body with runtime checks at the route boundary.
- Route handlers stay thin: validate → call a lib function → wrap in `ok()`. No business logic.
- No default exports except React pages and layouts, which Next requires.
- Named exports everywhere else, so imports are greppable.

---

## 5. Design system

- **Theme**: Blackish, techy, minimal. Dark backgrounds (#0a0a0a, #111111), subtle borders, muted accents.
- **Mobile-first**: All layouts are designed mobile-first, then enhanced for desktop.
- **Glassmorphism**: Use `backdrop-blur` + semi-transparent backgrounds for panels/drawers.
- **Animations**: Subtle, purposeful micro-animations only. No gratuitous movement.
- **Typography**: Inter font family. Clean hierarchy with consistent sizing.

---

## 6. AI Summary — Groq API

All AI summarization uses the **Groq API** (not Gemini). Use `groq-sdk` with `llama-3.3-70b-versatile` model.

```ts
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
```
