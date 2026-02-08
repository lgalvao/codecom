package com.codecom.service;

import com.codecom.dto.StateMachineInfo;
import com.codecom.dto.StateNode;
import com.codecom.dto.StateTransition;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.EnumConstantDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.VariableDeclarator;
import com.github.javaparser.ast.expr.AssignExpr;
import com.github.javaparser.ast.expr.FieldAccessExpr;
import com.github.javaparser.ast.stmt.SwitchEntry;
import com.github.javaparser.ast.stmt.SwitchStmt;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StateMachineService {

    private final JavaParser javaParser = new JavaParser();

    /**
     * Extract all state machines from a Java file
     */
    public List<StateMachineInfo> extractStateMachines(String filePath) throws IOException {
        String content = Files.readString(Path.of(filePath));
        String extension = getExtension(filePath);

        return switch (extension) {
            case "java" -> extractJavaStateMachines(content, filePath);
            default -> new ArrayList<>();
        };
    }

    private String getExtension(String path) {
        int lastDot = path.lastIndexOf('.');
        return lastDot == -1 ? "" : path.substring(lastDot + 1).toLowerCase();
    }

    private List<StateMachineInfo> extractJavaStateMachines(String content, String filePath) {
        List<StateMachineInfo> stateMachines = new ArrayList<>();
        ParseResult<CompilationUnit> result = javaParser.parse(content);

        if (result.isSuccessful() && result.getResult().isPresent()) {
            CompilationUnit cu = result.getResult().get();
            
            // Step 1: Find all enum declarations
            Map<String, EnumInfo> enums = new HashMap<>();
            cu.accept(new VoidVisitorAdapter<Void>() {
                @Override
                public void visit(EnumDeclaration n, Void arg) {
                    List<StateNode> states = n.getEntries().stream()
                        .map(entry -> {
                            int line = entry.getRange().map(r -> r.begin.line).orElse(0);
                            return new StateNode(
                                entry.getNameAsString(),
                                entry.getNameAsString(),
                                line,
                                "ENUM"
                            );
                        })
                        .collect(Collectors.toList());
                    
                    int declLine = n.getRange().map(r -> r.begin.line).orElse(0);
                    enums.put(n.getNameAsString(), new EnumInfo(n.getNameAsString(), states, declLine));
                    super.visit(n, arg);
                }
            }, null);

            // Step 2: Find fields with enum types
            Map<String, StateVariableInfo> stateVariables = new HashMap<>();
            cu.accept(new VoidVisitorAdapter<Void>() {
                @Override
                public void visit(FieldDeclaration n, Void arg) {
                    n.getVariables().forEach(var -> {
                        String typeName = var.getType().asString();
                        if (enums.containsKey(typeName)) {
                            int line = var.getRange().map(r -> r.begin.line).orElse(0);
                            stateVariables.put(var.getNameAsString(), 
                                new StateVariableInfo(var.getNameAsString(), typeName, line));
                        }
                    });
                    super.visit(n, arg);
                }
            }, null);

            // Step 3: Find state transitions in methods
            Map<String, List<StateTransition>> transitions = new HashMap<>();
            cu.accept(new VoidVisitorAdapter<Void>() {
                @Override
                public void visit(MethodDeclaration method, Void arg) {
                    String methodName = method.getNameAsString();
                    
                    // Find switch statements on state variables
                    method.accept(new VoidVisitorAdapter<Void>() {
                        @Override
                        public void visit(SwitchStmt switchStmt, Void arg2) {
                            String selector = switchStmt.getSelector().toString();
                            
                            // Check if switching on a state variable
                            StateVariableInfo stateVar = null;
                            for (Map.Entry<String, StateVariableInfo> entry : stateVariables.entrySet()) {
                                if (selector.contains(entry.getKey())) {
                                    stateVar = entry.getValue();
                                    break;
                                }
                            }
                            
                            if (stateVar != null) {
                                final StateVariableInfo finalStateVar = stateVar;
                                switchStmt.getEntries().forEach(entry -> {
                                    // Extract transitions from each case
                                    extractTransitionsFromSwitchEntry(
                                        entry, finalStateVar, methodName, transitions
                                    );
                                });
                            }
                            super.visit(switchStmt, arg2);
                        }
                    }, null);
                    
                    // Find direct state assignments
                    method.accept(new VoidVisitorAdapter<Void>() {
                        @Override
                        public void visit(AssignExpr assign, Void arg2) {
                            String target = assign.getTarget().toString();
                            String value = assign.getValue().toString();
                            
                            // Check if assigning to a state variable
                            for (Map.Entry<String, StateVariableInfo> entry : stateVariables.entrySet()) {
                                if (target.contains(entry.getKey())) {
                                    String varName = entry.getKey();
                                    String enumType = entry.getValue().typeName;
                                    
                                    // Extract state from assignment (e.g., State.OPEN -> OPEN)
                                    String toState = extractStateName(value, enumType);
                                    if (toState != null) {
                                        int line = assign.getRange().map(r -> r.begin.line).orElse(0);
                                        StateTransition transition = new StateTransition(
                                            varName + "_" + line,
                                            "ANY", // could be from any state
                                            toState,
                                            methodName,
                                            line
                                        );
                                        transitions.computeIfAbsent(varName, k -> new ArrayList<>()).add(transition);
                                    }
                                }
                            }
                            super.visit(assign, arg2);
                        }
                    }, null);
                    
                    super.visit(method, arg);
                }
            }, null);

            // Step 4: Build StateMachineInfo objects
            for (Map.Entry<String, StateVariableInfo> entry : stateVariables.entrySet()) {
                String varName = entry.getKey();
                StateVariableInfo varInfo = entry.getValue();
                EnumInfo enumInfo = enums.get(varInfo.typeName);
                
                if (enumInfo != null) {
                    List<StateTransition> varTransitions = transitions.getOrDefault(varName, new ArrayList<>());
                    stateMachines.add(new StateMachineInfo(
                        varName,
                        varInfo.typeName,
                        enumInfo.states,
                        varTransitions,
                        filePath,
                        varInfo.line
                    ));
                }
            }
        }

        return stateMachines;
    }

    private void extractTransitionsFromSwitchEntry(
        SwitchEntry entry,
        StateVariableInfo stateVar,
        String methodName,
        Map<String, List<StateTransition>> transitions
    ) {
        // Get the case label
        String fromState = entry.getLabels().stream()
            .map(Object::toString)
            .findFirst()
            .orElse("UNKNOWN");
        
        // Look for assignments in the case body
        entry.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(AssignExpr assign, Void arg) {
                String target = assign.getTarget().toString();
                String value = assign.getValue().toString();
                
                if (target.contains(stateVar.varName)) {
                    String toState = extractStateName(value, stateVar.typeName);
                    if (toState != null) {
                        int line = assign.getRange().map(r -> r.begin.line).orElse(0);
                        StateTransition transition = new StateTransition(
                            stateVar.varName + "_" + line,
                            fromState,
                            toState,
                            methodName + " (switch)",
                            line
                        );
                        transitions.computeIfAbsent(stateVar.varName, k -> new ArrayList<>()).add(transition);
                    }
                }
                super.visit(assign, arg);
            }
        }, null);
    }

    private String extractStateName(String value, String enumType) {
        // Handle cases like "State.OPEN" or just "OPEN"
        if (value.contains(".")) {
            String[] parts = value.split("\\.");
            if (parts.length >= 2) {
                return parts[parts.length - 1];
            }
        }
        return value;
    }

    // Helper classes
    private record EnumInfo(String name, List<StateNode> states, int line) {}
    private record StateVariableInfo(String varName, String typeName, int line) {}
}
