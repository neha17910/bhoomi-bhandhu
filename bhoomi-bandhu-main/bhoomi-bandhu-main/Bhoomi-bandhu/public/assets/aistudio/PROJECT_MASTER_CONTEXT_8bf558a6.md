# PROJECT_MASTER_CONTEXT.md

**Project:** BhoomiBandhu — *A Trusted Friend for Every Farmer*
**Owner:** Pranav Dhiman (B.Tech CSE, team lead)
**Document type:** Target specification (this is NOT a codebase audit — see status note below)
**Last updated:** 2026-11-21

---

## 0. STATUS NOTE — READ THIS FIRST

The original BhoomiBandhu codebase (React + Express + MySQL, later partially migrated toward React + FastAPI + PostgreSQL) **has been deleted**. The project is being rebuilt from zero.

This document is a **target specification**, not an implementation audit. Every module below is described as it is *intended to work*, not as it currently exists. Until real code exists in a real repository, any claim of "implemented" would be fabricated — so this document contains no status claims beyond "Not Started."

When a real repository exists again (even a partial one), this file should be regenerated as a true audit, with each module re-tagged using the status legend in Section 6, backed by actual file paths and code inspection — not assumptions carried over from this spec.

---

## 1. PRODUCT VISION

BhoomiBandhu is a unified agri-tech platform that brings together agricultural information, government schemes, crop insurance, financial services, warehouse/storage booking, AI-powered crop recommendations, conversational AI assistance, and farmer well-being resources — all currently scattered across disconnected government and private platforms — into one accessible, mobile-first digital ecosystem for Indian farmers.

**Success metric:** not technical sophistication, but whether an ordinary farmer with basic smartphone literacy can understand, trust, and use the platform to solve a real problem.

---

## 2. PROBLEM STATEMENT

1. Farmers struggle to discover relevant government schemes.
2. Eligibility criteria and application processes are confusing.
3. Crop insurance information is not easily accessible.
4. Finding suitable warehouse/storage facilities is difficult.
5. Farmers lack personalised crop recommendations.
6. Agricultural information is fragmented across platforms.
7. Financial assistance information is hard to access conveniently.
8. No single accessible channel exists for farmers to ask agricultural questions.
9. Farmer mental health and well-being is largely overlooked.
10. Agricultural services lack a unified, simple user experience.

---

## 3. USER ROLES

| Role | Access scope |
|---|---|
| **Farmer** | Primary user. Dashboard, schemes, insurance info, loan info, warehouse booking, crop advisor, AI chat, well-being resources, profile. |
| **Warehouse Owner** | Manages own warehouse listings, availability, and incoming booking requests only. No access to other owners' data. |
| **Administrator** | Full platform management: users, warehouses, schemes content, support requests, monitoring. |
| **Support Team Member** | Access to support/help-desk queue only. |
| **Psychiatrist / Well-being Professional** | Scoped, privacy-controlled access to well-being module requests. Treated as a higher-sensitivity role (see Section 8). |

Each role gets its own frontend route tree and backend permission scope. Farmers never see admin/owner/professional UI; the reverse is also true.

---

## 4. MODULES — TARGET FUNCTIONAL SCOPE

### Module 1: Farmer Dashboard
Centralised home view: profile summary, recent activity, booking/loan/insurance status snippets, notifications, relevant recommendations. Must stay simple — not a data-dense admin-style dashboard.

### Module 2: Storage & Warehouse Management
- **Farmer side:** discover nearby warehouses, search/filter by location & capacity, view pricing, submit booking requests, track status, view history, cancel where permitted.
- **Owner side:** register as owner, manage listings & availability, accept/reject bookings, view operational info.

### Module 3: Crop Insurance
Informational + guidance module covering PMFBY and general crop insurance: plan details, eligibility, required documents, application guidance, application/claim tracking **only where genuinely implemented**. No invented insurer integrations or claims-processing logic.

### Module 4: Government Schemes
Browse/search/filter government schemes, view eligibility, benefits, required documents, application procedure, run eligibility checks, link to official application resources, save/track schemes.

### Module 5: Financial Services & Agricultural Loans
Discover loan options, eligibility, interest/repayment info where available, submit loan-related requests where implemented, track status. Plain-language explanations, no banking jargon.

### Module 6: ML-Based Crop Advisor
Python ML service taking soil + environmental inputs and returning crop recommendations with confidence framing — **never presented as guaranteed outcomes**. Historical reference point: a kNN classifier (k=5) trained on a 120-sample dataset; this is a starting baseline to rebuild/validate, not a guarantee of current capability.

### Module 7: AI Farmer Chat
Conversational assistant for agricultural questions, scheme explanations, and platform navigation help. Historical reference: Groq-powered LLM endpoint. Must communicate in simple language, never fabricate agricultural facts, never claim professional expertise it doesn't have.

### Module 8: Farmer Well-Being
Educational well-being resources, mental health awareness content, support-request flow, and (where implemented) access to professional assistance. **High-sensitivity module** — see Section 8 for special handling requirements. No unsupported medical diagnosis, ever.

### Module 9: Authentication & User Management
Registration, login/logout, Argon2 password hashing, JWT auth, protected routes, role-based access control, password recovery where implemented, secure session handling.

### Module 10: User Profile
Personal/farmer info, profile editing, account settings, preferences, activity/booking/application history, security settings.

### Module 11: Admin Portal
Admin dashboard, user/farmer/warehouse/scheme/insurance/loan administration, support request management, platform monitoring. Must be permission-gated — never reachable by non-admin roles even via direct URL.

### Module 12: Help & Support
Help centre, FAQs, contact support, submit/track support requests.

---

## 5. TECHNICAL ARCHITECTURE (FINAL — DO NOT DEVIATE WITHOUT EXPLICIT DECISION)

### Frontend
React.js + Vite, JavaScript, React Router, Context API, Axios, Tailwind CSS, Framer Motion (sparingly), mobile-first responsive components.

### Backend
Python + FastAPI, SQLAlchemy, Pydantic, JWT auth, Argon2 hashing, REST APIs.

**Hard constraint: FastAPI is the one and only backend. No Express.js. No second/duplicate API system, ever, under any circumstance.**

### Database
PostgreSQL, Psycopg driver, Alembic migrations. Postgres is confirmed available in the dev environment (no SQLite fallback needed).

### AI / ML
Python-based crop prediction service; AI chat integration; external agricultural data sources as genuinely integrated (not assumed).

### External Integrations
OpenWeatherMap (weather), Groq API (chat, pending re-implementation), government scheme sources where a real source exists.

---

## 6. STATUS LEGEND (for future audits of this document)

- ✅ **Implemented** — working, tested, verified against real running code
- 🟡 **Partial** — some backend/frontend exists but flow is incomplete
- ⬜ **Not Started** — no code exists yet
- 🔴 **Broken** — code exists but does not function as intended

**Current status of every module in this document: ⬜ Not Started.** The repository is empty by design; screens are being generated in Google Stitch before backend work begins (see DEVELOPMENT_ROADMAP.md).

---

## 7. DESIGN SYSTEM (locked reference for all screen generation)

| Element | Value |
|---|---|
| Primary color | Earthy green `#2D6A4F` |
| Accent color | Warm amber `#E9A23B` (CTAs only) |
| Background | Cream `#FAF8F3` |
| Typography | Poppins or Inter, one family only |
| Corner radius | 12–16px, consistent |
| Icons | Outline style, always paired with text labels |
| Navigation (mobile) | Bottom tab bar, 4–5 items max |

This must stay identical across every Stitch prompt and every component built later, so 12 modules read as one product.

---

## 8. NON-NEGOTIABLE PROJECT CONSTRAINTS

- No hardcoded/fake data presented as if real.
- No claimed integration that hasn't actually been tested end-to-end.
- No invented insurance or claims-processing capability.
- No unsupported medical/mental-health diagnosis anywhere in Module 8.
- Module 8 (Well-being) professional-matching/booking features require a separate compliance/privacy decision before being built beyond informational content — this is flagged, not yet resolved.
- No second backend system, no MySQL, no Express, under any framing.
- No new dependency or technology introduced without it being discussed first.
- Existing features (once they exist) are not deleted without understanding their purpose first.

---

## 9. CONTINUITY NOTE FOR FUTURE SESSIONS

This file is the source of truth for *what BhoomiBandhu is meant to be*. `DEVELOPMENT_ROADMAP.md` is the source of truth for *what order we build it in and what's done so far*. When work resumes in a new session:

1. Re-read both files before writing any code.
2. Update DEVELOPMENT_ROADMAP.md's status table as real work lands — don't let it drift from the actual repo.
3. If this file and the real codebase ever disagree, the codebase wins — update this file, not the other way around.
