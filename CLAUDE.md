@AGENTS.md

## Claude Code notes

- Before starting a phase, read the relevant section of the plan in `docs/superpowers/plans/` and check off steps (`- [x]`) as you complete them.
- Follow TDD for logic (failing test → implementation → passing test → commit).
- Commit after each completed task with a conventional message (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Before saying a task is done, run `pnpm check`. For routing, metadata, or bundle-related changes, also run `pnpm build`.
- When visual work needs verifying, run the app (`pnpm dev`) and check it in the browser at desktop (1440px) and phone (390px) widths, in both themes.
- Ask the owner before inventing portfolio facts (metrics, dates, testimonials). Use clearly marked placeholders (`TODO(owner): ...`) instead.
