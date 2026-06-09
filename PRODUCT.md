# FAQ Portal — Product Overview

## Vision

A single source of truth for internship information — eliminating repetitive questions, speeding up access to answers, and reducing manual effort for program coordinators through AI-assisted curation.

---

## Target Users

### Interns (Students)
- **Primary action:** Search for answers to internship process questions (NOC, dates, offer letters, coursework).
- **Pain point:** Scattered information across emails, WhatsApp groups, and docs. No single authoritative source.
- **Success metric:** Finds answer within 30 seconds without escalating to Yaksha chat.

### Program Coordinators (Admins)
- **Primary action:** Curate and moderate community-generated content, review reports, promote high-quality answers to FAQ.
- **Pain point:** Answering the same questions repeatedly in chat. Difficulty surfacing good community answers.
- **Success metric:** Reduction in repetitive question volume by 60%.

### Community Contributors
- **Primary action:** Ask questions, submit answers, earn points through gamification.
- **Pain point:** No incentive to contribute high-quality answers.
- **Success metric:** Active participation rate and answer acceptance rate.

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

---

## Competitive Landscape

| Alternative | Weakness | Our Advantage |
|-------------|----------|---------------|
| WhatsApp groups | Information buried in chat history, no search | Structured, searchable, persistent |
| Email chains | Unstructured, one-to-one, not discoverable | Public, organized by category, fuzzy search |
| Google Docs | Static, no community input | Dynamic, AI-curated, community-driven |
| Dedicated helpdesk (Zendesk) | Expensive, overkill for this scale | Lightweight, purpose-built, free |

---

## Future Opportunities

### Phase 2

- **Session-based guest dedup** — Use a cookie or session token to prevent anonymous view inflation across page refreshes.
- **Related questions sidebar** — Show AI-suggested related FAQs when reading an answer.
- **Upvote FAQ answers** — Let users vote on FAQ quality, surfacing the most helpful entries.
- **Personalized dashboard** — Show recommended FAQs based on the user's current internship stage.

### Phase 3

- **Multi-language support** — Translate FAQs for non-English-speaking interns.
- **Mobile app** — Push notifications for answers, promotions, and deadlines.
- **Analytics dashboard for admins** — Search trends, top unanswered topics, view heatmaps.

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI hallucination in duplicate check | Wrong rejection or promotion | Human-in-the-loop: duplicates return 409 (user sees both), promotions require admin approval |
| Guest view inflation | Misleading trending data | Acceptable for current scale — cookie tracking can be added in Phase 2 |
| Low community participation | Sparse OAQ section | Gamification (points, leaderboard), auto-promote incentive |
| Admin bottleneck | Slow moderation | Auto-promote reduces manual work; clear status workflow (Open → Approved → Promoted) |
