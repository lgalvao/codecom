package com.codecom.integration;

import com.codecom.dto.StateMachineInfo;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for StateMachineController
 * Tests the full stack: Controller -> Service
 * 
 * FR.32: State Machine Detection
 * 
 * Tests the state machine API endpoints:
 * - GET /api/state-machines - Extract state machines from file
 * - Enum-based state machine detection
 * - Transition analysis
 * - Error handling for non-enum files
 */
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StateMachineControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    void testGetStateMachines_EnumBasedStateMachine_ReturnsStateMachineInfo() throws IOException {
        // Given: Create a test file with enum-based state machine
        Path tempFile = Files.createTempFile("StateMachineTest", ".java");
        String javaContent = """
            public class OrderProcessor {
                enum OrderState {
                    PENDING,
                    PROCESSING,
                    SHIPPED,
                    DELIVERED,
                    CANCELLED
                }
                
                private OrderState currentState = OrderState.PENDING;
                
                public void processOrder() {
                    switch (currentState) {
                        case PENDING:
                            currentState = OrderState.PROCESSING;
                            break;
                        case PROCESSING:
                            currentState = OrderState.SHIPPED;
                            break;
                    }
                }
                
                public void cancelOrder() {
                    currentState = OrderState.CANCELLED;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // When: Request state machines extraction
            ResponseEntity<List<StateMachineInfo>> response = restTemplate.exchange(
                apiUrl("/api/state-machines?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StateMachineInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<StateMachineInfo> stateMachines = response.getBody();
            
            assertEquals(1, stateMachines.size(), "Should find one state machine");
            
            StateMachineInfo sm = stateMachines.get(0);
            assertEquals("currentState", sm.variableName());
            assertEquals("OrderState", sm.variableType());
            assertEquals(5, sm.states().size(), "Should have 5 states");
            
            // Verify states
            assertTrue(sm.states().stream().anyMatch(s -> s.label().equals("PENDING")));
            assertTrue(sm.states().stream().anyMatch(s -> s.label().equals("PROCESSING")));
            assertTrue(sm.states().stream().anyMatch(s -> s.label().equals("SHIPPED")));
            assertTrue(sm.states().stream().anyMatch(s -> s.label().equals("DELIVERED")));
            assertTrue(sm.states().stream().anyMatch(s -> s.label().equals("CANCELLED")));
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetStateMachines_DetectsTransitions() throws IOException {
        // Given: Create a test file with state transitions
        Path tempFile = Files.createTempFile("TransitionTest", ".java");
        String javaContent = """
            public class ConnectionManager {
                enum ConnectionState {
                    DISCONNECTED,
                    CONNECTING,
                    CONNECTED
                }
                
                private ConnectionState state = ConnectionState.DISCONNECTED;
                
                public void connect() {
                    state = ConnectionState.CONNECTING;
                    // ... connection logic
                    state = ConnectionState.CONNECTED;
                }
                
                public void disconnect() {
                    state = ConnectionState.DISCONNECTED;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // When: Request state machines extraction
            ResponseEntity<List<StateMachineInfo>> response = restTemplate.exchange(
                apiUrl("/api/state-machines?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StateMachineInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<StateMachineInfo> stateMachines = response.getBody();
            
            assertEquals(1, stateMachines.size());
            StateMachineInfo sm = stateMachines.get(0);
            
            // Verify transitions were detected
            assertNotNull(sm.transitions());
            assertTrue(sm.transitions().size() >= 3, "Should detect at least 3 transitions");
            
            // Verify transition details
            assertTrue(sm.transitions().stream()
                .anyMatch(t -> t.to().equals("CONNECTING")),
                "Should have transition to CONNECTING");
            assertTrue(sm.transitions().stream()
                .anyMatch(t -> t.to().equals("CONNECTED")),
                "Should have transition to CONNECTED");
            assertTrue(sm.transitions().stream()
                .anyMatch(t -> t.to().equals("DISCONNECTED")),
                "Should have transition to DISCONNECTED");
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetStateMachines_MultipleStateMachines_ReturnsAll() throws IOException {
        // Given: Create a test file with multiple state machines
        Path tempFile = Files.createTempFile("MultiStateMachine", ".java");
        String javaContent = """
            public class GameEngine {
                enum GameState {
                    MENU,
                    PLAYING,
                    PAUSED,
                    GAME_OVER
                }
                
                enum PlayerState {
                    IDLE,
                    RUNNING,
                    JUMPING
                }
                
                private GameState gameState = GameState.MENU;
                private PlayerState playerState = PlayerState.IDLE;
                
                public void startGame() {
                    gameState = GameState.PLAYING;
                }
                
                public void playerJump() {
                    playerState = PlayerState.JUMPING;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // When: Request state machines extraction
            ResponseEntity<List<StateMachineInfo>> response = restTemplate.exchange(
                apiUrl("/api/state-machines?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StateMachineInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<StateMachineInfo> stateMachines = response.getBody();
            
            assertEquals(2, stateMachines.size(), "Should find two state machines");
            
            // Verify both state machines are present
            assertTrue(stateMachines.stream().anyMatch(sm -> 
                sm.variableName().equals("gameState") && sm.variableType().equals("GameState")));
            assertTrue(stateMachines.stream().anyMatch(sm -> 
                sm.variableName().equals("playerState") && sm.variableType().equals("PlayerState")));
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }

    @Test
    void testGetStateMachines_NonEnumFile_ReturnsEmptyList() throws IOException {
        // Given: Create a test file without state machines
        Path tempFile = Files.createTempFile("NoStateMachine", ".java");
        String javaContent = """
            public class Calculator {
                private int result = 0;
                
                public int add(int a, int b) {
                    return a + b;
                }
                
                public int subtract(int a, int b) {
                    return a - b;
                }
            }
            """;
        Files.writeString(tempFile, javaContent);
        
        try {
            // When: Request state machines extraction
            ResponseEntity<List<StateMachineInfo>> response = restTemplate.exchange(
                apiUrl("/api/state-machines?path=" + tempFile.toAbsolutePath()),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<StateMachineInfo>>() {}
            );

            // Then
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            List<StateMachineInfo> stateMachines = response.getBody();
            
            assertEquals(0, stateMachines.size(), "Should find no state machines");
            
        } finally {
            // Cleanup
            Files.deleteIfExists(tempFile);
        }
    }
}
