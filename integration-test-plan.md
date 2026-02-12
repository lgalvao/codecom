# Integration Test Plan - CodeCom

## Overview
This document outlines the strategy for implementing integration tests for the CodeCom backend API. Integration tests will verify that all components work together correctly, testing the full request-response cycle including controllers, services, repositories, and database interactions.

## Objectives
1. **Full Stack Testing**: Test the complete flow from HTTP request to database and back
2. **API Contract Verification**: Ensure all REST endpoints behave according to specification
3. **Data Integrity**: Verify database operations and entity relationships
4. **Error Handling**: Test error scenarios and edge cases
5. **Performance Baseline**: Establish performance metrics for critical operations

## Test Scope

### In Scope
- All REST API endpoints (8 controllers)
- Database interactions (H2 file-based)
- Service layer integration
- DTO transformations
- Error handling and validation
- Cross-cutting concerns (CORS, exception handling)

### Out of Scope
- Frontend components (covered by E2E tests)
- External dependencies (if any)
- Performance/load testing (future enhancement)

## Technology Stack
- **Framework**: Spring Boot Test (`@SpringBootTest`)
- **HTTP Client**: TestRestTemplate / MockMvc
- **Database**: H2 in-memory for tests
- **Test Data**: SQL seed files
- **Assertions**: JUnit 5 + AssertJ

## Test Structure

### Directory Layout
```
backend/src/test/
├── java/com/codecom/
│   ├── integration/          # NEW: Integration tests
│   │   ├── AnalysisIntegrationTest.java
│   │   ├── FileSystemIntegrationTest.java
│   │   ├── KnowledgeGraphIntegrationTest.java
│   │   ├── FeatureSliceIntegrationTest.java
│   │   ├── FlowGraphIntegrationTest.java
│   │   ├── StateMachineIntegrationTest.java
│   │   ├── StatisticsIntegrationTest.java
│   │   └── ExportIntegrationTest.java
│   ├── controller/           # Existing unit tests
│   ├── service/              # Existing unit tests
│   └── ...
└── resources/
    ├── application-test.properties  # NEW: Test configuration
    └── test-seed.sql               # NEW: Test data
```

### Test Data Strategy
Since the existing entities are:
- **CodeNode**: Represents code symbols (classes, methods, interfaces)
- **CodeRelationship**: Represents relationships between nodes (CALLS, INHERITS)
- **FeatureSlice**: Represents feature-based code groupings

The `test-seed.sql` will contain:
- Sample CodeNode entities (classes, methods, fields)
- Sample CodeRelationship entities (call relationships, inheritance)
- Sample FeatureSlice entities (feature groupings)

**Note**: The problem statement mentions Unidade, Usuario, Perfil, Processo, Subprocesso which appear to be entities from a different domain. For CodeCom, we'll use the actual entities in the system.

## API Endpoints to Test

### 1. AnalysisController (`/api/analysis`)
- `GET /api/analysis/symbols` - List all symbols in a file
- `GET /api/analysis/callers` - Get callers of a symbol
- `GET /api/analysis/definition` - Get symbol definition
- `GET /api/analysis/test-references` - Get test references
- `GET /api/analysis/complexity` - Get complexity metrics
- `GET /api/analysis/next-package` - Navigate to next package
- `GET /api/analysis/previous-package` - Navigate to previous package

### 2. FileSystemController (`/api/files`)
- `GET /api/files/tree` - Get file tree structure
- `GET /api/files/content` - Get file content

### 3. KnowledgeGraphController (`/api/knowledge-graph`)
- `POST /api/knowledge-graph/index` - Index a file
- `GET /api/knowledge-graph/nodes` - Get all nodes
- `GET /api/knowledge-graph/relationships` - Get relationships
- `GET /api/knowledge-graph/query/calls` - Query call relationships
- `GET /api/knowledge-graph/query/inherits` - Query inheritance
- `GET /api/knowledge-graph/query/callers` - Get callers
- `DELETE /api/knowledge-graph/clear` - Clear graph
- `GET /api/knowledge-graph/stats` - Get statistics

### 4. FeatureSliceController (`/api/feature-slices`)
- `GET /api/feature-slices` - List all slices
- `GET /api/feature-slices/{id}` - Get slice by ID
- `POST /api/feature-slices` - Create new slice
- `PUT /api/feature-slices/{id}` - Update slice
- `DELETE /api/feature-slices/{id}` - Delete slice
- `POST /api/feature-slices/{id}/expand` - Expand slice with knowledge graph

### 5. FlowGraphController (`/api/flow-graph`)
- `GET /api/flow-graph` - Get architecture flow graph
- `POST /api/flow-graph/generate` - Generate flow graph

### 6. StateMachineController (`/api/state-machines`)
- `GET /api/state-machines` - Get state machines from file

### 7. StatisticsController (`/api/statistics`)
- `GET /api/statistics` - Get code statistics

### 8. ExportController (`/api/export`)
- `POST /api/export` - Export files in various formats

## Test Categories

### Happy Path Tests
- Standard CRUD operations
- Valid data scenarios
- Successful API responses (200, 201, 204)

### Error Handling Tests
- Invalid input data (400 Bad Request)
- Missing resources (404 Not Found)
- Server errors (500 Internal Server Error)
- Constraint violations

### Edge Cases
- Empty results
- Large data sets
- Special characters in file paths
- Concurrent operations

### Data Integrity Tests
- Entity relationships maintained
- Cascade operations
- Transaction rollback on error

## Test Naming Convention
```java
// Pattern: test<Operation>_<Scenario>_<ExpectedResult>
testGetSymbols_ValidFile_ReturnsSymbolList()
testCreateSlice_InvalidData_ReturnsBadRequest()
testIndexFile_NonExistentFile_ReturnsNotFound()
```

## Execution Strategy

### Local Development
1. Run individual test classes during development
2. Use `@DirtiesContext` when necessary to reset state
3. Verify all tests pass before committing

### CI/CD Integration
1. Run integration tests after unit tests
2. Use separate test database
3. Generate coverage reports
4. Fail build on test failure

## Success Criteria
- ✅ All 8 controller integration test classes created
- ✅ Minimum 80% endpoint coverage
- ✅ All tests passing consistently
- ✅ Test execution time < 2 minutes total
- ✅ Zero flaky tests
- ✅ Documentation complete

## Implementation Phases

### Phase 1: Infrastructure Setup ⏳
- [ ] Create test configuration
- [ ] Create test-seed.sql
- [ ] Set up base integration test class
- [ ] Configure test database

### Phase 2: Core API Tests ⏳
- [ ] FileSystemController integration tests
- [ ] AnalysisController integration tests
- [ ] StatisticsController integration tests

### Phase 3: Graph & Slicing Tests ⏳
- [ ] KnowledgeGraphController integration tests
- [ ] FeatureSliceController integration tests
- [ ] FlowGraphController integration tests

### Phase 4: Advanced Features ⏳
- [ ] StateMachineController integration tests
- [ ] ExportController integration tests

### Phase 5: Verification ⏳
- [ ] Run all tests together
- [ ] Verify coverage metrics
- [ ] Document learnings
- [ ] Update tracking document

## References
- **Learnings Document**: See [integration-test-learnings.md](./integration-test-learnings.md)
- **Tracking Document**: See [integration-test-tracking.md](./integration-test-tracking.md)
- **SRS Document**: [SRS.md](./SRS.md)
- **Status Document**: [STATUS.md](./STATUS.md)

## Notes
- Integration tests complement existing unit tests (157 backend tests)
- E2E tests (44 tests) cover frontend integration
- Integration tests focus on backend API contracts
- All tests must pass before proceeding to next phase
