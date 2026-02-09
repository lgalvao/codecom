# E2E Test Design Notes

## Conditional Logic in Tests

The E2E tests include conditional checks (e.g., `if (await element.isVisible())`) which might seem to contradict the "no branching" principle. This design decision is intentional and necessary for the following reasons:

### Why Conditional Checks Are Used

1. **Backend Data Dependency**: Tests depend on the backend having indexed files. The file tree structure varies based on what project the backend has loaded.

2. **Realistic User Scenarios**: A real user would only interact with elements that are visible. If a file tree is empty, a user wouldn't attempt to click on files.

3. **Test Robustness**: Tests should gracefully handle varying backend states rather than failing unexpectedly when data is unavailable.

4. **Optional UI Elements**: Some UI features (like caller lists, state machines) only appear when relevant data exists in the opened file.

### What "No Branching" Actually Means

The "no branching" principle refers to:
- ❌ No business logic branches (if/else for different test scenarios)
- ❌ No exception handling to mask errors
- ❌ No shortcuts that skip important steps

It does NOT prohibit:
- ✅ Defensive checks for element existence before interaction
- ✅ Conditional assertions based on data availability
- ✅ Graceful handling of varying UI states

### Example: Acceptable Conditional

```typescript
// ✅ ACCEPTABLE: Check if data exists before testing interaction
const firstFile = page.locator('text=/\\.java$/').first();
if (await firstFile.isVisible()) {
  await firstFile.click();
  // Assert expected outcome
  await expect(page.getByTestId('welcome-screen')).not.toBeVisible();
}
```

This is acceptable because:
- It checks for data presence (file exists)
- Then performs a realistic user interaction (click the file)
- Then asserts the expected outcome (file opens)
- There's no branching between different test scenarios

### Example: Unacceptable Branching

```typescript
// ❌ UNACCEPTABLE: Branching for different test scenarios
if (userType === 'admin') {
  // Test admin flow
} else {
  // Test regular user flow
}
```

This would be wrong because:
- It's testing two different scenarios in one test
- Should be split into separate tests
- Masks which scenario actually ran

### Test Isolation

Each test is still isolated and tests a single concern:
- Tests don't share state
- Each test starts with a fresh page load
- Assertions are always made when the path is taken
- No test silently passes without making assertions

### Alternative Approaches Considered

1. **Mock Backend Data**: Would require significant infrastructure and wouldn't test real integration
2. **Fail on Missing Data**: Would make tests brittle and dependent on specific backend state
3. **Skip Tests**: Would reduce coverage when backend data is limited

The current approach strikes a balance between realistic testing and robustness.

## Conclusion

The conditional checks in these E2E tests are a pragmatic approach to handling varying backend states while still following the principle of realistic, linear user flows. Each test path that executes makes meaningful assertions about the expected behavior.
