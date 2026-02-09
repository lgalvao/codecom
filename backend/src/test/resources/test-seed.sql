-- Test Seed Data for CodeCom Integration Tests
-- This file contains sample data for testing the CodeCom backend API
-- 
-- Entities included:
--   - CodeNode: Sample classes, methods, interfaces, and fields
--   - CodeRelationship: Sample call relationships and inheritance
--   - FeatureSlice: Sample feature groupings
--
-- Note: This file is loaded automatically when running integration tests
-- via spring.sql.init.data-locations=classpath:test-seed.sql

-- =============================================================================
-- CODE NODES - Sample code symbols
-- =============================================================================

-- Sample Java classes
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(1, 'UserService', 'CLASS', '/src/main/java/com/example/UserService.java', 10, 'com.example', 'public class UserService', true, false, false, 'Service class for user management'),
(2, 'UserRepository', 'INTERFACE', '/src/main/java/com/example/UserRepository.java', 8, 'com.example', 'public interface UserRepository', true, false, true, 'Repository interface for User entities'),
(3, 'User', 'CLASS', '/src/main/java/com/example/User.java', 12, 'com.example', 'public class User', true, false, false, 'User entity class'),
(4, 'UserController', 'CLASS', '/src/main/java/com/example/UserController.java', 15, 'com.example', 'public class UserController', true, false, false, 'REST controller for user endpoints'),
(5, 'AuthService', 'CLASS', '/src/main/java/com/example/AuthService.java', 20, 'com.example', 'public class AuthService', true, false, false, 'Service for authentication');

-- Methods in UserService
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(10, 'createUser', 'METHOD', '/src/main/java/com/example/UserService.java', 25, 'com.example', 'public User createUser(UserDTO dto)', true, false, false, 'Creates a new user'),
(11, 'findUserById', 'METHOD', '/src/main/java/com/example/UserService.java', 35, 'com.example', 'public Optional<User> findUserById(Long id)', true, false, false, 'Finds user by ID'),
(12, 'updateUser', 'METHOD', '/src/main/java/com/example/UserService.java', 45, 'com.example', 'public User updateUser(Long id, UserDTO dto)', true, false, false, 'Updates existing user'),
(13, 'deleteUser', 'METHOD', '/src/main/java/com/example/UserService.java', 55, 'com.example', 'public void deleteUser(Long id)', true, false, false, 'Deletes a user'),
(14, 'validateUser', 'METHOD', '/src/main/java/com/example/UserService.java', 65, 'com.example', 'private boolean validateUser(UserDTO dto)', false, false, false, 'Validates user data');

-- Methods in UserRepository
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(20, 'findById', 'METHOD', '/src/main/java/com/example/UserRepository.java', 12, 'com.example', 'Optional<User> findById(Long id)', true, false, true, 'Find user by ID'),
(21, 'save', 'METHOD', '/src/main/java/com/example/UserRepository.java', 15, 'com.example', 'User save(User user)', true, false, true, 'Save user entity'),
(22, 'deleteById', 'METHOD', '/src/main/java/com/example/UserRepository.java', 18, 'com.example', 'void deleteById(Long id)', true, false, true, 'Delete user by ID'),
(23, 'findByEmail', 'METHOD', '/src/main/java/com/example/UserRepository.java', 21, 'com.example', 'Optional<User> findByEmail(String email)', true, false, true, 'Find user by email');

-- Methods in UserController
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(30, 'createUser', 'METHOD', '/src/main/java/com/example/UserController.java', 25, 'com.example', 'public ResponseEntity<User> createUser(@RequestBody UserDTO dto)', true, false, false, 'REST endpoint to create user'),
(31, 'getUser', 'METHOD', '/src/main/java/com/example/UserController.java', 35, 'com.example', 'public ResponseEntity<User> getUser(@PathVariable Long id)', true, false, false, 'REST endpoint to get user'),
(32, 'updateUser', 'METHOD', '/src/main/java/com/example/UserController.java', 45, 'com.example', 'public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDTO dto)', true, false, false, 'REST endpoint to update user'),
(33, 'deleteUser', 'METHOD', '/src/main/java/com/example/UserController.java', 55, 'com.example', 'public ResponseEntity<Void> deleteUser(@PathVariable Long id)', true, false, false, 'REST endpoint to delete user');

-- Methods in AuthService
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(40, 'authenticate', 'METHOD', '/src/main/java/com/example/AuthService.java', 30, 'com.example', 'public AuthToken authenticate(String username, String password)', true, false, false, 'Authenticates user credentials'),
(41, 'validateToken', 'METHOD', '/src/main/java/com/example/AuthService.java', 40, 'com.example', 'public boolean validateToken(String token)', true, false, false, 'Validates authentication token');

-- Fields in User class
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract, documentation) VALUES
(50, 'id', 'FIELD', '/src/main/java/com/example/User.java', 15, 'com.example', 'private Long id', false, false, false, 'User ID'),
(51, 'email', 'FIELD', '/src/main/java/com/example/User.java', 18, 'com.example', 'private String email', false, false, false, 'User email'),
(52, 'name', 'FIELD', '/src/main/java/com/example/User.java', 21, 'com.example', 'private String name', false, false, false, 'User name'),
(53, 'createdDate', 'FIELD', '/src/main/java/com/example/User.java', 24, 'com.example', 'private LocalDateTime createdDate', false, false, false, 'Creation timestamp');

-- =============================================================================
-- CODE RELATIONSHIPS - Sample relationships between code symbols
-- =============================================================================

-- UserController calls UserService methods
INSERT INTO code_relationships (id, source_id, target_id, relationship_type, line_number, metadata) VALUES
(1, 30, 10, 'CALLS', 27, 'UserController.createUser calls UserService.createUser'),
(2, 31, 11, 'CALLS', 37, 'UserController.getUser calls UserService.findUserById'),
(3, 32, 12, 'CALLS', 47, 'UserController.updateUser calls UserService.updateUser'),
(4, 33, 13, 'CALLS', 57, 'UserController.deleteUser calls UserService.deleteUser');

-- UserService calls UserRepository methods
INSERT INTO code_relationships (id, source_id, target_id, relationship_type, line_number, metadata) VALUES
(5, 10, 21, 'CALLS', 28, 'UserService.createUser calls UserRepository.save'),
(6, 11, 20, 'CALLS', 37, 'UserService.findUserById calls UserRepository.findById'),
(7, 12, 20, 'CALLS', 47, 'UserService.updateUser calls UserRepository.findById'),
(8, 12, 21, 'CALLS', 50, 'UserService.updateUser calls UserRepository.save'),
(9, 13, 22, 'CALLS', 57, 'UserService.deleteUser calls UserRepository.deleteById');

-- UserService internal calls
INSERT INTO code_relationships (id, source_id, target_id, relationship_type, line_number, metadata) VALUES
(10, 10, 14, 'CALLS', 26, 'UserService.createUser calls UserService.validateUser'),
(11, 12, 14, 'CALLS', 46, 'UserService.updateUser calls UserService.validateUser');

-- UserService calls AuthService
INSERT INTO code_relationships (id, source_id, target_id, relationship_type, line_number, metadata) VALUES
(12, 10, 40, 'CALLS', 29, 'UserService.createUser calls AuthService.authenticate');

-- REST endpoint mappings
INSERT INTO code_relationships (id, source_id, target_id, relationship_type, metadata) VALUES
(20, 30, 4, 'MAPS_TO_URL', 'POST /api/users'),
(21, 31, 4, 'MAPS_TO_URL', 'GET /api/users/{id}'),
(22, 32, 4, 'MAPS_TO_URL', 'PUT /api/users/{id}'),
(23, 33, 4, 'MAPS_TO_URL', 'DELETE /api/users/{id}');

-- =============================================================================
-- FEATURE SLICES - Sample feature groupings
-- =============================================================================

-- Note: FeatureSlice uses @PrePersist for timestamps, but when inserting via SQL we need to provide them
-- The many-to-many relationship with CodeNodes is managed through feature_slice_nodes table

INSERT INTO feature_slices (id, name, description, created_date, updated_date) VALUES
(1, 'User Management', 'Complete user CRUD operations and authentication', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Authentication', 'User authentication and authorization', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'REST API', 'All REST endpoints', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Associate nodes with feature slices
-- Note: This table is created by Hibernate for the @ManyToMany relationship
INSERT INTO feature_slice_nodes (slice_id, node_id) VALUES
-- User Management slice contains UserService, UserController, User entity
(1, 1),  -- UserService
(1, 3),  -- User
(1, 4),  -- UserController
(1, 10), -- createUser method
(1, 11), -- findUserById method
(1, 12), -- updateUser method
(1, 13), -- deleteUser method
(1, 30), -- UserController.createUser
(1, 31), -- UserController.getUser
(1, 32), -- UserController.updateUser
(1, 33), -- UserController.deleteUser

-- Authentication slice contains AuthService
(2, 5),  -- AuthService
(2, 40), -- authenticate method
(2, 41), -- validateToken method

-- REST API slice contains all controller methods
(3, 4),  -- UserController
(3, 30), -- createUser endpoint
(3, 31), -- getUser endpoint
(3, 32), -- updateUser endpoint
(3, 33); -- deleteUser endpoint

-- =============================================================================
-- Additional test data for edge cases
-- =============================================================================

-- JavaScript/TypeScript nodes for cross-language testing
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract) VALUES
(100, 'UserComponent', 'CLASS', '/src/components/UserComponent.ts', 5, 'components', 'export class UserComponent', true, false, false),
(101, 'fetchUser', 'METHOD', '/src/components/UserComponent.ts', 15, 'components', 'async fetchUser(id: number): Promise<User>', true, false, false),
(102, 'saveUser', 'METHOD', '/src/components/UserComponent.ts', 25, 'components', 'async saveUser(user: User): Promise<void>', true, false, false);

-- Utility class with static methods
INSERT INTO code_nodes (id, name, node_type, file_path, line_number, package_name, signature, is_public, is_static, is_abstract) VALUES
(110, 'StringUtils', 'CLASS', '/src/util/StringUtils.java', 8, 'com.example.util', 'public class StringUtils', true, false, false),
(111, 'isEmpty', 'METHOD', '/src/util/StringUtils.java', 12, 'com.example.util', 'public static boolean isEmpty(String str)', true, true, false),
(112, 'capitalize', 'METHOD', '/src/util/StringUtils.java', 18, 'com.example.util', 'public static String capitalize(String str)', true, true, false);

-- =============================================================================
-- End of test seed data
-- =============================================================================
