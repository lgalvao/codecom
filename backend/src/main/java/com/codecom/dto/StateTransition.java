package com.codecom.dto;

public record StateTransition(
    String id,
    String from,
    String to,
    String trigger,      // condition or method that triggers transition
    int line             // line number where transition occurs
) {}
