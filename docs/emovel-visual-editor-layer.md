# EMOVEL Visual Editor Layer

## Purpose

This document defines the future visual editor layer for EMOVEL App Factory.

## Current Status

EMOVEL App Factory v0.1 currently supports:

- Prompt input
- Prompt improvement
- Theme selection
- Schema generation
- Schema validation
- Schema summary
- Schema preview
- Copy JSON
- Download JSON
- Clear

The current preview is intentionally simple.

## Future Layer

GrapesJS can be evaluated later as a possible visual editor layer for:

- Schema JSON to visual page editor
- Drag-and-drop page editing
- Component-based page composition
- HTML/CSS export
- Template editing
- Landing page preview

## Decision

GrapesJS should not be integrated directly into the core app yet.

It should be treated as a future visual editor reference layer.

## Rule

Do not import GrapesJS into EMOVEL until:

1. The schema is stable.
2. The component registry is stronger.
3. EMOVEL has its own component mapping.
4. Export rules are clear.
5. License and bundle impact are reviewed.

## Recommended Future Flow

Prompt
? EMOVEL Schema
? Component Map
? Theme Pack
? Simple Preview
? Visual Editor Layer
? Export HTML/CSS
? Deployment

## Status

Future phase. Not part of v0.1 core.
