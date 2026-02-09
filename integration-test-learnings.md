# Integration Test Learnings - CodeCom

## Overview
This document captures insights, best practices, and lessons learned during the implementation of integration tests for the CodeCom backend API.

**Purpose**: Share knowledge to improve test quality, avoid common pitfalls, and accelerate future test development.

See [integration-test-plan.md](./integration-test-plan.md) for the testing strategy.  
See [integration-test-tracking.md](./integration-test-tracking.md) for current progress.

---

## General Learnings

### Spring Boot Testing Best Practices

#### @SpringBootTest Configuration
**Learning**: Use `webEnvironment = WebEnvironment.RANDOM_PORT` for integration tests to avoid port conflicts.

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class BaseIntegrationTest {
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected TestRestTemplate restTemplate;
}
```

**Why**: Allows multiple test suites to run in parallel without port collisions.

---

#### Test Database Strategy
**Learning**: Use H2 in-memory database for integration tests, but ensure it mimics production behavior.

**Configuration** (`application-test.properties`):
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.sql.init.mode=always
spring.sql.init.data-locations=classpath:test-seed.sql
```

**Why**: Fast test execution, clean state per test run, no external dependencies.

---

### Test Data Management

#### Seed Data Strategy
**Learning**: Create minimal, focused seed data that represents realistic scenarios.

**Challenge**: The problem statement mentioned "Unidade, Usuario, Perfil" entities which don't exist in CodeCom.

**Solution**: Adapted to use actual CodeCom entities:
- **CodeNode**: Sample classes, methods, fields
- **CodeRelationship**: Call relationships, inheritance
- **FeatureSlice**: Feature groupings

**Lesson**: Always verify entity model before creating seed data. Don't blindly copy from other projects.

---

#### Data Isolation
**Learning**: Each test should be independent and not rely on execution order.

**Approach**:
- Use `@DirtiesContext` when tests modify shared state
- Reset database between test classes
- Use unique identifiers for test data

```java
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class KnowledgeGraphIntegrationTest {
    // Tests that modify the knowledge graph
}
```

---

### API Testing Patterns

#### Testing REST Endpoints
**Learning**: Use both MockMvc and TestRestTemplate depending on the test focus.

**MockMvc**: Better for testing request/response structure, JSON parsing
```java
mockMvc.perform(get("/api/files/tree"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.nodes").isArray());
```

**TestRestTemplate**: Better for full HTTP integration, easier for complex scenarios
```java
ResponseEntity<FileTree> response = restTemplate.getForEntity(
    "/api/files/tree", FileTree.class);
assertEquals(HttpStatus.OK, response.getStatusCode());
```

---

#### Error Scenario Testing
**Learning**: Always test both happy path and error scenarios.

**Pattern**:
```java
@Test
void testGetFile_NotFound_Returns404() {
    ResponseEntity<String> response = restTemplate.getForEntity(
        "/api/files/content?path=/nonexistent.java", String.class);
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
}
```

**Why**: Error handling is often overlooked but critical for production reliability.

---

## Technology-Specific Learnings

### H2 Database
**Issue**: H2 syntax may differ from production database.

**Solution**: Use H2 in PostgreSQL compatibility mode if needed:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL
```

**Learning**: Test compatibility between H2 and production database during initial setup.

---

### JPA/Hibernate
**Issue**: Lazy loading can cause issues in integration tests.

**Solution**: 
- Use `@Transactional` on test methods when needed
- Be explicit about fetch strategies
- Test cascade operations carefully

```java
@Test
@Transactional
void testDeleteSlice_CascadesCorrectly() {
    // Test cascade delete behavior
}
```

---

### JSON Serialization
**Learning**: Verify JSON structure matches API contract.

**Tool**: Use `@JsonTest` for isolated JSON testing, or `jsonPath()` in integration tests.

```java
.andExpect(jsonPath("$.id").value(1))
.andExpect(jsonPath("$.name").value("TestSlice"))
.andExpect(jsonPath("$.files").isArray())
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Port Conflicts
**Problem**: Tests fail with "Address already in use"

**Solution**: Use `WebEnvironment.RANDOM_PORT`

---

### Pitfall 2: Test Data Contamination
**Problem**: Tests pass individually but fail when run together

**Solution**: 
- Use `@DirtiesContext` appropriately
- Clear repositories in `@BeforeEach`
- Use unique test data per test

---

### Pitfall 3: Asynchronous Operations
**Problem**: Tests fail intermittently due to timing issues

**Solution**: 
- Use `@Async` carefully in tests
- Add appropriate wait mechanisms
- Prefer synchronous operations in tests

---

### Pitfall 4: File System Dependencies
**Problem**: Tests depend on specific file locations

**Solution**:
- Use `@TempDir` for temporary files
- Create test fixtures programmatically
- Don't assume specific project structure

```java
@Test
void testFileAnalysis(@TempDir Path tempDir) throws IOException {
    Path testFile = tempDir.resolve("Test.java");
    Files.writeString(testFile, "public class Test {}");
    // Test with testFile
}
```

---

## Performance Insights

### Test Execution Speed
**Target**: < 2 minutes for all integration tests

**Optimization Strategies**:
- Use in-memory database (not file-based H2)
- Minimize `@DirtiesContext` usage
- Batch related tests in same class
- Use parallel execution when safe

---

### Database Initialization
**Learning**: Initialize schema once per test class, not per test method.

**Approach**: Let Spring handle initialization via `spring.jpa.hibernate.ddl-auto=create-drop`

---

## Test Quality Metrics

### Coverage Goals
- **Endpoint Coverage**: 80% minimum
- **Service Layer**: Already at ~75% from unit tests
- **Happy Path**: 100% of endpoints
- **Error Scenarios**: 50% of endpoints minimum

---

### Code Smell Detection
**Watch for**:
- Duplicate setup code → Extract to base class or helper
- Magic numbers → Use constants
- Hard-coded paths → Use configuration
- Overly complex tests → Split into smaller tests

---

## Testing Anti-Patterns to Avoid

### ❌ Don't: Test Implementation Details
```java
// Bad: Testing internal service calls
verify(analysisService, times(1)).analyzeFile(anyString());
```

### ✅ Do: Test Observable Behavior
```java
// Good: Testing API response
ResponseEntity<List<Symbol>> response = restTemplate.getForEntity(
    "/api/analysis/symbols?file=Test.java", List.class);
assertEquals(HttpStatus.OK, response.getStatusCode());
```

---

### ❌ Don't: Create Monolithic Tests
```java
// Bad: One test for entire API
@Test
void testEntireAPI() {
    // 500 lines of test code
}
```

### ✅ Do: Create Focused Tests
```java
// Good: One test per scenario
@Test
void testCreateSlice_ValidData_ReturnsCreated() { }

@Test
void testCreateSlice_DuplicateName_ReturnsBadRequest() { }
```

---

## Lessons from Other Projects

### E2E vs Integration Tests
**Learning**: CodeCom already has excellent E2E coverage (44 tests).

**Integration Tests Fill Gap**:
- E2E: Frontend → Backend → Database (user perspective)
- Integration: REST API → Service → Database (developer perspective)
- Unit: Individual components in isolation

**Takeaway**: Integration tests complement, not replace, E2E tests.

---

## Future Improvements

### Potential Enhancements
1. **Contract Testing**: Add Spring Cloud Contract for API versioning
2. **Performance Benchmarks**: Add JMH benchmarks for critical paths
3. **Mutation Testing**: Add PIT for test quality verification
4. **CI/CD Integration**: Run integration tests in GitHub Actions

---

## Quick Reference

### Running Tests
```bash
# Run all integration tests
./gradlew test --tests "*IntegrationTest"

# Run specific test class
./gradlew test --tests "AnalysisIntegrationTest"

# Run with coverage
./gradlew test jacocoTestReport
```

### Debugging Tests
```bash
# Run with debug logging
./gradlew test --debug

# Run single test with verbose output
./gradlew test --tests "AnalysisIntegrationTest.testGetSymbols" --info
```

---

## Contributors' Notes

### Session 1 - February 9, 2026
**Activities**:
- Created integration test infrastructure plan
- Established test data strategy
- Set up tracking and learnings documents
- Created test-seed.sql with sample CodeNode/CodeRelationship data
- Created BaseIntegrationTest class
- Created KnowledgeGraphIntegrationTest

**Key Decisions**:
- Use H2 in-memory database for speed
- Adapt seed data to actual CodeCom entities
- Target 80% endpoint coverage
- Use RestTemplate for integration tests

**Challenges**:
- Problem statement referenced entities from different project
- Resolved by analyzing actual codebase entities
- SQL seed data loading required `spring.jpa.defer-datasource-initialization=true`
- FeatureSlice entity uses `@PrePersist` for timestamps, so can't insert timestamps directly

**Solutions**:
- Set `spring.jpa.defer-datasource-initialization=true` in test properties
- This ensures Hibernate creates tables before Spring runs SQL scripts
- For FeatureSlice, let JPA handle timestamps via @PrePersist

**Next Steps**:
- Fix seed data for FeatureSlice timestamps
- Get first integration test passing
- Create more integration tests for other controllers

---

## Resources

### Official Documentation
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [AssertJ Documentation](https://assertj.github.io/doc/)

### CodeCom-Specific
- [SRS.md](./SRS.md) - Requirements specification
- [STATUS.md](./STATUS.md) - Implementation status
- [AGENTS.md](./AGENTS.md) - Agent guidelines

---

## Feedback & Improvements

This document is a living resource. Update it as you learn new insights during test implementation.

**Template for adding learnings**:
```markdown
### [Topic Name]
**Learning**: [What you learned]

**Context**: [Why it matters]

**Example**:
` ``[language]
[code example]
` ``

**Takeaway**: [Key insight]
```

---

*Last Updated*: February 9, 2026
