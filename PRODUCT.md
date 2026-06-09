# FAQ Portal — Product Document

> **Version:** 1.0  
> **Status:** In Development  
> **Target Audience:** Interns, Program Coordinators, Community Contributors, Developers

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Vision](#vision)
- [Stakeholders](#stakeholders)
- [Target Users & Personas](#target-users--personas)
- [Scope](#scope)
- [MVP Boundaries](#mvp-boundaries)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Core Workflows](#core-workflows)
- [User Stories](#user-stories)
- [Key Metrics](#key-metrics)
- [Competitive Landscape](#competitive-landscape)
- [Constraints](#constraints)
- [Glossary](#glossary)
- [Risk & Mitigation](#risk--mitigation)
- [Future Opportunities](#future-opportunities)

---

## Problem Statement

**Context:** The Vicharanashala internship program runs twice a year with 200–500 interns per cohort. Interns have the same recurring questions about NOC submission, offer letters, dates, coursework, and policies. These questions are currently answered ad-hoc through Yaksha chat, WhatsApp groups, and individual emails.

**Problem:** 
- Coordinators spend 40–60% of their day answering the same questions repeatedly.
- Interns cannot find answers after hours or on weekends when no coordinator is online.
- Good community answers are lost in chat history — there is no mechanism to surface and preserve them.
- There is no centralized, searchable, authoritative source of truth for program information.

**Solution:** A full-stack FAQ and community Q&A platform with AI-powered duplicate detection, auto-promotion of quality content, and gamification to incentivize community contribution.

**Success looks like:** 80% of intern questions are answered via self-service search. Coordinator chat volume drops by 60%. High-quality community answers are automatically promoted to the official FAQ with zero manual effort.

---

## Vision

A single source of truth for internship information — eliminating repetitive questions, speeding up access to answers, and reducing manual effort for program coordinators through AI-assisted curation.

---

## Stakeholders

| Stakeholder | Interest | Success Criteria |
|-------------|----------|-----------------|
| Interns | Fast, accurate answers 24/7 without waiting for chat | Finds answer in <30s |
| Program Coordinators | Reduced repetitive question volume | 60% reduction in repeated questions |
| Program Director | Scalable program operations, consistent answers | Program can scale 2x without adding coordinator headcount |
| Community Contributors | Recognition and reward for quality contributions | Visible leaderboard rank, points → real incentives |
| Developers | Clear requirements, maintainable code | All functional requirements testable and documented |

---

## Target Users & Personas

### Interns (Students) — Primary
- **Role:** College student (UG/PG) enrolled in the internship.
- **Primary action:** Search for answers to internship process questions (NOC, dates, offer letters, coursework).
- **Pain point:** Scattered information across emails, WhatsApp groups, and docs. No single authoritative source.
- **Success metric:** Finds answer within 30 seconds without escalating to Yaksha chat.
- **Frequency of use:** Multiple times per week during NOC + onboarding phase, tapering to weekly.

### Program Coordinators (Admins) — Primary
- **Role:** Staff managing the internship program.
- **Primary action:** Curate and moderate community-generated content, review reports, promote high-quality answers to FAQ.
- **Pain point:** Answering the same questions repeatedly in chat. Difficulty surfacing good community answers.
- **Success metric:** Reduction in repetitive question volume by 60%.
- **Frequency of use:** Daily, multiple times per day during peak intake periods.

### Community Contributors — Secondary
- **Role:** Interns who actively answer peer questions.
- **Primary action:** Ask questions, submit answers, earn points through gamification.
- **Pain point:** No incentive to contribute high-quality answers. Efforts are invisible.
- **Success metric:** Active participation rate and answer acceptance rate.
- **Frequency of use:** Weekly or more, driven by notification and leaderboard visibility.

### Alumni — Occasional
- **Role:** Past interns who return to answer questions.
- **Primary action:** Browse and answer community questions.
- **Pain point:** No easy way to find questions they can help with.
- **Success metric:** Returning contributor rate.

---

## Scope

### In Scope

| Area | Description |
|------|-------------|
| FAQ browsing | Category-based FAQ with accordion expand/collapse, sorted by priority and view count |
| Fuzzy search | Client-side Fuse.js search across questions, answers, and categories with typo tolerance |
| Full-text search | Server-side MongoDB `$text` search across FAQs and OAQs, cached for performance |
| Autocomplete suggestions | Real-time suggestion dropdown with keyboard navigation as user types |
| Voice search | Web Speech API microphone button for hands-free query input |
| Community Q&A submission | Question submission with AI duplicate check against 120+ existing entries |
| Voting | Upvote/downvote on questions and answers with net-score calculation |
| Answer submission | Users can answer open questions (cannot answer own question) |
| View tracking | Per-user deduplicated view counting (logged-in) and session-based (guest) |
| Status workflow | Open → Approved / Rejected (admin) → Promoted to FAQ |
| AI duplicate detection | Groq LLaMA check on submit to prevent redundant questions |
| AI importance scoring | Auto-score 0–100 for each submitted question |
| AI auto-promote | Auto-promote answered open questions when similar new question is submitted |
| Vote-based auto-promote | Auto-promote at net ≥10 upvotes |
| Admin moderation | Approve, reject, promote questions; edit, accept answers |
| Admin AI tools | Summarize answers, check question relevance, verify by admin |
| Report system | User-submitted reports with admin resolve/dismiss/delete workflow |
| Notifications | Bell icon with unread count for answers, promotions, approvals |
| Gamification | Points for asking, answering, upvotes, acceptance, promotion |
| Leaderboard | Top contributors sorted by points with pagination |
| Authentication | JWT-based login/register with httpOnly cookies |
| Role-based access | Student vs Admin with protected routes |
| Dark/Light theme | Persistent toggle with CSS custom properties |
| Responsive design | Mobile-first layout with hamburger menu, works on phones/tablets/desktop |

### Out of Scope

| Area | Rationale |
|------|-----------|
| Real-time chat / live messaging | Yaksha chat already exists and serves this purpose. Integration would add scope without clear benefit. |
| Mobile native app | Responsive web app covers all devices. A native app is a Phase 3 consideration. |
| WebSocket / push notifications | Current poll-on-mount approach is sufficient for this scale. Real-time push is over-engineering. |
| Multi-language / i18n | All current interns are English-proficient. Internationalization is a Phase 3 opportunity. |
| SSO / OAuth integration | Email-password auth is adequate for the current user base. Adding Google/GitHub OAuth is Phase 2. |
| Analytics dashboard for admins | Basic metrics are available through existing endpoints. A dedicated dashboard is Future Opportunity. |
| SEO / SSR | The app is behind login for most routes. Server-side rendering is not justified. |
| File uploads (images in answers) | All content is text-based. File uploads add complexity and moderation overhead. |

---

## MVP Boundaries

### MVP (v1) — Current Build

What is shipped and functional:

- [x] FAQ browse and fuzzy search
- [x] Community Q&A submit, view, vote, answer
- [x] AI duplicate detection on question submit
- [x] AI importance scoring on question submit
- [x] AI auto-promote (similar-question + vote-based)
- [x] Admin approve/reject/promote workflow
- [x] Admin AI summarization and relevance check
- [x] User reporting and admin moderation
- [x] Notifications (bell icon, unread count)
- [x] Gamification (points, leaderboard)
- [x] Authentication and role-based access
- [x] Dark/light theme
- [x] Responsive design

### Phase 2 — Next

Prioritized for the next development cycle:

- [ ] Session-based guest dedup (cookie/session token for anonymous view tracking)
- [ ] Related questions sidebar on FAQ and OAQ pages
- [ ] Upvote FAQ answers (community feedback on official content)
- [ ] Personalized dashboard (recommended FAQs based on internship stage)
- [ ] OAuth login (Google/GitHub)
- [ ] Email notifications for answer and promotion events
- [ ] Edit question (grace period, e.g., 15 min after submission)

### Phase 3 — Future

Long-term opportunities:

- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native or PWA with push)
- [ ] Admin analytics dashboard (search trends, top unanswered topics, view heatmaps)
- [ ] AI auto-answer for common questions (LLM-generated draft answers reviewed by admin)
- [ ] WebSocket live notifications

---

## Functional Requirements

### FR-01: FAQ Browsing
- **FR-01.1** System shall display FAQ categories in a fixed priority order (About → Selection → NOC → Timing → Interviews → Work → Certificate → Code of Conduct → Rosetta → Coursework & ViBe → ViBe Platform → Yaksha Chat → Team Formation).
- **FR-01.2** System shall sort questions within each category by view count descending.
- **FR-01.3** System shall allow only one open accordion item per category at a time.
- **FR-01.4** System shall cache the FAQ listing in-memory for 5 minutes.

### FR-02: Search
- **FR-02.1** System shall provide client-side fuzzy search using Fuse.js (threshold 0.45, weighted: question 0.7, answer 0.2, category 0.1).
- **FR-02.2** System shall provide server-side full-text search via MongoDB `$text` index, falling back to regex when `$text` fails.
- **FR-02.3** System shall provide autocomplete suggestions via `/api/search/suggest` with a minimum 2-character query.
- **FR-02.4** System shall support voice search via Web Speech API when available.
- **FR-02.5** System shall cache search results in-memory for 1 minute (max 500 entries, LRU eviction).

### FR-03: View Tracking
- **FR-03.1** System shall increment FAQ question view count via `POST /api/faqs/:catId/questions/:qId/view`.
- **FR-03.2** System shall deduplicate views for logged-in users using a `viewedBy` array (capped at 100 entries).
- **FR-03.3** System shall increment view for anonymous users without deduplication.
- **FR-03.4** Frontend shall prevent duplicate POST requests within the same component mount (`useRef` guard).
- **FR-03.5** Frontend shall display the server-returned view count (not optimistic local value).

### FR-04: Community Q&A (OAQ)
- **FR-04.1** System shall allow any logged-in user to submit a question with question text, optional description, and category.
- **FR-04.2** System shall run AI duplicate detection against up to 120 existing questions before accepting submission.
- **FR-04.3** If a duplicate is found, system shall return 409 with a link to the existing question. User shall not proceed.
- **FR-04.4** System shall assign an initial status of "Open" to every new question.
- **FR-04.5** System shall allow any logged-in user (except the question author) to submit an answer.
- **FR-04.6** System shall allow users to upvote or downvote questions and answers (`value: 1` or `-1`).
- **FR-04.7** System shall auto-promote a question to FAQ when net upvotes reach ≥10.

### FR-05: AI Features
- **FR-05.1** System shall check for semantic duplicates using Groq LLaMA when an OAQ is submitted.
- **FR-05.2** System shall assign an importance score (0–100) to each submitted OAQ using AI.
- **FR-05.3** System shall periodically batch-score any unscored OAQs on startup.
- **FR-05.4** When a new OAQ is submitted, system shall find similar "Open" questions with answers and auto-promote the best match.
- **FR-05.5** Admin shall be able to request AI summarization of all answers for a question.
- **FR-05.6** Admin shall be able to request AI relevance check on any question.

### FR-06: Admin Moderation
- **FR-06.1** Admin shall be able to approve a question (status → "Approved").
- **FR-06.2** Admin shall be able to reject a question (status → "Rejected").
- **FR-06.3** Admin shall be able to promote a question to FAQ (status → "Promoted"). Underlying FAQ record shall be created.
- **FR-06.4** Admin shall be able to edit any answer.
- **FR-06.5** Admin shall be able to toggle acceptance on any answer.
- **FR-06.6** Admin shall be able to view, resolve, dismiss, or delete reported content.

### FR-07: Notifications
- **FR-07.1** System shall create a notification when a user's question receives an answer.
- **FR-07.2** System shall create a notification when a user's Q&A is promoted to FAQ.
- **FR-07.3** System shall create a notification when a user's answer is accepted.
- **FR-07.4** System shall create a notification when a user's question is approved.
- **FR-07.5** System shall display an unread count badge on the notification bell.
- **FR-07.6** User shall be able to mark individual notifications as read.
- **FR-07.7** User shall be able to mark all notifications as read.

### FR-08: Gamification
- **FR-08.1** System shall award +5 points for asking a question.
- **FR-08.2** System shall award +10 points for answering a question.
- **FR-08.3** System shall award +3 points per upvote received.
- **FR-08.4** System shall deduct −2 points per downvote received.
- **FR-08.5** System shall award +25 points when an answer is accepted.
- **FR-08.6** System shall award +50 points when a Q&A is promoted to FAQ.
- **FR-08.7** System shall display a leaderboard sorted by total points, paginated at 10 per page.

### FR-09: Authentication & Authorization
- **FR-09.1** System shall allow registration with name, email, and password.
- **FR-09.2** System shall allow login with email and password.
- **FR-09.3** System shall issue JWT in an httpOnly cookie on successful authentication.
- **FR-09.4** System shall verify JWT on every protected route via middleware.
- **FR-09.5** System shall grant admin routes only to users with `role: "admin"`.
- **FR-09.6** System shall allow logout by clearing the JWT cookie.

### FR-10: Theming & UI
- **FR-10.1** System shall support light and dark themes via CSS custom properties.
- **FR-10.2** System shall persist the user's theme preference in localStorage.
- **FR-10.3** System shall sync the theme preference to the server for logged-in users.
- **FR-10.4** System shall be responsive at 768px, 640px, and 480px breakpoints.
- **FR-10.5** System shall show a hamburger navigation menu on viewports ≤768px.

---

## Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Page load time (initial) | <2s on 3G |
| NFR-02 | Search response time | <500ms (client-side), <1s (server-side cached) |
| NFR-03 | API response time (cached) | <200ms |
| NFR-04 | FAQ cache TTL | 5 minutes |
| NFR-05 | Search cache TTL | 1 minute |
| NFR-06 | Search cache max entries | 500 (LRU eviction) |
| NFR-07 | Concurrent users supported | 100 (current scale) |
| NFR-08 | Password security | bcrypt hashed, min 6 chars |
| NFR-09 | JWT expiry | 7 days (configurable) |
| NFR-10 | AI request timeout | 15 seconds (Groq API) |
| NFR-11 | Browser support | Last 2 versions of Chrome, Firefox, Safari, Edge |

---

## Core Workflows

### 1. Self-Service FAQ Search

**Flow:**
1. User lands on Home or FAQ page.
2. Types query (fuzzy search tolerant of typos).
3. Sees results from both official FAQ and community Q&A.
4. Opens an answer → view is counted (once per session).
5. If unsatisfied → navigates to Community tab to ask a new question.

**Success criteria:** ≥80% of searches end with the user finding their answer without escalating.

### 2. Community Q&A with AI Guardrails

**Flow:**
1. User drafts a question.
2. System runs AI duplicate check against 120+ existing questions.
3. If duplicate found → user is shown the existing question (409 response) instead of creating noise.
4. If unique → question is posted as "Open" status.
5. Other users and admins submit answers.
6. Admin approves high-quality questions → "Approved" status.
7. Admin promotes the best FAQ-worthy Q&A → "Promoted" status, content moves to FAQ.

**Success criteria:** Duplicate submission rate <5% of total submissions. >70% of promoted questions have at least one accepted answer.

### 3. AI Auto-Promote Pipeline

**Flow:**
1. New OAQ is submitted.
2. System finds similar "Open" questions that already have answers.
3. Groq AI confirms the semantic match.
4. If match found → the matched Q&A pair is auto-promoted to FAQ.
5. Original answerer receives +50 points and a notification.

**Success criteria:** ≥30% of FAQ additions come from auto-promote (reducing manual admin effort).

### 4. Moderation & Quality Control

**Flow:**
1. Users report inappropriate or off-topic content.
2. Admin reviews reports in the dashboard.
3. Admin can resolve, dismiss, or delete content.
4. Admin can run AI relevance check on any question.
5. Admin can run AI summarization on answers to identify the best one.

**Success criteria:** Reported content is actioned within 24 hours. False report rate <10%.

---

## User Stories

### Intern
> "I just got selected and I need to know what dates to put on my NOC. I don't want to wait for a chat response — I want to find it myself right now."

**Acceptance:** Types "NOC dates" → sees the FAQ card → opens it → views count increments → done.

### Returning Intern
> "I already did MERN Stack last year. The AI course is new. Do I have to do both?"

**Acceptance:** Types "MERN exempt" or "returning intern" → sees the FAQ entry about partial exemption.

### Community Contributor
> "I answered someone's question about NOC signing authority. If my answer is good enough, it should become an official FAQ."

**Acceptance:** Admin promotes the Q&A → contributor gets notification + points → content moves to main FAQ.

### Admin
> "I keep seeing the same question about NOC email forwarding. I wish I could just promote a good answer instead of writing it myself each time."

**Acceptance:** Finds the OAQ, approves it, promotes it to FAQ. The content is now a permanent FAQ entry.

### New Intern (Guest)
> "I'm not logged in yet. Can I still browse FAQs to see if this internship is for me?"

**Acceptance:** Opens the FAQ page → sees all categories → searches and reads answers. View counted on open but not attached to any user identity.

---

## Key Metrics

| Metric | Target | Why it matters |
|--------|--------|----------------|
| FAQ search success rate | ≥80% | Users find answers without escalating |
| Avg time to find answer | <30s | Core UX promise |
| Duplicate question rate | <5% | AI guardrails working |
| Auto-promote contribution | ≥30% of new FAQs | Reduces manual admin work |
| Community contribution rate | ≥15% of active users | Gamification driving engagement |
| Guest view accuracy | Within 10% of real usage | No inflation from page refreshes |
| Admin action time on reports | <24h | Content quality guarantee |
| Notification-to-action rate | ≥40% | Users acting on notifications |

---

## Competitive Landscape

| Alternative | Weakness | Our Advantage |
|-------------|----------|---------------|
| WhatsApp groups | Information buried in chat history, no search | Structured, searchable, persistent |
| Email chains | Unstructured, one-to-one, not discoverable | Public, organized by category, fuzzy search |
| Google Docs | Static, no community input | Dynamic, AI-curated, community-driven |
| Dedicated helpdesk (Zendesk) | Expensive, overkill for this scale | Lightweight, purpose-built, free |
| Wiki / Notion | Requires manual curation, no AI | AI-automated duplicate detection and promotion |

---

## Constraints

| Constraint | Impact |
|------------|--------|
| MongoDB Atlas free tier (512 MB storage) | Limits total FAQ + OAQ document size. `viewedBy` arrays capped at 100 entries. |
| Groq API free tier rate limits | AI features may be delayed or disabled during high traffic without a paid tier. |
| Single developer | Development velocity limited. Prioritization is critical. |
| No dedicated QA | All testing through development and user feedback. |
| Deployment on free-tier hosting | Limited CPU/memory affects cache sizes and concurrent request handling. |
| No SLA | Best-effort availability. No uptime guarantee. |

---

## Glossary

| Term | Definition |
|------|------------|
| **FAQ** | Frequently Asked Questions — the curated, official set of questions and answers maintained by admins. |
| **OAQ** | Our Asked Questions — community-submitted Q&A entries that go through a moderation workflow. |
| **NOC** | No Objection Certificate — a document from the intern's college authorizing their participation. |
| **ViBe** | The learning management system (LMS) where interns complete coursework. |
| **Yaksha** | The in-app chat assistant for escalation and support requests. |
| **VINS** | Virtual Internship — the remote track. |
| **VISE** | Virtual Internship with Stipend and Experience — the on-campus track. |
| **Groq** | The AI provider (LLaMA model) used for duplicate detection, scoring, summarization, and relevance checks. |
| **Fuse.js** | Client-side fuzzy search library used for typo-tolerant instant search. |
| **Auto-promote** | Automatic promotion of a community Q&A to the official FAQ, triggered by AI similarity match or vote threshold. |
| **Importance Score** | An AI-assigned 0–100 score reflecting the quality and usefulness of a question. |
| **viewedBy** | An array of user ObjectIds stored on FAQ questions and OAQs to prevent duplicate view counting. |

---

## Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| AI hallucination in duplicate check | Wrong rejection or promotion | Medium | Human-in-the-loop: duplicates return 409 (user sees both), promotions require admin approval |
| Guest view inflation | Misleading trending data | High | Acceptable for current scale — cookie tracking can be added in Phase 2 |
| Low community participation | Sparse OAQ section | Medium | Gamification (points, leaderboard), auto-promote incentive |
| Admin bottleneck | Slow moderation | Medium | Auto-promote reduces manual work; clear status workflow |
| MongoDB Atlas storage limit | Cannot store all OAQ data | Low | Archival strategy for old/closed OAQs; capped arrays |
| Groq API downtime | AI features unavailable | Low | Graceful fallback — duplicate check skipped, scoring deferred to next batch |
| Single developer bus factor | Development stops | Low | Well-documented code and README; modular architecture |
