# Security Summary

**Reviewed Files**: 22
**Issues Resolved**: 6

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| Privileged Role Escalation | `server.ts` | 316 | Public `POST /api/auth/register` accepted any client-supplied role including `"support_staff"` without administrator authorization. | High | Fixed | Enforced `verifyAdminBearerToken(req.headers.authorization)` before allowing `"support_staff"` registration and returned HTTP `403` for unauthorized requests. |
| Unauthenticated Password Reset | `server.ts` | 435 | `POST /api/auth/change-password` allowed resetting any account's password by supplying only `{ email, newPassword }` without proving current credentials or holding a valid session token. | High | Fixed | Added HMAC-SHA256 signed session tokens issued on login/registration and required either a matching verified Bearer session token or verified `currentPassword` (checked with `crypto.timingSafeEqual`) before allowing a password change. |
| Unsafe External Link Protocols | `src/pages/LoansPage.tsx`, `src/pages/InsurancePage.tsx`, `src/pages/SchemeDetailPage.tsx`, `firestore.rules` | 151, 274 | Dynamic portal URLs (`websiteUrl` and `officialUrl`) were passed directly into `<a href={...}>` without protocol validation, and Firestore rules allowed non-HTTP strings in `websiteUrl`. | Medium | Fixed | Created `getSafeExternalUrl()` (`src/utils/safeUrl.ts`) allowing only `http:`/`https:`, validated inputs in `AdminPage.tsx` and `AuthContext.tsx`, and added `^https?://.*` pattern enforcement in `firestore.rules` and `firebase-blueprint.json`. |
| Missing HTTP Security Headers & Rate Limits | `server.ts` | 127 | Express responses lacked defensive browser security headers (`CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`) and rate limits on auth, weather, chat, and mail routes. | Medium | Fixed | Disabled `x-powered-by`, applied hardened HTTP security headers (and `HSTS` in production), and added IP sliding-window rate limiters (`25 req/15min` on auth endpoints; `60 req/min` on API/AI/weather/mail endpoints). |
| Email Header & Input Sanitization | `server.ts` | 484, 621, 846 | Employee mail fields did not strip `\r`/`\n`/`\0` sequences before formatting emails, and weather/chat inputs lacked server-side length truncation caps. | Low | Fixed | Added `stripEmailHeaderInjection()`, strict `sanitizePortalUrl()`, 100-char query limit on `/api/weather`, and 2000-char per-message text limit on `/api/chat*`. |
| Browser Credential Hashing | `src/utils/appAuth.ts` | 29 | Local credential backup records used single-pass SHA-256 instead of key-stretching. | Low | Fixed | Upgraded client-side salted hashing to WebCrypto `PBKDF2` (`SHA-256`, `100,000` iterations) with `pbkdf2_v1$` prefix and constant-time equality verification. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| API Keys & Secrets | `server.ts`, `src/firebase.ts` | `GEMINI_API_KEY` and SMTP credentials stay strictly server-side (`process.env`) and are never exposed to the browser bundle. |
| Role-Based Access Control | `firestore.rules`, `src/utils/roles.ts` | Collection rules isolate PII (`users/{userId}`) to document owners and verified administrators, while routes enforce strict role checks (`isAdmin`, `support_staff`, `warehouse_owner`, `psychiatrist`, `farmer`). |
| Session & Token Hygiene | `src/context/AuthContext.tsx` | Server HMAC session tokens are kept strictly in React memory (`useRef`) rather than `localStorage` or `sessionStorage` and cleared immediately on logout. |
| Password Storage | `server.ts` | Server accounts use per-user 16-byte random salts with `crypto.scryptSync(..., 64)` and constant-time `crypto.timingSafeEqual` verification. |
| Input Volume Bounds | `firebase-blueprint.json`, `firestore.rules` | Firestore security rules mirror schema `maxLength`, numeric bounds, array size limits, field whitelists (`hasOnly`), and `request.time` timestamp integrity. |

## PoC Verification

### Unauthenticated Support Employee Role Escalation
#### Summary
| Field | Value |
|---|---|
| Issue Type | Missing Authorization Check on Role Assignment |
| Impact | High |
| Affected File | `server.ts:316` |
| Test Scenario | `POST /api/auth/register` with `{ "name": "Attacker", "email": "attacker@example.com", "password": "Password123!", "role": "support_staff" }` and no admin `Authorization` header. |

#### How It Was Fixed
Added an explicit `verifyAdminBearerToken(req.headers.authorization)` check whenever the requested registration role is `"support_staff"`. Self-registration without verified administrator authorization is restricted to public roles (`farmer`, `warehouse_owner`, `psychiatrist`).

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Request arrives at `POST /api/auth/register` in `server.ts:294` after passing IP rate limit check `limitAuth`. | Input enters handler |
| 2 | Handler extracts `rawRole === "support_staff"` and invokes `verifyAdminBearerToken(req.headers.authorization)` at `server.ts:316-318`. | Authorization header missing/unverified (`ok: false`) |
| 3 | Response returns HTTP `403` JSON error before creating any account record (`server.ts:320-325`). | **Handled Safely** |

#### Conclusion
**Fix Verified** - Public callers cannot register privileged `"support_staff"` accounts through the registration endpoint.

---

### Unauthenticated Password Overwrite on Change-Password Endpoint
#### Summary
| Field | Value |
|---|---|---|
| Issue Type | Missing Authentication on Account Password Update |
| Impact | High |
| Affected File | `server.ts:435` |
| Test Scenario | `POST /api/auth/change-password` with `{ "email": "farmer@example.com", "newPassword": "HijackedPassword99" }` and neither a valid `Authorization: Bearer <token>` header nor matching `currentPassword`. |

#### How It Was Fixed
Required either a signed HMAC-SHA256 `sessionToken` (`verifyServerSessionToken`) whose `email` claim matches the target account, or verification of the account's existing `currentPassword` using scrypt and `crypto.timingSafeEqual`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Request arrives at `POST /api/auth/change-password` in `server.ts:435` under `limitAuth`. | Input enters handler |
| 2 | `verifyServerSessionToken` evaluates empty/forged Bearer header (`hasMatchingToken = false`) and checks `currentPassword` presence at `server.ts:456-475`. | Both checks fail (`!hasMatchingToken && !currentPassword`) |
| 3 | Endpoint immediately responds with HTTP `401` without querying or mutating `serverAccountsCache`. | **Handled Safely** |

#### Conclusion
**Fix Verified** - Attackers cannot overwrite another user's password or enumerate accounts via unauthenticated password change requests.

---

### Unsafe URI Scheme Injection via Partner Portal Links
#### Summary
| Field | Value |
|---|---|---|
| Issue Type | Unsafe Protocol Rendering in Anchor Links |
| Impact | Medium |
| Affected File | `src/utils/safeUrl.ts:5`, `src/pages/LoansPage.tsx:274`, `src/pages/InsurancePage.tsx:244`, `firestore.rules:144` |
| Test Scenario | Submitting `"javascript:alert(document.domain)"` as a partner company `websiteUrl`. |

#### How It Was Fixed
Created `getSafeExternalUrl` (`src/utils/safeUrl.ts`) which parses URLs with the native `URL` constructor and allows only `http:` and `https:` protocols, rejecting `javascript:`, `data:`, and `vbscript:`. Added input rejection in `AdminPage.tsx` and `AuthContext.tsx`, safe link guarding across rendering pages, and regex matching (`^https?://.*`) in `firestore.rules`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Unsafe string `"javascript:alert(document.domain)"` is passed to `AdminPage.tsx`, `AuthContext.addPartnerCompany`, `firestore.rules`, or link renderer `LoansPage.tsx`. | Evaluated across UI, state, DB rule, and DOM |
| 2 | `getSafeExternalUrl` checks `parsed.protocol` (`safeUrl.ts:12`), `AdminPage` blocks submission, `firestore.rules:144` rejects non-matching writes, and renderers omit the `<a>` tag when `getSafeExternalUrl` returns `null`. | Protocol rejected |
| 3 | Anchor element with executable URI scheme is never submitted, stored, or rendered. | **Handled Safely** |

#### Conclusion
**Fix Verified** - Multi-layer validation prevents unsafe URI schemes from being stored in Firestore or rendered into the DOM.
