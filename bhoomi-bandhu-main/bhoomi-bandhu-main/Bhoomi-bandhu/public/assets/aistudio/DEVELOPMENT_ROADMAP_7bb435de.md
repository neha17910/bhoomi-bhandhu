# DEVELOPMENT_ROADMAP.md

**Project:** BhoomiBandhu
**Document type:** Target roadmap (greenfield rebuild — companion to PROJECT_MASTER_CONTEXT.md)
**Last updated:** 2026-11-21

---

## 0. CURRENT REALITY

- Repository: deleted, rebuilding from zero.
- Code written so far: none.
- Immediate workflow choice: generate UI screens in Google Stitch first, then build FastAPI backend against the finalized frontend.
- Hard deadline pressure: a working demo is wanted by Monday. This roadmap treats that as **Phase 0–2 only** — a real, honest slice — not the full 12-module platform. Phases 3+ are the actual multi-week build.

---

## 1. PHASING OVERVIEW

| Phase | Goal | Realistic timing |
|---|---|---|
| Phase 0 | Screens in Google Stitch (design system locked) | Now → before backend starts |
| Phase 1 | FastAPI + Postgres foundation: Auth + roles | Day 1 of backend work |
| Phase 2 | Farmer Dashboard (real, wired to auth) + one fully real module | Day 1–2 (Monday target) |
| Phase 3 | Government Schemes + Warehouse module (full CRUD) | Week 2 |
| Phase 4 | Crop Insurance info + Loans info modules | Week 2–3 |
| Phase 5 | ML Crop Advisor service | Week 3 |
| Phase 6 | AI Farmer Chat | Week 3–4 |
| Phase 7 | Farmer Well-Being (informational tier only, pending compliance decision for professional-matching) | Week 4 |
| Phase 8 | Admin Portal + Support module | Week 4–5 |
| Phase 9 | Testing, accessibility pass, performance, deployment | Week 5–6 |

**For Monday, the only honest target is the end of Phase 2.** Everything else should appear in the UI as clearly-labeled "Coming Soon," not as fake working features.

---

## 2. PHASE 0 — SCREEN DESIGN (Google Stitch)

**Output:** Exported screen designs/HTML-CSS/React starting point for all screens below, using the locked design system from PROJECT_MASTER_CONTEXT.md Section 7.

**Tier 1 (build first — core shell):**
- [ ] Splash/Onboarding
- [ ] Login
- [ ] Register (role selector: Farmer / Warehouse Owner)
- [ ] Farmer Dashboard (home)
- [ ] Bottom nav + drawer shell

**Tier 2 (first real module — Schemes):**
- [ ] Schemes list (search + filter)
- [ ] Scheme detail
- [ ] Eligibility checker form

**Tier 3 (placeholder screens — one each, so nav feels complete):**
- [ ] Warehouse list/map, detail, booking form
- [ ] Insurance hub, PMFBY detail
- [ ] Loans list, detail
- [ ] Crop Advisor input + result
- [ ] AI Chat interface
- [ ] Well-being resource hub
- [ ] Profile view/edit
- [ ] Notifications
- [ ] Help/FAQ + contact form

**Exit criteria for Phase 0:** every screen uses the same color tokens, type scale, and nav pattern. If a screen looks like it belongs to a different app, redo it before moving on — inconsistency compounds once wired to real components.

---

## 3. PHASE 1 — BACKEND FOUNDATION

**Goal:** Auth + roles, nothing else yet.

- [ ] FastAPI project structure (`/app`, `/app/models`, `/app/routers`, `/app/core`, `/app/schemas`)
- [ ] PostgreSQL connection via SQLAlchemy + Psycopg
- [ ] Alembic initialized, first migration = `users` table
- [ ] `User` model: id, email, hashed_password (Argon2), role enum (farmer/warehouse_owner/admin/support/professional), created_at
- [ ] Pydantic schemas for register/login/response (never return hashed_password)
- [ ] `/auth/register`, `/auth/login`, `/auth/me` endpoints
- [ ] JWT issuance + verification dependency
- [ ] Role-based dependency (`require_role(...)`) usable on any future router
- [ ] CORS configured for the Vite dev server
- [ ] `.env` for secrets (JWT secret, DB URL) — never hardcoded

**Exit criteria:** a farmer and a warehouse owner can both register, log in, get a JWT, and hit a protected `/auth/me` route returning correct role-scoped data. Verified by actually running it, not assumed.

---

## 4. PHASE 2 — FARMER DASHBOARD + FIRST REAL MODULE

**Dashboard (frontend wired to real auth):**
- [ ] React app scaffolded with Vite + Tailwind, matching Stitch design tokens
- [ ] Auth context (login/logout/token storage/protected routes)
- [ ] Dashboard shell pulling real `/auth/me` data (name, role) — no placeholder "John Farmer" text
- [ ] Nav shows all 12 modules; unbuilt ones route to a genuine "Coming Soon" screen (not a dead link, not fake content)

**First real module — Government Schemes (recommended: fastest to make fully real since it's read-heavy, no transactional logic):**
- [ ] `Scheme` model + Alembic migration (name, description, category, eligibility, documents, benefits, official_link)
- [ ] Seed data: a small set of **real, verifiable** scheme entries (e.g. PM-KISAN, PMFBY, Soil Health Card) with actual sourced content, not invented text
- [ ] `/schemes` GET (list + search/filter), `/schemes/{id}` GET
- [ ] Frontend: schemes list + detail pages wired to the real API

**Exit criteria:** a farmer can register, log in, land on a dashboard that shows their real name/role, navigate to Schemes, search/filter real scheme data, and open a real detail page. Every other module link honestly says "Coming Soon."

---

## 5. PHASE 3+ — SUBSEQUENT MODULES (post-Monday, real build)

Order chosen for dependency and complexity reasons:

1. **Warehouse Management** — introduces the first two-sided role flow (farmer requests, owner approves). Good next complexity step after read-only Schemes.
2. **Crop Insurance info** — similar shape to Schemes, reuses patterns.
3. **Loans info** — same pattern again, fast once Schemes/Insurance exist.
4. **ML Crop Advisor** — first standalone Python ML service; needs its own validation step (test against known agronomic cases before trusting output) rather than being wired in blind.
5. **AI Farmer Chat** — needs careful prompt design so it never fabricates facts or claims expertise; Groq integration re-verified from scratch, not assumed to still work.
6. **Well-being module** — informational content first; the professional-matching/appointment piece is **explicitly held back pending a compliance/privacy decision** (data handling, professional verification, liability) — do not build live booking for this module without that conversation happening first.
7. **Admin Portal** — once there's real data from the above modules worth administering.
8. **Support module** — simplest, slot in whenever convenient.

---

## 6. MODULE STATUS TABLE (update this as real work lands — this is the living source of truth)

| Module | Status | Notes |
|---|---|---|
| Auth & User Management | ⬜ Not Started | Phase 1 |
| Farmer Dashboard | ⬜ Not Started | Phase 2 |
| Government Schemes | ⬜ Not Started | Phase 2 |
| Storage & Warehouse | ⬜ Not Started | Phase 3 |
| Crop Insurance | ⬜ Not Started | Phase 3 |
| Financial Services/Loans | ⬜ Not Started | Phase 3 |
| ML Crop Advisor | ⬜ Not Started | Phase 3 |
| AI Farmer Chat | ⬜ Not Started | Phase 3 |
| Farmer Well-Being | ⬜ Not Started | Phase 3 (compliance decision pending for professional tier) |
| User Profile | ⬜ Not Started | Phase 2 (basic view), expanded later |
| Admin Portal | ⬜ Not Started | Phase 3 |
| Help & Support | ⬜ Not Started | Phase 3 |

**Legend:** ✅ Implemented · 🟡 Partial · ⬜ Not Started · 🔴 Broken

---

## 7. HOW THIS ROADMAP SHOULD BE USED

- Before each coding session: open this file, find the current phase, confirm nothing above it was skipped.
- After each coding session: update Section 6's status table with what's actually true, not aspirational.
- If scope needs to shrink for Monday, cut modules from Phase 2's "Coming Soon" list — never cut corners *within* Auth, Dashboard, or Schemes by faking data or skipping validation. A smaller real thing is worth more than a bigger fake one, for a technical demo in particular.
