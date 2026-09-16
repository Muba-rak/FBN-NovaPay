---
name: ai-usage-reporter
description: Automated AI usage auditing, transcript synthesis, hallucination critique reporting, and project documentation generator for FirstBank NovaBiz.
---

# AI Usage Reporter & Documentation Skill Guide

This agent inspects conversation transcripts, git commits, and architectural decisions to produce grading deliverables (`AI_USAGE.md` and `README.md`).

---

## 1. Deliverables Checklist

### A. `AI_USAGE.md` Report Structure
1. **AI Tools Employed**: List models, agentic pair programming tools, IDE extensions.
2. **Prompts & Outputs**:
   - Prompt 1: Initial architecture & kobo precision engine setup.
   - Prompt 2: Optimistic mutation & TanStack snapshot rollback pattern.
   - Prompt 3: High-performance virtualized feed with 1,000+ items.
3. **Critical Hallucination Critique**:
   - Floating-Point Arithmetic bug (e.g. attempting floating division in ledger calculations).
   - Incomplete snapshot rollback (omitting query cancellation before optimistic cache writes).
   - TypeScript jest-dom matcher incompatibility with Vitest.
4. **Human Verification & Resolution**: How each issue was identified, tested, and resolved.

### B. `README.md` Technical Architecture
- Architectural summary & state management rationale.
- Kobo precision rules.
- MSW mock API documentation.
- Running, testing, and building instructions.
