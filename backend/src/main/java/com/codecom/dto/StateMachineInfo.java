package com.codecom.dto;

import java.util.List;

public record StateMachineInfo(
    String variableName,      // state variable name
    String variableType,      // enum type name
    List<StateNode> states,   // all possible states
    List<StateTransition> transitions,  // detected state transitions
    String filePath,
    int declarationLine
) {}
