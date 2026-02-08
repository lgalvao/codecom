package com.codecom.service;

import com.codecom.dto.StateMachineInfo;
import com.codecom.dto.StateNode;
import com.codecom.dto.StateTransition;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class StateMachineServiceTest {

    private final StateMachineService service = new StateMachineService();

    @TempDir
    Path tempDir;

    @Test
    void testExtractStateMachines_SimpleEnum() throws IOException {
        String code = """
            public class Order {
                enum OrderState { PENDING, CONFIRMED, SHIPPED, DELIVERED }
                private OrderState state = OrderState.PENDING;
                
                public void confirm() {
                    state = OrderState.CONFIRMED;
                }
            }
            """;
        
        Path file = tempDir.resolve("Order.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        StateMachineInfo machine = machines.get(0);
        assertEquals("state", machine.variableName());
        assertEquals("OrderState", machine.variableType());
        assertEquals(4, machine.states().size());
        assertTrue(machine.transitions().size() > 0);
    }

    @Test
    void testExtractStateMachines_SwitchStatement() throws IOException {
        String code = """
            public class Workflow {
                enum Status { DRAFT, REVIEW, APPROVED, REJECTED }
                private Status status = Status.DRAFT;
                
                public void transition(String action) {
                    switch (status) {
                        case DRAFT:
                            status = Status.REVIEW;
                            break;
                        case REVIEW:
                            status = Status.APPROVED;
                            break;
                    }
                }
            }
            """;
        
        Path file = tempDir.resolve("Workflow.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        StateMachineInfo machine = machines.get(0);
        assertEquals(4, machine.states().size());
        
        // Should detect transitions from switch statement
        List<StateTransition> transitions = machine.transitions();
        assertTrue(transitions.size() >= 2);
    }

    @Test
    void testExtractStateMachines_MultipleVariables() throws IOException {
        String code = """
            public class Process {
                enum State { INIT, RUNNING, STOPPED }
                enum Phase { START, MIDDLE, END }
                
                private State state = State.INIT;
                private Phase phase = Phase.START;
                
                public void start() {
                    state = State.RUNNING;
                    phase = Phase.MIDDLE;
                }
            }
            """;
        
        Path file = tempDir.resolve("Process.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(2, machines.size());
    }

    @Test
    void testExtractStateMachines_NoEnums() throws IOException {
        String code = """
            public class Simple {
                private String value;
                public void setValue(String v) { value = v; }
            }
            """;
        
        Path file = tempDir.resolve("Simple.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(0, machines.size());
    }

    @Test
    void testExtractStateMachines_EnumButNoStateVariable() throws IOException {
        String code = """
            public class Config {
                enum Level { LOW, MEDIUM, HIGH }
                // Enum exists but no field using it
            }
            """;
        
        Path file = tempDir.resolve("Config.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(0, machines.size());
    }

    @Test
    void testExtractStateMachines_StateNodesHaveCorrectInfo() throws IOException {
        String code = """
            public class Light {
                enum LightState { OFF, ON, DIMMED }
                private LightState state = LightState.OFF;
            }
            """;
        
        Path file = tempDir.resolve("Light.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        List<StateNode> states = machines.get(0).states();
        assertEquals(3, states.size());
        
        // Check state nodes
        assertTrue(states.stream().anyMatch(s -> s.label().equals("OFF")));
        assertTrue(states.stream().anyMatch(s -> s.label().equals("ON")));
        assertTrue(states.stream().anyMatch(s -> s.label().equals("DIMMED")));
        assertTrue(states.stream().allMatch(s -> s.sourceType().equals("ENUM")));
    }

    @Test
    void testExtractStateMachines_TransitionsHaveCorrectInfo() throws IOException {
        String code = """
            public class Door {
                enum DoorState { CLOSED, OPEN }
                private DoorState state = DoorState.CLOSED;
                
                public void open() {
                    state = DoorState.OPEN;
                }
                
                public void close() {
                    state = DoorState.CLOSED;
                }
            }
            """;
        
        Path file = tempDir.resolve("Door.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        List<StateTransition> transitions = machines.get(0).transitions();
        
        assertTrue(transitions.size() >= 2);
        assertTrue(transitions.stream().anyMatch(t -> t.trigger().contains("open")));
        assertTrue(transitions.stream().anyMatch(t -> t.trigger().contains("close")));
    }

    @Test
    void testExtractStateMachines_NonJavaFile() throws IOException {
        Path file = tempDir.resolve("test.txt");
        Files.writeString(file, "not java code");
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(0, machines.size());
    }

    @Test
    void testExtractStateMachines_InvalidJavaCode() throws IOException {
        String code = "this is not valid java { } {";
        
        Path file = tempDir.resolve("Invalid.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        // Should handle gracefully and return empty list
        assertNotNull(machines);
    }

    @Test
    void testExtractStateMachines_ComplexSwitchCase() throws IOException {
        String code = """
            public class Vehicle {
                enum VehicleState { PARKED, DRIVING, STOPPED }
                private VehicleState vehicleState = VehicleState.PARKED;
                
                public void handleEvent(String event) {
                    switch (vehicleState) {
                        case PARKED:
                            if (event.equals("start")) {
                                vehicleState = VehicleState.DRIVING;
                            }
                            break;
                        case DRIVING:
                            vehicleState = VehicleState.STOPPED;
                            break;
                        case STOPPED:
                            vehicleState = VehicleState.PARKED;
                            break;
                    }
                }
            }
            """;
        
        Path file = tempDir.resolve("Vehicle.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        StateMachineInfo machine = machines.get(0);
        assertEquals("vehicleState", machine.variableName());
        assertEquals(3, machine.states().size());
        
        // Should detect transitions from all case branches
        List<StateTransition> transitions = machine.transitions();
        assertTrue(transitions.size() >= 3);
    }

    @Test
    void testExtractStateMachines_FilePathIsPreserved() throws IOException {
        String code = """
            public class Test {
                enum State { A, B }
                private State s = State.A;
            }
            """;
        
        Path file = tempDir.resolve("Test.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        assertEquals(file.toString(), machines.get(0).filePath());
    }

    @Test
    void testExtractStateMachines_DeclarationLineIsRecorded() throws IOException {
        String code = """
            public class Sample {
                enum Status { ACTIVE, INACTIVE }
                
                private Status status = Status.ACTIVE;
            }
            """;
        
        Path file = tempDir.resolve("Sample.java");
        Files.writeString(file, code);
        
        List<StateMachineInfo> machines = service.extractStateMachines(file.toString());
        
        assertEquals(1, machines.size());
        assertTrue(machines.get(0).declarationLine() > 0);
    }
}
