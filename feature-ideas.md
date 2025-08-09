## Feature Ideas and Roadmap (Quick Dump)

Context: Current app supports 1:1 connections, shared expenses, USD as canonical currency with stored exchange rates, Clerk auth, and Convex backend.

### High‑impact next steps (optimize current 1:1 model)

- **Settle up flows**: One‑click “Mark settled” that inserts a balancing settlement expense; optional Venmo/PayPal deep links. Effort: Low–Med
- **Flexible splits**: Exact amounts, percentages, or shares per person (vs equal only). Effort: Med
- **Multi‑currency clarity**: Show original vs USD, rate/date used, manual override, lock to transaction date, re‑price option. Effort: Low
- **Receipt attachments**: Upload images/PDFs and preview. Effort: Med
- **Audit trail**: Per‑expense change history (who/what/when). Effort: Med
- **CSV export**: Per‑connection or global export with filters/date range. Effort: Low

### Collaboration & invitations

- **Invitation UX**: Pending invites list, revoke/expire, QR + share links, nicer accept flow with inviter preview. Effort: Low–Med
- **Connection notes/nicknames**: Optional metadata per connection. Effort: Low

### Insights and control

- **Dashboards**: Monthly totals, category breakdowns, trends; connection & global. Effort: Med
- **Budgets/alerts**: Per‑category monthly budgets with threshold notifications. Effort: Med
- **Recurring expenses**: Weekly/monthly items with auto‑insert via cron, skip/pause. Effort: Med
- **Search & filters**: Date range, category, payer, tags. Effort: Low–Med

### Notifications

- **Balance reminders**: Periodic “you owe/are owed” nudges. Effort: Med
- **Activity alerts**: New expense, invite accepted. Effort: Med

### Settings & customization

- **Defaults**: Currency, split preference, default payer, rounding rules. Effort: Low
- **Custom categories & tags**: User‑defined categories, merge/rename, free‑form tags. Effort: Med

### Growth & monetization (tiering ideas)

- **Free**: Core logging, equal splits, basic dashboard.
- **Pro**: Flexible splits, receipts, CSV export, notifications, recurring, custom categories, multiple connections unlimited.

### Bigger bets (roadmap)

- **Groups (3+ people)**: Group connections, N‑way splits, optimal settle‑up suggestions. Effort: High
- **Receipt OCR**: Auto‑extract amount/date/category/currency. Effort: High
- **PWA/mobile**: Quick‑add from home screen, offline drafts with later sync. Effort: High
- **Imports**: CSV import from other apps/cards. Effort: Med–High

### Why these first

- Leverages existing schema (`expenses`, `user_expenses`, `exchange_rates`) with minimal changes.
- Improves trust and clarity (audit trail, rate transparency).
- Reduces friction (settle up, receipts) and drives retention (notifications, recurring).
- Creates clear Pro differentiators without heavy architectural shifts.

### Near‑term candidates & quick notes

- **Settle up**: Implement as a special expense type/category; insert USD balancing amount; optional external payment link.
- **Flexible splits**: Allow per‑participant shares; compute `user_expenses` from explicit shares; UI toggle between equal/percentage/amount.
- **CSV export**: Server query by date range/category/connection; generate CSV and download; include both USD and original currency columns when present.
