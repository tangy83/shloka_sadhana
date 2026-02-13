# Persona 3: Frontend Engineer 💻

**Focus**: Code architecture, state management, performance, maintainability
**Goal**: Refactor for scalability and developer experience
**Priority**: CRITICAL | **Impact**: Code Quality & Maintainability

---

## Enhancement Backlog (15 Items)

### P0 (Critical) - 3 Items

| # | Enhancement | Description | Priority | Effort |
|---|-------------|-------------|----------|--------|
| 1 | **Centralized State Management** | Implement Zustand or Context + useReducer to replace 59 scattered useState instances. | P0 | L |
| 2 | **Navigation Type Safety** | Fix all `@ts-expect-error` comments; fully type RootStackParamList and navigation props. | P0 | M |
| 3 | **Custom Component Library** | Extract shared UI patterns into reusable components in /components/ui folder. | P0 | L |

### P1 (High Priority) - 10 Items

| # | Enhancement | Description | Priority | Effort |
|---|-------------|-------------|----------|--------|
| 4 | **Memoization Strategy** | Add React.memo to expensive card components; useMemo for calculations; useCallback for handlers. | P1 | M |
| 6 | **Error Boundary Enhancement** | Improve ErrorBoundary with retry mechanism, error reporting UI, and graceful degradation. | P1 | S |
| 7 | **Form Validation Library** | Integrate react-hook-form or Formik for Sankalp/Offering modals with validation schemas. | P1 | M |
| 8 | **API Layer Abstraction** | Create services layer for data fetching (even for local AsyncStorage) with consistent error handling. | P1 | M |
| 9 | **Testing Coverage Increase** | Increase test coverage to 90%+ with integration tests for user flows (practice session, streak update). | P1 | L |
| 14 | **PropTypes to TypeScript Migration** | Ensure all components have proper TypeScript interfaces for props; remove any PropTypes remnants. | P1 | M |

### P2 (Medium Priority) - 6 Items

| # | Enhancement | Description | Priority | Effort |
|---|-------------|-------------|----------|--------|
| 5 | **Code Splitting** | Implement lazy loading for screens, especially detail screens and settings subpages. | P2 | M |
| 10 | **Linting Rules Enhancement** | Add stricter ESLint rules: no hard-coded colors, enforce component structure, prop-types validation. | P2 | S |
| 11 | **Performance Monitoring** | Integrate React Native Performance monitoring to track render times and identify bottlenecks. | P2 | M |
| 12 | **Bundle Size Optimization** | Analyze bundle with react-native-bundle-visualizer; remove unused dependencies; optimize imports. | P2 | M |
| 13 | **Storybook Integration** | Set up Storybook for component development and visual regression testing. | P2 | L |
| 15 | **Refactor Utils** | Break down large util files (paanchang.ts, storage.ts) into smaller, single-responsibility modules. | P2 | M |

---

## Technical Architecture Improvements

### Current State (Problems)
- 59 useState instances scattered across 47 components
- No centralized state management
- Hard-coded colors and spacing throughout codebase
- Navigation type errors requiring `@ts-expect-error`
- Duplicated component code (no shared UI library)
- 813 tests but missing integration test coverage
- No form validation framework
- No lazy loading or code splitting

### Target State (Solutions)
- Single source of truth for app state (Zustand)
- Type-safe navigation throughout
- Reusable component library (40+ components)
- 90%+ test coverage including integration tests
- Validated forms with react-hook-form
- Lazy-loaded screens for faster initial load
- Strict ESLint rules preventing anti-patterns

---

## Implementation Roadmap

### Phase 1: State Management (Week 1-2)
1. Audit all useState instances
2. Design global state structure
3. Implement Zustand stores (user, practice, content)
4. Migrate components one-by-one
5. Add state persistence with AsyncStorage

### Phase 2: Type Safety (Week 3)
1. Fix all `@ts-expect-error` comments
2. Fully type navigation params
3. Add TypeScript interfaces for all props
4. Enable strict TypeScript compiler options

### Phase 3: Component Library (Week 4-6)
1. Extract common patterns
2. Build base components (Button, Card, Input, Modal)
3. Create component variants
4. Document in Storybook
5. Migrate screens to use library

### Phase 4: Testing & Quality (Week 7-8)
1. Add integration tests for key flows
2. Implement form validation
3. Enhance error boundaries
4. Add performance monitoring
5. Bundle size optimization

---

## Success Metrics

- **Code Quality**: ESLint warnings reduced to 0
- **Type Safety**: No `@ts-expect-error` comments in codebase
- **Reusability**: 80%+ of UI uses component library
- **Test Coverage**: 90%+ line coverage, 100% critical paths
- **Performance**: Bundle size reduced by 20%, startup time <2s
- **Developer Experience**: 50% faster feature implementation

---

## Dependencies

- **Before Starting**:
  - Code architecture review with team
  - Choose state management library (Zustand recommended)
  - Set up development tools (Storybook, Flipper)
  - Baseline performance metrics

- **Parallel Work**:
  - UI/UX Designer (component designs)
  - Performance Engineer (optimization targets)
  - Product Manager (feature prioritization)

---

## Critical Files to Create/Modify

### New Files
- `src/store/` - Zustand stores (userStore, practiceStore, contentStore)
- `src/components/ui/` - Component library folder
- `src/services/` - API/data layer abstraction
- `.storybook/` - Storybook configuration
- `src/types/navigation.ts` - Fully typed navigation params

### Files to Refactor
- All screen components - Use centralized state
- `src/navigation/AppNavigator.tsx` - Remove `@ts-expect-error`
- `src/hooks/` - Simplify with centralized state
- `src/utils/` - Break into smaller modules
- `.eslintrc.js` - Add stricter rules

---

## Code Examples

### Before: Scattered State
```typescript
// In PracticeScreen.tsx
const [malaCount, setMalaCount] = useState(0);
const [sankalp, setSankalp] = useState('');
// ... 10+ more useState calls
```

### After: Centralized State
```typescript
// In PracticeScreen.tsx
const { malaCount, sankalp, updatePractice } = usePracticeStore();
```

### Before: Navigation Type Error
```typescript
// @ts-expect-error - Navigation types not fully defined
navigation.navigate('ShlokaDetail', { id: shloka.id });
```

### After: Type-Safe Navigation
```typescript
navigation.navigate('ShlokaDetail', { id: shloka.id }); // Fully typed
```

---

## Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Storybook for React Native](https://storybook.js.org/docs/react/get-started/install)
- [React Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)

---

## Notes

- **Migration Strategy**: Incremental, not big bang rewrite
- **Backward Compatibility**: Ensure app works during migration
- **Code Reviews**: Strict reviews for new code to maintain quality
- **Documentation**: Update docs as architecture evolves
