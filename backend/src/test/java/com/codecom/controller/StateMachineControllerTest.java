package com.codecom.controller;

import com.codecom.dto.StateMachineInfo;
import com.codecom.dto.StateNode;
import com.codecom.dto.StateTransition;
import com.codecom.service.StateMachineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StateMachineControllerTest {

    private MockMvc mockMvc;

    @Mock
    private StateMachineService stateMachineService;

    @InjectMocks
    private StateMachineController stateMachineController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(stateMachineController).build();
    }

    @Test
    void testGetStateMachines_Success() throws Exception {
        List<StateNode> states = List.of(
            new StateNode("PENDING", "PENDING", 2, "ENUM"),
            new StateNode("ACTIVE", "ACTIVE", 3, "ENUM")
        );
        
        List<StateTransition> transitions = List.of(
            new StateTransition("t1", "PENDING", "ACTIVE", "activate", 10)
        );
        
        StateMachineInfo machine = new StateMachineInfo(
            "status",
            "Status",
            states,
            transitions,
            "/test/File.java",
            5
        );
        
        when(stateMachineService.extractStateMachines(anyString()))
            .thenReturn(List.of(machine));
        
        mockMvc.perform(get("/api/state-machines")
                .param("path", "/test/File.java"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].variableName").value("status"))
            .andExpect(jsonPath("$[0].variableType").value("Status"))
            .andExpect(jsonPath("$[0].states").isArray())
            .andExpect(jsonPath("$[0].states[0].label").value("PENDING"))
            .andExpect(jsonPath("$[0].transitions").isArray())
            .andExpect(jsonPath("$[0].transitions[0].from").value("PENDING"));
    }

    @Test
    void testGetStateMachines_EmptyResult() throws Exception {
        when(stateMachineService.extractStateMachines(anyString()))
            .thenReturn(new ArrayList<>());
        
        mockMvc.perform(get("/api/state-machines")
                .param("path", "/test/NoStates.java"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testGetStateMachines_ServiceThrowsException() throws Exception {
        when(stateMachineService.extractStateMachines(anyString()))
            .thenThrow(new RuntimeException("File not found"));
        
        mockMvc.perform(get("/api/state-machines")
                .param("path", "/invalid/path.java"))
            .andExpect(status().is5xxServerError());
    }

    @Test
    void testGetStateMachines_MultipleStateMachines() throws Exception {
        StateMachineInfo machine1 = new StateMachineInfo(
            "state1", "State1", List.of(), List.of(), "/test.java", 1
        );
        StateMachineInfo machine2 = new StateMachineInfo(
            "state2", "State2", List.of(), List.of(), "/test.java", 2
        );
        
        when(stateMachineService.extractStateMachines(anyString()))
            .thenReturn(List.of(machine1, machine2));
        
        mockMvc.perform(get("/api/state-machines")
                .param("path", "/test.java"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }
}
