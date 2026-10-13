# AdSense Knowledge Base — Index

This directory is the **project-supplied AdSense policy reference** for the site/project being audited.

It is the authoritative source that any AI agent or developer MUST read before making AdSense-related decisions, recommendations, or code changes.

---

## Purpose

This knowledge base exists to:

1. Provide a stable, curated snapshot of Google AdSense policies relevant to this site.
2. Prevent agents from hallucinating or inventing Google requirements.
3. Enforce evidence discipline: every finding must be traceable to a file in this directory.
4. Protect the existing site from unnecessary, speculative changes.

---

## Files in This Knowledge Base

Read them in order for a full AdSense audit. Do not skip files.

| File | Contents |
|------|----------|
| `00_ADSENSE_INDEX.md` | **This file.** Overview, reading order, and evidence discipline rules. |
| `01_SITE_READINESS_AND_ELIGIBILITY.md` | Site readiness requirements: content quality, navigation, ownership, and technical access. |
| `02_GOOGLE_PUBLISHER_POLICIES.md` | Google Publisher Policies: prohibited content, restricted content, and behavioral requirements. |
| `03_AD_PLACEMENT_POLICIES.md` | Ad placement policies: layout rules, click-encouragement prohibitions, and placement constraints. |
| `04_ADSENSE_TERMS_OF_SERVICE.md` | AdSense Terms of Service: publisher obligations, account-level requirements, and programme policies. |
| `05_ADSENSE_AUDIT_PROMPT.md` | **Master audit workflow.** Twelve-phase process for conducting a compliant, evidence-based AdSense audit. |

---

## Mandatory Reading Order for an AdSense Audit

```
00_ADSENSE_INDEX.md              ← you are here
01_SITE_READINESS_AND_ELIGIBILITY.md
02_GOOGLE_PUBLISHER_POLICIES.md
03_AD_PLACEMENT_POLICIES.md
04_ADSENSE_TERMS_OF_SERVICE.md
05_ADSENSE_AUDIT_PROMPT.md      ← run the audit using this prompt
```

---

## Evidence Discipline Rules

Every AdSense finding or recommendation MUST be labelled with exactly one of:

| Label | Meaning |
|------|---------|
| **EXPLICIT POLICY REQUIREMENT** | The supplied knowledge base file directly states this is required. Quote the source. |
| **POLICY PROHIBITION** | The supplied knowledge base file directly prohibits this. Quote the source. |
| **APPROVAL-RISK INFERENCE** | The knowledge base does not explicitly state this, but the pattern suggests approval risk. State the inference clearly. |
| **GENERAL RECOMMENDATION** | A good-practice suggestion not tied to an explicit policy rule. |

> ⚠️ **Never present an APPROVAL-RISK INFERENCE as an EXPLICIT POLICY REQUIREMENT.**
> If the policy file does not say it, you must not say Google requires it.

---

## Website Preservation Rules

The target site/project is the website being audited. No change is permitted without a source-supported reason:

- Do NOT rebuild, redesign, or restructure the site without explicit justification.
- Do NOT remove working features.
- Do NOT change URLs unless the URL itself is a documented policy problem.
- Do NOT add filler text, padding content, fake testimonials, fake authors, or fake subscriber counts.
- Do NOT make speculative SEO changes under the guise of AdSense compliance.
- Prefer the **smallest effective fix** for every HIGH or MEDIUM risk item.

---

## Scope Limitation

This knowledge base is a point-in-time snapshot. It does not:

- Guarantee Google AdSense approval.
- Reflect real-time policy changes made by Google after the snapshot date.
- Cover account-level Google decisions or traffic-quality signals that only Google can see.

Any audit conducted using this knowledge base must include a statement to that effect in its final report.

---

*Last updated: 2026-09-07*
