# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Self-improvement readers: people who've read (or want to read) books like
*Atomic Habits* or *Feel-Good Productivity* but stall at turning the ideas
into anything real. They open Kara to do one short, concrete thing today —
not to read more theory, not to manage a project.

## Product Purpose

Kara converts book/media content into a single daily practice, so ideas
that are usually consumed and forgotten actually get applied. Each journey
(sourced from a specific book) is broken into short daily practices of four
kinds: ACT (a concrete action), SIT (a reflection prompt), NOTICE (an
awareness exercise), and KEEP (a cue → behavior habit with a target run of
days). Alongside journeys, a quote library lets users memorize quotes via
spaced repetition (Leitner boxes). Success is a user who keeps coming back
and can point to specific ideas they actually did something with — not just
completion counts.

## Positioning

Two things a generic habit tracker or flashcard app couldn't truthfully
copy:

1. **Book-to-practice fidelity** — practices carry real attribution
   (sourceType/sourceTitle/sourceAuthor) back to the book or quote they came
   from; theme journeys are schema-required to cite their source. This
   isn't generic self-help copy, it's traceable to specific material.
2. **One thing at a time** — the app's own tagline. Deliberately
   single-tasked: one practice, one quote review, no dashboard of parallel
   goals competing for attention.

Motivation mechanics (see Product Principles) are being added on top of
this, not instead of it — the single daily practice stays the unit of the
product even as streaks/momentum are layered in.

## Operating Context

- Short daily sessions (5–20 minutes per practice, per `content/schema.ts`
  minute fields).
- Bilingual: English and Farsi, with Farsi rendered RTL. This is a first-class
  operating condition, not a locale afterthought — every surface must work
  in both directions (see Hard rules in CLAUDE.md).
- Content is authored and versioned as JSON in `content/` (journeys, quote
  collections) and loaded via an idempotent seed script — not user-generated
  at this stage.
- A native mobile client (Expo/React Native, reusing `@kara/domain`) was
  built through a POC and an Android EAS build, then removed from the repo
  in the most recent commit. Mobile is shelved, not abandoned by design —
  the domain logic package (`packages/domain`) still exists specifically so
  a native client can be reattached later without rework.

## Capabilities and Constraints

- Practice types are a closed, schema-enforced set: ACT, SIT, NOTICE, KEEP —
  each with its own required fields (e.g., KEEP has cue/behavior/polarity/
  targetDays; SIT has suggestedMinutes/revisitAfterDays). New practice
  concepts need a schema change in `content/schema.ts`, not just content.
  Undecided: what feature. Undecided: what a KEEP practice's target-days
  outcome does — mentioned in schema but the KEEP feature has not been
  observed in the app or Product Principles yet.
- Quotes use a 5-box Leitner spaced-repetition system with fixed
  re-review intervals (1/3/7/16/35 days) and a card counts "ready" after
  2 clean passes at box 5 (`READY_CLEARED_COUNT`).
- Auth: NextAuth-based; a login flow exists (with a verify step), and a
  now-removed mobile bridge reused the same web login via an in-app
  browser.
- No red/destructive color token exists in the design system (Tailwind
  `@theme`, see CLAUDE.md Hard rules) — this is a fixed technical/design
  constraint, independent of the philosophy question below.

## Brand Commitments

- Product name: Kara. No confirmed meaning/story behind the name has been
  established with the user; treat it as a proper noun only until told
  otherwise.
- Tagline: "One thing at a time" (see `messages/en.json` Navigation.tagline).

## Evidence on Hand

Real, already-authored content exists and should be treated as evidence,
not placeholder copy:
- Journeys: `content/journeys/atomic-habits.en.json`,
  `feel-good-productivity.en.json`, `feeling-management.en.json`,
  `from-page-to-practice.en.json`, `sleep-and-light.en.json`.
- Quote collections: `content/quote-collections/atomic-habits.en.json`,
  `on-courage.en.json`.
- All content is English-only so far; no Farsi content files exist yet
  despite Farsi being a supported/required locale for the UI shell.

## Product Principles

1. **One practice at a time.** The daily unit of the product is a single
   practice or a single quote review — never a dashboard of competing
   goals, even as motivation features are added.
2. **Traceable to source.** Practices and quotes carry real attribution;
   journeys are not generic advice, they are specific books turned into
   action.
3. **Gamify without shame.** The product is moving toward real motivation
   mechanics — streaks, milestones, momentum, celebratory feedback — to
   keep people coming back. This explicitly reverses an earlier
   "no shame mechanics, no gamification" stance. The reversal is scoped:
   CLAUDE.md's hard rule against a red/destructive color token stays in
   force, so streak/motivation design must be built with positive-only
   framing and warm/accent colors — loss-framed or punitive language and
   red/warning color are both still out of bounds. Where this constraint
   makes a conventional gamification pattern (e.g. a red "streak broken"
   state) infeasible as usually built, that's a design problem to solve
   within the constraint, not a reason to relitigate it here.
4. **Bilingual as a first-class condition.** English and Farsi (RTL) are
   both real, current operating conditions, not a future localization
   task.

## Accessibility & Inclusion

No accessibility standard beyond RTL/bilingual correctness has been
established with the user yet.
