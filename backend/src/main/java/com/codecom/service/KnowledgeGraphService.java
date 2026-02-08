package com.codecom.service;

import com.codecom.entity.CodeNode;
import com.codecom.entity.CodeRelationship;
import com.codecom.repository.CodeNodeRepository;
import com.codecom.repository.CodeRelationshipRepository;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

/**
 * Service for building and querying the code knowledge graph
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
@Service
public class KnowledgeGraphService {
    
    private final CodeNodeRepository nodeRepository;
    private final CodeRelationshipRepository relationshipRepository;
    private final JavaParser javaParser = new JavaParser();
    
    public KnowledgeGraphService(CodeNodeRepository nodeRepository, 
                                CodeRelationshipRepository relationshipRepository) {
        this.nodeRepository = nodeRepository;
        this.relationshipRepository = relationshipRepository;
    }
    
    /**
     * Index the entire project and build the knowledge graph
     * @param rootPath The root directory to index
     */
    @Transactional
    public void indexProject(String rootPath) throws IOException {
        // Clear existing graph
        relationshipRepository.deleteAll();
        nodeRepository.deleteAll();
        
        // First pass: Create all nodes
        Map<String, CodeNode> nodeCache = new HashMap<>();
        
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        indexFile(path.toString(), nodeCache);
                    } catch (IOException e) {
                        System.err.println("Error indexing file " + path + ": " + e.getMessage());
                    }
                });
        }
        
        // Second pass: Create relationships
        try (Stream<Path> paths = Files.walk(Path.of(rootPath))) {
            paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> !p.toString().contains("node_modules"))
                .filter(p -> !p.toString().contains("target"))
                .filter(p -> !p.toString().contains(".git"))
                .forEach(path -> {
                    try {
                        indexRelationships(path.toString(), nodeCache);
                    } catch (IOException e) {
                        System.err.println("Error indexing relationships in " + path + ": " + e.getMessage());
                    }
                });
        }
    }
    
    /**
     * Index a single file and create nodes
     */
    private void indexFile(String filePath, Map<String, CodeNode> nodeCache) throws IOException {
        String content = Files.readString(Path.of(filePath));
        ParseResult<CompilationUnit> result = javaParser.parse(content);
        
        if (!result.isSuccessful() || result.getResult().isEmpty()) {
            return;
        }
        
        CompilationUnit cu = result.getResult().get();
        String packageName = cu.getPackageDeclaration()
            .map(pd -> pd.getNameAsString())
            .orElse("");
        
        // Index classes and interfaces
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                CodeNode node = new CodeNode(
                    n.getNameAsString(),
                    n.isInterface() ? "INTERFACE" : "CLASS",
                    filePath,
                    n.getRange().map(r -> r.begin.line).orElse(0)
                );
                node.setPackageName(packageName);
                node.setIsPublic(n.isPublic());
                node.setIsAbstract(n.isAbstract());
                
                // Extract documentation
                n.getComment().ifPresent(c -> node.setDocumentation(c.getContent()));
                
                CodeNode savedNode = nodeRepository.save(node);
                String key = packageName + "." + n.getNameAsString();
                nodeCache.put(key, savedNode);
                
                super.visit(n, arg);
            }
            
            @Override
            public void visit(MethodDeclaration n, Void arg) {
                CodeNode node = new CodeNode(
                    n.getNameAsString(),
                    "METHOD",
                    filePath,
                    n.getRange().map(r -> r.begin.line).orElse(0)
                );
                node.setPackageName(packageName);
                node.setSignature(n.getDeclarationAsString(false, false, false));
                node.setIsPublic(n.isPublic());
                node.setIsStatic(n.isStatic());
                
                // Extract documentation
                n.getComment().ifPresent(c -> node.setDocumentation(c.getContent()));
                
                CodeNode savedNode = nodeRepository.save(node);
                // Use signature as key for methods to handle overloading
                String key = packageName + "." + n.getNameAsString() + "#" + savedNode.getId();
                nodeCache.put(key, savedNode);
                
                super.visit(n, arg);
            }
        }, null);
    }
    
    /**
     * Index relationships in a file
     */
    private void indexRelationships(String filePath, Map<String, CodeNode> nodeCache) throws IOException {
        String content = Files.readString(Path.of(filePath));
        ParseResult<CompilationUnit> result = javaParser.parse(content);
        
        if (!result.isSuccessful() || result.getResult().isEmpty()) {
            return;
        }
        
        CompilationUnit cu = result.getResult().get();
        String packageName = cu.getPackageDeclaration()
            .map(pd -> pd.getNameAsString())
            .orElse("");
        
        // Index inheritance and implementation relationships
        cu.accept(new VoidVisitorAdapter<Void>() {
            private CodeNode currentClass = null;
            private CodeNode currentMethod = null;
            
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                String classKey = packageName + "." + n.getNameAsString();
                currentClass = nodeCache.get(classKey);
                
                if (currentClass != null) {
                    // Index INHERITS relationships
                    n.getExtendedTypes().forEach(extType -> {
                        createInheritanceRelationship(currentClass, extType.getNameAsString(), nodeCache);
                    });
                    
                    n.getImplementedTypes().forEach(implType -> {
                        createInheritanceRelationship(currentClass, implType.getNameAsString(), nodeCache);
                    });
                }
                
                super.visit(n, arg);
            }
            
            @Override
            public void visit(MethodDeclaration n, Void arg) {
                // Find the method node for this method
                List<CodeNode> methods = nodeRepository.findByFilePath(filePath);
                currentMethod = methods.stream()
                    .filter(m -> m.getName().equals(n.getNameAsString()) && 
                                m.getLineNumber().equals(n.getRange().map(r -> r.begin.line).orElse(0)))
                    .findFirst()
                    .orElse(null);
                
                super.visit(n, arg);
            }
            
            @Override
            public void visit(MethodCallExpr n, Void arg) {
                if (currentMethod != null) {
                    // Index CALLS relationship
                    String methodName = n.getNameAsString();
                    
                    // Try to find the target method in the cache
                    // This is simplified - a full implementation would do type resolution
                    for (Map.Entry<String, CodeNode> entry : nodeCache.entrySet()) {
                        if (entry.getValue().getName().equals(methodName) && 
                            entry.getValue().getNodeType().equals("METHOD")) {
                            
                            CodeRelationship relationship = new CodeRelationship(
                                currentMethod.getId(),
                                entry.getValue().getId(),
                                "CALLS"
                            );
                            relationship.setLineNumber(n.getRange().map(r -> r.begin.line).orElse(0));
                            
                            relationshipRepository.save(relationship);
                            break; // Only create one relationship for simplicity
                        }
                    }
                }
                
                super.visit(n, arg);
            }
        }, null);
    }
    
    private void createInheritanceRelationship(CodeNode source, String targetName, Map<String, CodeNode> nodeCache) {
        // Try to find the target in the cache
        for (Map.Entry<String, CodeNode> entry : nodeCache.entrySet()) {
            if (entry.getValue().getName().equals(targetName) && 
                (entry.getValue().getNodeType().equals("CLASS") || 
                 entry.getValue().getNodeType().equals("INTERFACE"))) {
                
                CodeRelationship relationship = new CodeRelationship(
                    source.getId(),
                    entry.getValue().getId(),
                    "INHERITS"
                );
                
                relationshipRepository.save(relationship);
                break;
            }
        }
    }
    
    /**
     * Get all nodes
     */
    public List<CodeNode> getAllNodes() {
        return nodeRepository.findAll();
    }
    
    /**
     * Get all relationships
     */
    public List<CodeRelationship> getAllRelationships() {
        return relationshipRepository.findAll();
    }
    
    /**
     * Find nodes by name
     */
    public List<CodeNode> findNodesByName(String name) {
        return nodeRepository.searchByName(name);
    }
    
    /**
     * Find all nodes that a given node calls
     */
    public List<CodeNode> findCallees(Long nodeId) {
        List<CodeRelationship> relationships = relationshipRepository
            .findBySourceIdAndRelationshipType(nodeId, "CALLS");
        
        return relationships.stream()
            .map(r -> nodeRepository.findById(r.getTargetId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();
    }
    
    /**
     * Find all nodes that call a given node
     */
    public List<CodeNode> findCallers(Long nodeId) {
        List<CodeRelationship> relationships = relationshipRepository
            .findByTargetIdAndRelationshipType(nodeId, "CALLS");
        
        return relationships.stream()
            .map(r -> nodeRepository.findById(r.getSourceId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();
    }
    
    /**
     * Get a node by ID
     * FR.38: Relationship Graph Database
     */
    public Optional<CodeNode> getNodeById(Long nodeId) {
        return nodeRepository.findById(nodeId);
    }
    
    /**
     * Get all relationships for a specific node (both incoming and outgoing)
     * FR.38: Relationship Graph Database
     */
    public Map<String, List<CodeRelationship>> getNodeRelationships(Long nodeId) {
        Map<String, List<CodeRelationship>> relationships = new HashMap<>();
        relationships.put("outgoing", relationshipRepository.findBySourceId(nodeId));
        relationships.put("incoming", relationshipRepository.findByTargetId(nodeId));
        return relationships;
    }
    
    /**
     * Find inheritance hierarchy for a class
     * FR.38: Relationship Graph Database
     */
    public List<CodeNode> findInheritanceHierarchy(Long nodeId) {
        List<CodeRelationship> relationships = relationshipRepository
            .findBySourceIdAndRelationshipType(nodeId, "INHERITS");
        
        return relationships.stream()
            .map(r -> nodeRepository.findById(r.getTargetId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();
    }
    
    /**
     * Find all classes that inherit from a given class
     * FR.38: Relationship Graph Database
     */
    public List<CodeNode> findSubclasses(Long nodeId) {
        List<CodeRelationship> relationships = relationshipRepository
            .findByTargetIdAndRelationshipType(nodeId, "INHERITS");
        
        return relationships.stream()
            .map(r -> nodeRepository.findById(r.getSourceId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();
    }
    
    /**
     * Find call chain between two nodes (breadth-first search)
     * FR.39: Cross-Language Query Support
     */
    public List<List<Long>> findCallChain(Long sourceId, Long targetId, int maxDepth) {
        final int MAX_CHAINS = 10; // Limit results to prevent excessive memory usage
        List<List<Long>> chains = new ArrayList<>();
        Queue<List<Long>> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();
        
        queue.add(List.of(sourceId));
        
        while (!queue.isEmpty() && chains.size() < MAX_CHAINS) {
            List<Long> currentPath = queue.poll();
            Long currentNode = currentPath.get(currentPath.size() - 1);
            
            if (currentPath.size() > maxDepth) {
                continue;
            }
            
            if (currentNode.equals(targetId)) {
                chains.add(new ArrayList<>(currentPath));
                continue;
            }
            
            if (visited.contains(currentNode)) {
                continue;
            }
            visited.add(currentNode);
            
            // Find all nodes this node calls
            List<CodeRelationship> callRels = relationshipRepository
                .findBySourceIdAndRelationshipType(currentNode, "CALLS");
            
            for (CodeRelationship rel : callRels) {
                if (!currentPath.contains(rel.getTargetId())) {
                    List<Long> newPath = new ArrayList<>(currentPath);
                    newPath.add(rel.getTargetId());
                    queue.add(newPath);
                }
            }
        }
        
        return chains;
    }
    
    /**
     * Execute a cross-language query
     * FR.39: Cross-Language Query Support
     * 
     * Example queries:
     * - "calls:MethodName" - Find all nodes that call MethodName
     * - "inherits:ClassName" - Find all classes that inherit from ClassName
     * - "type:CLASS public:true" - Find all public classes
     */
    public List<CodeNode> executeQuery(String query) {
        List<CodeNode> results = new ArrayList<>();
        
        // Parse simple query format: "key:value key:value"
        String[] parts = query.split(" ");
        Map<String, String> queryParams = new HashMap<>();
        
        for (String part : parts) {
            String[] kv = part.split(":", 2);
            if (kv.length == 2) {
                queryParams.put(kv[0].toLowerCase(), kv[1]);
            }
        }
        
        // Handle different query types
        if (queryParams.containsKey("calls")) {
            String methodName = queryParams.get("calls");
            List<CodeNode> methods = nodeRepository.searchByName(methodName);
            for (CodeNode method : methods) {
                results.addAll(findCallers(method.getId()));
            }
        } else if (queryParams.containsKey("inherits")) {
            String className = queryParams.get("inherits");
            List<CodeNode> classes = nodeRepository.searchByName(className);
            for (CodeNode clazz : classes) {
                results.addAll(findSubclasses(clazz.getId()));
            }
        } else if (queryParams.containsKey("type")) {
            String nodeType = queryParams.get("type").toUpperCase();
            results = nodeRepository.findByNodeType(nodeType);
            
            // Filter by additional criteria
            if (queryParams.containsKey("public") && "true".equals(queryParams.get("public"))) {
                results = results.stream()
                    .filter(n -> Boolean.TRUE.equals(n.getIsPublic()))
                    .toList();
            }
            if (queryParams.containsKey("package")) {
                String packageName = queryParams.get("package");
                results = results.stream()
                    .filter(n -> packageName.equals(n.getPackageName()))
                    .toList();
            }
        } else if (queryParams.containsKey("name")) {
            results = nodeRepository.searchByName(queryParams.get("name"));
        }
        
        return results;
    }
}
