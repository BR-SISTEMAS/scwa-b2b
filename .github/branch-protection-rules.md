# Branch Protection Rules

## Main Branch Protection
- **Branch**: `main`
- **Require pull request reviews**: Yes
- **Dismiss stale reviews**: Yes
- **Require status checks**: Yes (CI must pass)
- **Include administrators**: No
- **Allow force pushes**: No
- **Allow deletions**: No

## Development Branch Pattern
- **Pattern**: `sprint/S*`
- **Auto-delete after merge**: Yes
- **Require linear history**: Yes

## Feature Branch Pattern
- **Pattern**: `feature/*`
- **Auto-delete after merge**: Yes

## Naming Conventions
- Sprint branches: `sprint/S{N}_task_T{N}.{NNN}-description`
- Feature branches: `feature/description`
- Hotfix branches: `hotfix/issue-number-description`

## Merge Strategy
- Main ← Sprint: Squash and merge
- Sprint ← Feature: Merge commit
- Hotfix → Main: Create PR for review
