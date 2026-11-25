# BhoomiBandhu — Google Stitch Screen Prompts

How to use this file:
1. Copy the **CORE CONTEXT** block once.
2. For every screen, paste CORE CONTEXT first, then paste that screen's prompt right after it, into the same Stitch prompt box.
3. Generate Tier 1 fully, review spacing/colors/fonts, lock them in, then move to Tier 2, then Tier 3.

---

## CORE CONTEXT — paste this before every single screen prompt

```
App: BhoomiBandhu, a mobile-first agricultural platform for Indian farmers. Primary user has basic smartphone literacy, not a tech-savvy urban user. Tone: reassuring, trustworthy, simple — "a trusted friend," not a flashy startup app.

Design system (apply exactly, every screen):
- Primary color: earthy green #2D6A4F
- Accent color: warm amber #E9A23B (used only for primary CTA buttons)
- Background: warm cream #FAF8F3, never stark white
- Typography: one rounded, highly legible sans-serif (Poppins or Inter) throughout
- Corner radius: consistent 12-16px on cards, buttons, inputs
- Icons: outline style, always paired with a text label, never icon-only
- Bottom tab navigation on mobile with 4-5 items max, thumb-reachable
- Large tap targets, high contrast, minimal text per screen, no dense dashboards, no decorative effects
```

---

## TIER 1 — Core Shell (build and lock these first)

### 1. Splash / Onboarding
```
Screen: Splash and onboarding (2 screens max in one flow).
Screen 1: Full-bleed cream background, centered BhoomiBandhu logo mark (simple leaf/sprout icon in primary green), app name in large type, tagline "A Trusted Friend for Every Farmer" below in smaller amber text. Auto-advances or has a "Get Started" amber button.
Screen 2: One simple illustration (farmer with phone, friendly flat style, green/amber/cream palette only), one line of supporting text explaining the app connects farmers to schemes, insurance, storage and AI help in one place. Large amber "Continue" button. Small "Skip" text link top right.
```

### 2. Login
```
Screen: Login.
Header: small logo + "Welcome back" heading.
Fields: Phone number or email input (large, rounded, labeled clearly), Password input with show/hide toggle.
Primary amber button: "Log In", full width, large tap target.
Below it: "Forgot password?" as plain text link.
Divider "or", then "Create new account" as secondary outline button in green.
Keep the whole screen uncluttered — no social login icons, no extra decoration.
```

### 3. Register (role selector)
```
Screen: Registration.
Step 1 shown: Two large, equally-sized selectable cards side by side (or stacked on narrow screens): "I'm a Farmer" (sprout icon) and "I'm a Warehouse Owner" (warehouse icon), each with one line describing what that role can do. Selected card gets a green border highlight.
Below: Name, Phone/Email, Password, Confirm Password fields, large and clearly labeled.
Primary amber "Create Account" button.
"Already have an account? Log in" link below.
```

### 4. Farmer Dashboard (home)
```
Screen: Farmer dashboard home.
Top: greeting "Namaste, [Farmer Name]" with small profile avatar icon top-right and a notification bell icon.
Below greeting: a single highlighted info card (e.g. weather or a recommended scheme) in soft green background.
Main body: a grid of 6-8 large, equally-sized service cards (Schemes, Insurance, Warehouse/Storage, Loans, Crop Advisor, AI Chat, Well-Being, Help) — each card has one outline icon, one short label, rounded corners, generous padding, no extra text.
Below the grid: a simple "Recent Activity" section showing 2-3 list items (e.g. "Scheme saved: PM-KISAN", "Booking confirmed: Storage unit") in plain rows, not a dense table.
Bottom tab bar: Home, Services, AI Chat, Profile (4 items, icon + label each).
```

### 5. Bottom nav + drawer shell
```
Screen: Navigation shell reference (show as one annotated screen).
Bottom tab bar fixed to screen bottom: 4 items — Home (house icon), Services (grid icon), AI Chat (chat bubble icon), Profile (person icon) — each with icon above short label, active tab shown in primary green, inactive tabs in muted grey.
Side drawer (triggered from a hamburger icon on non-home screens): full list of all 12 modules as rows with icon + label, user's name and role shown at top of drawer, "Log Out" as the last row in red-tinted text separated by a divider.
```

---

## TIER 2 — Government Schemes (first real module)

### 6. Schemes list
```
Screen: Government schemes list.
Top: screen title "Government Schemes", search bar below it (rounded, with search icon, placeholder "Search schemes...").
Below search: horizontal scrollable filter chips (e.g. "All", "Crop Insurance", "Subsidy", "Loan Support", "Equipment") — selected chip filled green, others outlined.
Main list: vertical list of scheme cards, each showing scheme name (bold), one-line description, a small category tag, and a right-pointing chevron. Cards have generous spacing, rounded corners, subtle shadow.
Bottom tab bar visible.
```

### 7. Scheme detail
```
Screen: Scheme detail page.
Top: back arrow + scheme name as header.
Hero section: scheme name large, category tag, short summary line.
Sections below, each as a clearly labeled card with icon: "Eligibility" (bullet list), "Benefits" (bullet list), "Required Documents" (bullet list), "How to Apply" (numbered steps).
Bottom: fixed amber button "Visit Official Application Page" (external link icon), and a secondary outline button "Save for Later".
```

### 8. Eligibility checker
```
Screen: Eligibility checker form.
Title: "Check if you're eligible".
Simple one-question-per-section form (not a long single form): large radio buttons or dropdowns for things like land size, crop type, state, category (small farmer/large farmer) — one input group visible at a time with a progress indicator (e.g. "Step 2 of 4") at top.
Large amber "Next" button, "Back" as plain text link.
Final screen in this flow: result card showing "You may be eligible for 3 schemes" with a green checkmark icon and a list of matched scheme names linking to their detail pages.
```

---

## TIER 3 — One Screen Each (placeholder/future modules)

### 9. Warehouse list/map
```
Screen: Warehouse discovery.
Top: "Find Storage Near You" title, search bar with location icon, toggle between "List" and "Map" view (simple segmented control).
List view: cards showing warehouse name, distance, available capacity, price per unit, small rating stars, rounded card style.
Map view: stylized map background (simple, not real map data) with pin markers in primary green, a bottom sheet peeking up showing the nearest warehouse card.
```

### 10. Warehouse detail
```
Screen: Warehouse detail page.
Top: image placeholder banner (rounded corners), back arrow overlaid.
Below: warehouse name, address, rating, distance.
Info cards: "Available Capacity", "Pricing", "Facilities" (icons row: cold storage, security, loading dock, etc.).
Bottom fixed amber button: "Request Booking".
```

### 11. Booking form
```
Screen: Storage booking request form.
Title: "Book Storage Space".
Fields: crop type (dropdown), quantity (number input with unit toggle kg/quintal/ton), start date, duration (dropdown), notes (optional text area).
Summary card at bottom showing estimated cost.
Large amber "Submit Request" button.
```

### 12. Insurance hub
```
Screen: Crop insurance information hub.
Top: "Crop Insurance" title with a friendly shield icon.
Intro card: one-paragraph plain-language explanation of what crop insurance does.
Below: list of insurance schemes (starting with PMFBY) as cards similar in style to the schemes list — name, one-line description, chevron.
Bottom: outline button "Not sure which to choose? Ask AI Chat" linking to AI chat module.
```

### 13. PMFBY detail
```
Screen: PMFBY (Pradhan Mantri Fasal Bima Yojana) detail page.
Same structural pattern as scheme detail: header, summary, "Eligibility", "Premium & Coverage", "Required Documents", "How to Apply" as labeled cards.
Bottom fixed amber button: "Visit Official PMFBY Portal".
```

### 14. Loans list
```
Screen: Agricultural loans list.
Title: "Financial Assistance & Loans".
List of loan option cards: lender/scheme name, loan type tag (e.g. "Crop Loan", "Equipment Loan"), short description, chevron. Same card style as schemes list for visual consistency.
```

### 15. Loan detail
```
Screen: Loan detail page.
Header with loan name. Cards for "Eligibility", "Interest & Repayment" (plain language, no complex tables), "Required Documents", "How to Apply".
Bottom amber button: "Check Eligibility" or "Visit Official Page".
```

### 16. Crop Advisor input
```
Screen: ML Crop Advisor input form.
Title: "Get a Crop Recommendation" with a small plant/lab icon.
Form fields, clearly labeled with simple language: Soil type (dropdown), Nitrogen/Phosphorus/Potassium levels (sliders or number inputs with helper text), Temperature, Humidity, Rainfall, pH level — grouped into 2-3 short sections with progress indicator.
Large amber "Get Recommendation" button at bottom.
```

### 17. Crop Advisor result
```
Screen: Crop recommendation result.
Large result card centered: recommended crop name with a simple icon, a clear disclaimer line underneath in smaller muted text: "This is a suggestion based on your inputs, not a guarantee."
Below: 2-3 secondary crop suggestions as smaller cards.
Bottom: outline button "Try Again" and amber button "Ask AI Chat About This Crop".
```

### 18. AI Chat interface
```
Screen: AI Farmer Chat.
Top bar: "Ask BhoomiBandhu" title with a small friendly bot/leaf icon avatar.
Chat area: message bubbles — user messages right-aligned in amber-tinted bubble, AI responses left-aligned in white/cream bubble with the bot icon, rounded corners throughout.
Bottom: fixed text input bar with placeholder "Ask about crops, schemes, weather..." and a send icon button in primary green. Include a small suggestion chip row above the input (e.g. "What crops suit my soil?", "Explain PM-KISAN").
```

### 19. Well-being resource hub
```
Screen: Farmer well-being resources.
Tone must be calm and non-clinical: softer, more muted use of the palette, extra whitespace, no urgent or alarming colors.
Title: "You're Not Alone" or similar gentle heading.
Simple list of resource cards: educational articles, a visible helpline number in a clearly readable card, breathing/stress-relief content — text-first, minimal icons, no dashboard feel at all.
If a "Talk to someone" option is shown, keep it as a simple, calm card linking to a request form — nothing resembling a clinical intake form.
```

### 20. Profile view/edit
```
Screen: Farmer profile.
Top: large circular avatar, name, role badge, "Edit" icon button.
Below: grouped info sections as cards — Personal Info (name, phone, email, location), Farm Info (land size, crops grown), Account Settings (change password, notification preferences), Activity (booking history, saved schemes) — each section a simple list row style with chevrons.
```

### 21. Notifications
```
Screen: Notifications list.
Title: "Notifications".
Vertical list of notification cards, each with a small category icon (scheme/warehouse/system), bold short title, one-line description, timestamp in muted grey. Unread items have a subtle green dot indicator.
```

### 22. Help / FAQ + contact
```
Screen: Help & Support.
Title: "Help Centre".
Search bar for FAQs at top.
Expandable accordion list of common questions (question bold, tap to expand answer).
Bottom section: "Still need help?" card with a simple contact support button (amber) opening a short form (subject dropdown, message text area, submit button).
```

---

## Build order reminder

1. Generate all of Tier 1 first. Review colors, fonts, spacing across all 5 screens together.
2. Lock in any adjustments before touching Tier 2 — fixing drift after 22 screens is far more painful than after 5.
3. Move to Tier 2, then Tier 3.
4. If Stitch supports referencing a previous screen's export when generating the next, use that instead of relying on text repetition alone — it holds consistency better than the prompt text can.
