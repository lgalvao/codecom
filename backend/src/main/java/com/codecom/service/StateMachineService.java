package com.codecom.service;

import com.codecom.dto.StateMachineInfo;
import com.codecom.dto.StateNode;
import com.codecom.dto.StateTransition;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.AssignExpr;
import com.github.javaparser.ast.stmt.SwitchEntry;
import com.github.javaparser.ast.stmt.SwitchStmt;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

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

        if (result.isSuccessful()) {
            result.getResult().ifPresent(cu -> {
                // Step 1: Find all enum declarations
                Map<String, EnumInfo> enums = findEnums(cu);

                // Step 2: Find fields with enum types
                Map<String, StateVariableInfo> stateVariables = findStateVariables(cu, enums);

                // Step 3: Find state transitions in methods
                Map<String, List<StateTransition>> transitions = findTransitions(cu, stateVariables);

                // Step 4: Build StateMachineInfo objects
                buildStateMachineInfo(stateVariables, enums, transitions, stateMachines, filePath);
            });
        }

        return stateMachines;
    }

    private Map<String, EnumInfo> findEnums(CompilationUnit cu) {
        Map<String, EnumInfo> enums = new HashMap<>();
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(EnumDeclaration n, Void arg) {
                List<StateNode> states = n.getEntries().stream()
                    .map(entry -> new StateNode(entry.getNameAsString(), entry.getNameAsString(),
                        entry.getRange().map(r -> r.begin.line).orElse(0), "ENUM"))
                    .toList();
                enums.put(n.getNameAsString(), new EnumInfo(n.getNameAsString(), states, 
                    n.getRange().map(r -> r.begin.line).orElse(0)));
                super.visit(n, arg);
            }
        }, null);
        return enums;
    }

    private Map<String, StateVariableInfo> findStateVariables(CompilationUnit cu, Map<String, EnumInfo> enums) {
        Map<String, StateVariableInfo> stateVariables = new HashMap<>();
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(FieldDeclaration n, Void arg) {
                n.getVariables().forEach(v -> {
                    String typeName = v.getType().asString();
                    if (enums.containsKey(typeName)) {
                        stateVariables.put(v.getNameAsString(), new StateVariableInfo(v.getNameAsString(), typeName, 
                            v.getRange().map(r -> r.begin.line).orElse(0)));
                    }
                });
                super.visit(n, arg);
            }
        }, null);
        return stateVariables;
    }

    private Map<String, List<StateTransition>> findTransitions(CompilationUnit cu, Map<String, StateVariableInfo> stateVariables) {
        Map<String, List<StateTransition>> transitions = new HashMap<>();
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(MethodDeclaration method, Void arg) {
                String methodName = method.getNameAsString();
                method.accept(new TransitionVisitor(stateVariables, methodName, transitions), null);
                super.visit(method, arg);
            }
        }, null);
        return transitions;
    }

    private void buildStateMachineInfo(Map<String, StateVariableInfo> stateVariables, Map<String, EnumInfo> enums, 
                                     Map<String, List<StateTransition>> transitions, List<StateMachineInfo> stateMachines, String filePath) {
        for (Map.Entry<String, StateVariableInfo> entry : stateVariables.entrySet()) {
            StateVariableInfo varInfo = entry.getValue();
            EnumInfo enumInfo = enums.get(varInfo.typeName);
            if (enumInfo != null) {
                stateMachines.add(new StateMachineInfo(entry.getKey(), varInfo.typeName, enumInfo.states, 
                    transitions.getOrDefault(entry.getKey(), new ArrayList<>()), filePath, varInfo.line));
            }
        }
    }

    private class TransitionVisitor extends VoidVisitorAdapter<Void> {
        private final Map<String, StateVariableInfo> stateVariables;
        private final String methodName;
        private final Map<String, List<StateTransition>> transitions;

        TransitionVisitor(Map<String, StateVariableInfo> stateVariables, String methodName, Map<String, List<StateTransition>> transitions) {
            this.stateVariables = stateVariables;
            this.methodName = methodName;
            this.transitions = transitions;
        }

        @Override
        public void visit(SwitchStmt switchStmt, Void arg) {
            String selector = switchStmt.getSelector().toString();
            stateVariables.values().stream()
                .filter(v -> selector.contains(v.varName))
                .findFirst()
                .ifPresent(v -> switchStmt.getEntries().forEach(entry -> 
                    extractTransitionsFromSwitchEntry(entry, v, methodName, transitions)));
            super.visit(switchStmt, arg);
        }

        @Override
        public void visit(AssignExpr assign, Void arg) {
            String target = assign.getTarget().toString();
            stateVariables.values().stream()
                .filter(v -> target.contains(v.varName))
                .findFirst()
                .ifPresent(v -> {
                    String toState = extractStateName(assign.getValue().toString());
                    if (toState != null) {
                        int line = assign.getRange().map(r -> r.begin.line).orElse(0);
                        transitions.computeIfAbsent(v.varName, k -> new ArrayList<>())
                            .add(new StateTransition(v.varName + "_" + line, "ANY", toState, methodName, line));
                    }
                });
            super.visit(assign, arg);
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
                        String toState = extractStateName(value);
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

        private String extractStateName(String value) {
            // Handle cases like "State.OPEN" or just "OPEN"
            if (value.contains(".")) {
                String[] parts = value.split("\\.");
                if (parts.length >= 2) {
                    return parts[parts.length - 1];
                }
            }
            return value;
        }
    }

    // Helper classes
    private record EnumInfo(String name, List<StateNode> states, int line) {}
    private record StateVariableInfo(String varName, String typeName, int line) {}
}
