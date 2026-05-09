# EMOVEL Automation Playbook

## 1. Purpose

This document defines how EMOVEL should approach automation.

Its purpose is to help EMOVEL AI and future builders structure workflows, routing logic, handoffs, exports, billing access, quality checks, client delivery, and future system orchestration.

Automation inside EMOVEL should increase control, not remove judgment.

The goal is not to automate everything. The goal is to automate repeatable operational steps while preserving premium quality, commercial clarity, and human decision points where they matter.

## 2. Automation Philosophy

EMOVEL automation is controlled execution.

It should feel like a precise operating layer, not a chaotic collection of triggers.

Core philosophy:

- Automate repeatable steps.
- Preserve strategic judgment.
- Keep user states visible.
- Make handoffs clean.
- Log meaningful events.
- Fail safely.
- Keep commercial flows intact.
- Prioritize quality over speed.

Automation should support the operator.

It should not hide important decisions, create silent changes, or make the system feel unpredictable.

Good automation:

- saves time
- reduces repeated work
- improves consistency
- preserves brand standards
- creates clean deliverables
- protects access and billing logic
- makes failure recoverable

Bad automation:

- hides state
- creates low-quality output faster
- bypasses review
- overcomplicates simple flows
- moves data without context
- treats all users the same
- breaks premium trust

## 3. What Should Be Automated

Automate steps that are structured, repeatable, and low-risk when rules are clear.

Good candidates:

- project creation from a validated brief
- section generation routing
- status updates
- export assembly
- file naming
- signed URL generation
- subscription access changes
- plan limit checks
- onboarding state updates
- brand profile loading
- project memory retrieval
- quality checklist preparation
- content formatting
- client handoff packaging
- usage logging
- error categorization

Automation should be used when the system already knows:

- the input
- the rules
- the expected output
- the failure path
- the ownership boundary
- the user state

If any of those are unclear, automation should pause or request review.

## 4. What Should Not Be Automated

Do not automate decisions that require taste, strategy, approval, or commercial judgment.

Avoid automating:

- final offer approval
- pricing changes without review
- brand positioning changes
- publishing to external channels without confirmation
- billing plan changes outside Stripe-confirmed events
- deleting projects or exports
- marking sections accepted without explicit user action
- client delivery without final review
- irreversible workflow changes
- public asset release
- sensitive account changes

Do not automate quality away.

EMOVEL should never imply:

- "set it and forget it"
- "passive income on autopilot"
- "no judgment required"
- "fully automated success"

The operator remains responsible for final commercial decisions.

## 5. EMOVEL Workflow Principles

EMOVEL workflows should be clear, staged, and recoverable.

Workflow principles:

- Start from a defined input.
- Validate before generation.
- Preserve ownership checks.
- Route through the correct module.
- Store meaningful state.
- Show user-facing status.
- Keep outputs reviewable.
- Export only controlled deliverables.
- Log important events.
- Make failures explicit.

Recommended workflow shape:

1. Input
2. Validation
3. Context loading
4. Routing
5. Generation or assembly
6. Review state
7. Acceptance or export
8. Delivery
9. Logging
10. Recovery path

Every workflow should answer:

- What triggered it?
- Who owns it?
- What data is used?
- What output is created?
- What happens if it fails?
- What user state is required?

## 6. Builder Automation Patterns

Builder automation should help users move from brief to structured page system.

Appropriate Builder automation:

- create a persisted project after authenticated generation begins
- save generated sections as ready
- preserve fixed section order
- load latest persisted project
- update section drafts
- show local/authenticated/Pro states
- assemble Markdown/TXT/PDF exports
- use accepted sections before ready fallback
- preserve export warnings

Builder automation should not:

- accept sections automatically
- publish pages automatically
- change pricing logic without user action
- delete sections without confirmation
- hide generation errors
- consume usage for exports
- bypass project ownership checks

Builder automation pattern:

1. User enters brief.
2. System validates state.
3. Authenticated user gets persisted project.
4. AI route generates structured spec.
5. Sections are saved as ready.
6. User reviews.
7. User accepts or exports.

The Builder should feel assisted, not autonomous.

## 7. AI Routing Patterns

AI routing should send requests through the right provider, model, and boundary logic.

Routing should consider:

- user authentication
- plan limits
- request category
- boundary classification
- model availability
- fallback provider availability
- rate limits
- project context
- brand profile
- current spec

AI routing should automate:

- boundary classification
- provider selection
- fallback model attempt
- streaming state updates
- error categorization
- usage recording
- section status updates

AI routing should not automate:

- unsafe content approval
- unrelated request fulfillment
- billing bypass
- final user acceptance
- hidden retries that change output without visibility

Routing must remain observable.

The user should understand whether the system is generating, streaming, blocked, rate-limited, or failed.

## 8. Brand Memory Automation

Brand memory should help EMOVEL maintain consistency.

It can automate:

- loading brand profile into generation context
- applying tone and visual direction
- reusing audience and positioning
- preserving offer direction
- adapting outputs to saved brand rules

Brand memory should not:

- overwrite brand profile without explicit user action
- invent brand facts
- silently change tone
- apply generic brand assumptions
- expose private brand data in exports unless intended

Brand memory automation rules:

- Treat brand memory as context, not command.
- Keep updates explicit.
- Use saved profile fields before guessing.
- If brand context is missing, generate safely with neutral premium defaults.
- Keep brand-specific copy controlled and practical.

The purpose of brand memory is consistency, not creative overreach.

## 9. Project Memory Automation

Project memory should preserve context across sessions and outputs.

It can automate:

- loading previous project state
- retrieving section order
- saving section drafts
- storing generated specs
- preserving accepted/ready/error states
- using project context in exports
- keeping handoff continuity

Project memory should not:

- mix data across users
- mix unrelated projects
- overwrite accepted work without review
- treat old drafts as final outputs
- use archived projects as active context unless selected

Project memory rules:

- Scope memory by user, workspace, and project.
- Keep accepted and ready states distinct.
- Keep draft history useful but not noisy.
- Never let memory bypass current user intent.
- Make loaded project state visible when it affects output.

Memory should reduce repetition without reducing control.

## 10. Export And Delivery Automation

Exports should turn reviewed work into deliverables.

Automation can handle:

- section normalization
- section ordering
- accepted-section preference
- ready-section fallback warnings
- file naming
- content hashing
- private PDF upload
- signed URL generation
- export history recording
- safe empty-state output

Export automation should not:

- mark sections accepted
- consume AI usage
- expose service role keys
- make private PDFs public
- include internal metadata
- expose database errors to clients
- block Markdown/TXT download if export history write fails

Delivery automation should preserve:

- ownership checks
- authentication
- plan gates
- private storage
- clear warnings
- safe filenames
- predictable output formats

Exports are not logs. They are deliverables.

## 11. Billing And Access Automation

Billing automation must be server-confirmed.

It can automate:

- Stripe Checkout session creation
- Stripe Customer Portal session creation
- customer reuse
- webhook signature verification
- stripe event recording
- idempotent webhook processing
- subscription sync
- profile plan sync
- plan limit refresh
- PDF access unlock
- downgrade on cancellation

Billing automation must not:

- trust client-side success URLs
- unlock Pro without webhook-confirmed subscription state
- expose Stripe secrets
- expose webhook secrets
- hardcode price IDs
- create fake upgrades
- bypass Stripe confirmation

Access rules:

- Active or trialing subscription maps to Pro.
- Canceled, unpaid, or inactive states map to Free.
- PDF export reads plan limits.
- Builder unlocks PDF based on refreshed account session.

Billing automation must be strict because it controls access.

## 12. Client Delivery Automation

Client delivery automation should package work cleanly.

It can automate:

- assembling deliverables
- formatting exports
- naming files
- generating handoff notes
- preparing checklists
- grouping assets by product or campaign
- creating review-ready summaries

It should not automate:

- final client send without review
- claims about results
- sensitive client data sharing
- contract or legal statements
- external publishing without confirmation

Client delivery rules:

- Include only relevant assets.
- Make the handoff easy to understand.
- State what each file is for.
- Include next steps.
- Keep tone premium and practical.
- Avoid internal system language unless useful.

The client should receive a polished deliverable, not the evidence of how the system worked.

## 13. Quality Control Automation

Quality control should be embedded into workflows.

Automate checks for:

- missing required inputs
- unsupported formats
- empty outputs
- invalid section order
- missing project ownership
- missing authentication
- plan gate failure
- export warnings
- unsafe public storage paths
- malformed JSON
- failed provider state
- missing env configuration

Quality control can produce:

- structured errors
- status messages
- warnings
- retry guidance
- checklist outputs
- QA summaries

Quality control should not:

- hide failures
- rewrite user intent
- approve outputs automatically
- replace human review for premium deliverables

The system should catch operational problems before the user discovers them through broken output.

## 14. Failure Handling Rules

Failure handling is part of the product experience.

Rules:

- Fail safely.
- Use structured errors.
- Do not expose secrets.
- Do not expose raw database or storage internals.
- Preserve user work.
- Show clear next steps.
- Keep status visible.
- Log sanitized server-side details.
- Avoid silent failures.
- Avoid irreversible recovery actions.

Failure categories should be meaningful:

- authentication required
- invalid request
- not found
- billing gate
- provider unavailable
- generation failed
- storage failed
- signed URL failed
- export history failed
- internal error

User-facing failure copy should be calm and actionable.

Example:

- "PDF storage failed. The file was not saved to private storage."

Not:

- "Something went wrong."

The more premium the system, the clearer the failure path must be.

## 15. Automation Quality Checklist

Before approving an automation, check:

- The trigger is clear.
- The user state is known.
- Authentication is enforced where needed.
- Ownership is checked.
- Inputs are validated.
- The output is defined.
- The workflow is observable.
- The failure path is safe.
- The automation does not bypass review.
- Secrets remain server-side.
- Plan gates are respected.
- Logs are sanitized.
- Exports remain private when required.
- Client deliverables remain reviewable.
- The automation reduces work without reducing judgment.
- The workflow feels premium and controlled.

If the automation creates confusion, remove or simplify it.

If it hides an important decision, add a review step.

If it can fail silently, redesign the failure path.

## 16. How EMOVEL AI Should Use This File

EMOVEL AI should use this file when designing, describing, or evaluating workflows and automation logic.

Use it for:

- Builder workflows
- AI routing
- brand memory
- project memory
- export flows
- billing access
- client delivery
- quality checks
- handoff systems
- future orchestration

EMOVEL AI should:

1. Identify the workflow goal.
2. Define the trigger.
3. Confirm user state and ownership.
4. Define required inputs.
5. Route through the correct module.
6. Define the output.
7. Add review points.
8. Add quality checks.
9. Define failure handling.
10. Confirm what should not be automated.

Decision rules:

- If the workflow requires judgment, do not fully automate it.
- If the workflow is repeatable and low-risk, automate the structured steps.
- If the workflow affects billing or access, trust only server-confirmed state.
- If the workflow creates a deliverable, preserve review and export safety.
- If the workflow can expose sensitive data, stop and redesign it.
- If the automation feels magical, make the state visible.

EMOVEL AI should not propose automation for novelty. It should propose controlled systems that improve execution, reduce repeated work, and preserve premium quality.
