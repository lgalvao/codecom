package com.codecom.controller;

import com.codecom.dto.StateMachineInfo;
import com.codecom.service.StateMachineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/state-machines")
public class StateMachineController {

    private final StateMachineService stateMachineService;

    public StateMachineController(StateMachineService stateMachineService) {
        this.stateMachineService = stateMachineService;
    }

    /**
     * Extract all state machines from a file
     * GET /api/state-machines?path=/path/to/file.java
     */
    @GetMapping
    public ResponseEntity<List<StateMachineInfo>> getStateMachines(@RequestParam String path) {
        try {
            List<StateMachineInfo> stateMachines = stateMachineService.extractStateMachines(path);
            return ResponseEntity.ok(stateMachines);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
