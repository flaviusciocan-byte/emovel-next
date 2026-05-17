# EMOVEL Builder UI Blueprint v0.2

## Direction

EMOVEL Builder must become a prompt-first AI builder.

The interface should not start from menus, forms, or technical settings.
It should start from user intent.

Core flow:

Rough idea
? improved professional prompt
? generated schema
? preview
? JSON/export
? advanced controls only when needed

## Visual Reference Direction

The desired interface direction is inspired by premium AI command interfaces:

- centered prompt composer
- minimal navigation
- dark luxury tech background
- soft white typography
- warm gold accents
- graphite panels
- subtle electric blue for AI/active states
- starter blocks below the composer
- advanced controls collapsed by default
- output secondary, below the main command area

This is a reference direction only.
Do not copy any external product 1:1.

## Main Screen Structure

### 1. Builder Shell

The shared Builder shell remains.

It provides the persistent Builder module navigation:

- Builder Home
- App Factory
- Brand Profile

The shell should not dominate the experience.
It should provide orientation only.

### 2. App Factory Main Header

Use a compact module header, not a landing-page hero.

Header content:

- Eyebrow: EMOVEL APP FACTORY
- Title: What do you want to build?
- Subtitle: Turn a rough idea into a structured product, page, app, or offer system.

The title should feel like the start of a command session, not a marketing section.

### 3. Prompt Composer

The prompt composer is the main canvas.

It should include:

- large central input area
- placeholder: Describe your product, page, app, offer, or system...
- plus icon on the left
- microphone icon inside the composer
- Generate action inside the composer on the right
- subtle model/theme selector inside the composer
- Improve Prompt as a secondary action, not competing with Generate

The composer should feel like an AI command center.

Do not use a traditional form layout with a separate button row.

### 4. Starter Blocks

Below the prompt composer, show starter blocks:

- Product Page
- Digital Shop
- Dashboard
- Landing Page
- Mobile App Blueprint
- Prompt System

These replace a heavy default menu.

They should feel like selectable system blocks, not large buttons.

### 5. Advanced Controls

Advanced Controls are collapsed by default.

When opened, they include:

- Prompt Blocks
- Theme Selector
- Prompt Quality Notes
- Clear
- Copy JSON
- Download JSON

Future controls may include:

- Pages
- Components
- Background
- Checkout
- Export
- QA

Rule:

Advanced Controls are for precision.
They are not the main interface.

### 6. Output Area

Output sits below the prompt composer.

Tabs:

- Preview
- JSON
- Export

Preview should be the default.

Preview should show a clean generated app brief first.
Technical lists should be compact and secondary.

Existing preview sections can remain:

- Schema Summary
- Schema Preview
- Component Preview List
- Actions Preview List
- Data Model Preview List
- Export Targets Preview List
- QA Checklist Preview List

But visually, they should not dominate the page.

## What To Keep

Keep existing functionality:

- prompt input
- Improve Prompt
- Mic placeholder
- Generate
- selected theme
- API call
- validation
- Preview / JSON tabs
- Copy JSON
- Download JSON
- Clear
- schema preview sections
- Builder shared sidebar

## What To Reduce Visually

Reduce:

- technical labels
- heavy full-width panels
- long lists visible by default
- separate button rows under the textarea
- page feeling like a dashboard
- App Factory feeling like a separate product

## What To Avoid

Do not:

- integrate GrapesJS, Puck, Chai, or any external builder yet
- copy Figma design 1:1
- make the interface menu-first
- show all controls by default
- let JSON dominate the screen
- add new libraries for this phase

## Implementation Strategy

Do not ask Codex to “make it premium.”

Give Codex small tasks only:

1. Convert header text to command-style header.
2. Convert textarea into composer layout.
3. Move Mic and Generate inside composer.
4. Add starter blocks below composer.
5. Keep Advanced Controls collapsed.
6. Compact output preview.

Each task should modify only:

app/builder/app-factory/page.tsx

No API changes unless explicitly required.

## Product Principle

EMOVEL starts with intent, not settings.

The interface should make a weak message feel like enough to begin.
The system then turns it into a professional prompt, schema, and structured product output.
