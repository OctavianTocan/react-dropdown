# Draft Changelog

Generate:
1. User-facing changelog for `src/features/changelog-popup/changelog-data.ts` (in-app "What's New")
2. Developer changelog for `CHANGELOG.md` (technical reference)
3. Optional: if user wants and file exists, update `docs/testing/qa-report.md` (version/session metadata or release notes)

Arguments: `$ARGUMENTS` — time range (e.g. "3 days", "1 week", "today"). Default "3 days".

---

Part 1: User-Facing Changelog

Output must match ChangelogEntry exactly:

```typescript
{
  version: '3.X.0',      // from changelog-data.ts
  date: 'YYYY-MM-DD',
  time: 'HH:mm EET',     // 24h format with timezone (e.g. "16:00 EET")
  title: 'Short Title',  // 2-4 words
  items: [
    'Added', 'feature', 'Fixed', 'fix', 'Improved', 'improvement',
  ],
}
```

Section headers: use Added, Fixed, Improved, Changed as standalone items (renders uppercase). Multiple releases same day: separate entries per theme.

Process:
1. Read `changelog-data.ts` — current version, writing style.
2. Commits: `git log main --since="$ARGUMENTS ago" --format="%ad %h %s%n%b" --date=short --no-merges` or `gh pr list --state merged`.
3. Filter user-facing only. Include: features, bug fixes users noticed, perf users feel, UI/UX. Exclude: docs, tests, CI, refactors, CORS/proxies/API, backend-only, security hardening, feature flags off, cleanup, chore, dev/staging-only.
4. Write items: no emojis, no markdown/links/PR refs, no jargon (API, CORS, auth, tokens). Verb or noun start, not "You can now...". 5–15 words. Benefit not fix. Present tense features, past tense fixes. Good: `Share memories via WhatsApp short link`, `Edits persist through page refresh`. Bad: emoji, bold, PR numbers, "You can now", internal infra, technical detail, unimplemented features.
5. Invoke stop-slop: cut filler ("finally", "now"), performative ("seamless", "robust"), extra explanation.
6. Present TypeScript draft; ask: items to add/remove?, wording?, version/title?

---

Part 2: Developer Changelog (CHANGELOG.md)

Technical; include ALL changes. [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# [3.17.0] (2026-01-29)
### Features
- **scope:** description ([#PR](url)) ([commit](url))
### Bug Fixes / Refactors / Documentation / Chores / Tests
- **scope:** description ([commit](url))
```

Process:
1. Read CHANGELOG.md — version, format.
2. Categorize all: feat:, fix:, refactor:, docs:, chore:, test:.
3. Entries: scope in bold, PR/commit links, technical OK, under 100 chars, present tense (add, fix, remove, update).
4. Present markdown to prepend; get approval.

---

Optional: QA Report

If `docs/testing/qa-report.md` exists, ask: "Do you also want to update docs/testing/qa-report.md for this release?" If yes: read file, propose updates (version header, session date, "Released" note), apply after confirm. If file missing, don't offer.

---

Final Steps (after drafts approved)

1. changelog-data.ts — prepend to CHANGELOG_ENTRIES
2. CHANGELOG.md — prepend new version section
3. package.json — bump version to match
4. If QA update requested, apply qa-report.md edits

Present all for confirmation before applying.
