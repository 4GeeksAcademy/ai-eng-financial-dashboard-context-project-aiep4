# Documentation

## Scope

Applies to:
- `README.md`
- `README.es.md`
- `start.md`
- future operational docs in the root of the repository

## Why

The startup documentation is duplicated across multiple files. The repo already has repeated instructions in `README.md`, `README.es.md`, and `start.md`, which is a sign that the project needs one clear source of truth for setup and validation steps.

## Rules

- Keep one canonical source of truth for local setup and verification steps.
- Update all docs affected by a setup or API change in the same change set.
- When documenting the API, include the fact that the backend is demo/mock data in memory and not a persisted source of truth.
- Do not leave conflicting operational guidance in separate files.

## Examples

Correct:
- `README.md` describes the startup flow and clearly states that the backend data is generated in memory.

Incorrect:
- `start.md` and `README.md` describing different startup flows for the same project without a clear canonical source.
