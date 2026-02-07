package com.codecom.dto;

import java.util.List;

public record FileNode(
    String name,
    String path,
    boolean isDirectory,
    List<FileNode> children
) {}
