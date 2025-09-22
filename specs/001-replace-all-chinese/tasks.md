# Tasks: Replace All Chinese Language

**Input**: Design documents from `/specs/001-replace-all-chinese/`  
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `packages/ui/src/`, `packages/core/src/`
- Paths shown below assume web application structure

## Phase 3.1: Setup
- [x] T001 Install Vue-i18n dependency in packages/ui/package.json
- [x] T002 Create locales directory structure in packages/ui/src/locales/
- [x] T003 Configure Vue-i18n plugin in packages/ui/src/main.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test for language loading in packages/ui/tests/contract/test_language_loading.spec.ts
- [ ] T005 [P] Contract test for language switching in packages/ui/tests/contract/test_language_switching.spec.ts
- [ ] T006 [P] Integration test default English UI in packages/ui/tests/integration/test_default_english.spec.ts
- [ ] T007 [P] Integration test Spanish language switch in packages/ui/tests/integration/test_spanish_switch.spec.ts
- [ ] T008 [P] Integration test code English-only in packages/core/tests/integration/test_code_english.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T009 [P] Create English translation file in packages/ui/src/locales/en.json
- [x] T010 [P] Create Spanish translation file in packages/ui/src/locales/es.json
- [x] T011 Create i18n service in packages/core/src/services/i18n/index.ts
 - [x] T012 Update UI components to use translation keys in packages/ui/src/components/
- [x] T013 Remove Chinese strings from code comments in packages/core/src/
- [x] T014 Remove Chinese strings from code strings in packages/core/src/
- [x] T015 Implement language preference storage in packages/core/src/services/storage/
- [x] T016 Add language switcher component in packages/ui/src/components/LanguageSwitcher.vue

## Phase 3.4: Integration
 - [x] T017 Connect i18n service to Vue app in packages/ui/src/main.ts
 - [x] T018 Add language loading on app init in packages/ui/src/App.vue
 - [x] T019 Implement fallback to English for missing translations

## Phase 3.5: Polish
 - [x] T020 [P] Unit tests for i18n service in packages/core/tests/unit/test_i18n_service.spec.ts
 - [x] T021 [P] Unit tests for language switcher in packages/ui/tests/unit/test_language_switcher.spec.ts
 - [x] T022 Performance test translation loading <100ms
 - [x] T023 [P] Update docs/i18n.md with usage guide
 - [x] T024 Validate all UI strings have translations
 - [x] T025 Test multi-platform compatibility (web/desktop/extension)

## Dependencies
- Tests (T004-T008) before implementation (T009-T016)
- T001-T003 before T004-T008
- T009-T010 before T011-T016
- Implementation before polish (T020-T025)

## Parallel Example
```
# Launch T004-T008 together:
Task: "Contract test for language loading in packages/ui/tests/contract/test_language_loading.spec.ts"
Task: "Contract test for language switching in packages/ui/tests/contract/test_language_switching.spec.ts"
Task: "Integration test default English UI in packages/ui/tests/integration/test_default_english.spec.ts"
Task: "Integration test Spanish language switch in packages/ui/tests/integration/test_spanish_switch.spec.ts"
Task: "Integration test code English-only in packages/core/tests/integration/test_code_english.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() execution*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task