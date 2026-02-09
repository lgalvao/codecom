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
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;

/**
 * Service for building and querying the code knowledge graph
 * FR.38: Relationship Graph Database
 * FR.39: Cross-Language Query Support
 */
@Service
public class KnowledgeGraphService {
    
    private static final Logger LOGGER = Logger.getLogger(KnowledgeGraphService.class.getName());
    
    private static final String TYPE_METHOD = "METHOD";
    private static final String TYPE_CLASS = "CLASS";
    private static final String TYPE_INTERFACE = "INTERFACE";
    
    private static final String REL_CALLS = "CALLS";
    private static final String REL_INHERITS = "INHERITS";

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
                        LOGGER.log(Level.SEVERE, "Error indexing file {0}: {1}", new Object[]{path, e.getMessage()});
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
                        LOGGER.log(Level.SEVERE, "Error indexing relationships in {0}: {1}", new Object[]{path, e.getMessage()});
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
        java.util.Optional<CompilationUnit> cuOpt = result.getResult();
        
        if (!result.isSuccessful() || cuOpt.isEmpty()) {
            return;
        }
        
        CompilationUnit cu = cuOpt.get();
        String packageName = cu.getPackageDeclaration()
            .map(pd -> pd.getNameAsString())
            .orElse("");
        
        // Index classes and interfaces
        cu.accept(new VoidVisitorAdapter<Void>() {
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                CodeNode node = new CodeNode(
                    n.getNameAsString(),
                    n.isInterface() ? TYPE_INTERFACE : TYPE_CLASS,
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
                    TYPE_METHOD,
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
        java.util.Optional<CompilationUnit> cuOpt = result.getResult();
        
        if (!result.isSuccessful() || cuOpt.isEmpty()) {
            return;
        }
        
        CompilationUnit cu = cuOpt.get();
        String packageName = cu.getPackageDeclaration()
            .map(pd -> pd.getNameAsString())
            .orElse("");
        
        // Index inheritance and implementation relationships
        cu.accept(new VoidVisitorAdapter<Void>() {
            
            private CodeNode currentMethod = null;
            
            @Override
            public void visit(ClassOrInterfaceDeclaration n, Void arg) {
                String classKey = packageName + "." + n.getNameAsString();
                final CodeNode currentClassNode = nodeCache.get(classKey);
                
                if (currentClassNode != null) {
                    // Index INHERITS relationships
                    n.getExtendedTypes().forEach(extType -> 
                        createInheritanceRelationship(currentClassNode, extType.getNameAsString(), nodeCache)
                    );
                    
                    n.getImplementedTypes().forEach(implType -> 
                        createInheritanceRelationship(currentClassNode, implType.getNameAsString(), nodeCache)
                    );
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
                            entry.getValue().getNodeType().equals(TYPE_METHOD)) {
                            
                            CodeRelationship relationship = new CodeRelationship(
                                currentMethod.getId(),
                                entry.getValue().getId(),
                                REL_CALLS
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
                (entry.getValue().getNodeType().equals(TYPE_CLASS) || 
                 entry.getValue().getNodeType().equals(TYPE_INTERFACE))) {
                
                CodeRelationship relationship = new CodeRelationship(
                    source.getId(),
                    entry.getValue().getId(),
                    REL_INHERITS
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
        return relationshipRepository
            .findBySourceIdAndRelationshipType(nodeId, REL_CALLS)
            .stream()
            .map(r -> nodeRepository.findById(r.getTargetId()))
            .flatMap(Optional::stream)
            .toList();
    }
    
    /**
     * Find all nodes that call a given node
     */
    public List<CodeNode> findCallers(Long nodeId) {
        return relationshipRepository
            .findByTargetIdAndRelationshipType(nodeId, REL_CALLS)
            .stream()
            .map(r -> nodeRepository.findById(r.getSourceId()))
            .flatMap(Optional::stream)
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
        return relationshipRepository
            .findBySourceIdAndRelationshipType(nodeId, REL_INHERITS)
            .stream()
            .map(r -> nodeRepository.findById(r.getTargetId()))
            .flatMap(Optional::stream)
            .toList();
    }
    
    /**
     * Find all classes that inherit from a given class
     * FR.38: Relationship Graph Database
     */
    public List<CodeNode> findSubclasses(Long nodeId) {
        return relationshipRepository
            .findByTargetIdAndRelationshipType(nodeId, REL_INHERITS)
            .stream()
            .map(r -> nodeRepository.findById(r.getSourceId()))
            .flatMap(Optional::stream)
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
            if (currentPath == null || currentPath.size() > maxDepth) {
                continue;
            }

            Long currentNode = currentPath.get(currentPath.size() - 1);
            if (currentNode.equals(targetId)) {
                chains.add(new ArrayList<>(currentPath));
            } else if (!visited.contains(currentNode)) {
                visited.add(currentNode);
                exploreNode(currentNode, currentPath, queue);
            }
        }
        
        return chains;
    }

    private void exploreNode(Long currentNode, List<Long> currentPath, Queue<List<Long>> queue) {
        List<CodeRelationship> callRels = relationshipRepository
            .findBySourceIdAndRelationshipType(currentNode, REL_CALLS);
        
        for (CodeRelationship rel : callRels) {
            if (!currentPath.contains(rel.getTargetId())) {
                List<Long> newPath = new ArrayList<>(currentPath);
                newPath.add(rel.getTargetId());
                queue.add(newPath);
            }
        }
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
        Map<String, String> queryParams = parseQuery(query);
        
        if (queryParams.containsKey("calls")) {
            return findByRelation(queryParams.get("calls"), this::findCallers);
        } else if (queryParams.containsKey("inherits")) {
            return findByRelation(queryParams.get("inherits"), this::findSubclasses);
        } else if (queryParams.containsKey("type")) {
            return findByTypeAndCriteria(queryParams);
        } else if (queryParams.containsKey("name")) {
            return nodeRepository.searchByName(queryParams.get("name"));
        }
        
        return new ArrayList<>();
    }

    private Map<String, String> parseQuery(String query) {
        Map<String, String> queryParams = new HashMap<>();
        String[] parts = query.split(" ");
        for (String part : parts) {
            String[] kv = part.split(":", 2);
            if (kv.length == 2) {
                queryParams.put(kv[0].toLowerCase(), kv[1]);
            }
        }
        return queryParams;
    }

    private List<CodeNode> findByRelation(String name, java.util.function.LongFunction<List<CodeNode>> relationFunc) {
        List<CodeNode> results = new ArrayList<>();
        List<CodeNode> nodes = nodeRepository.searchByName(name);
        for (CodeNode node : nodes) {
            results.addAll(relationFunc.apply(node.getId()));
        }
        return results;
    }

    private List<CodeNode> findByTypeAndCriteria(Map<String, String> params) {
        List<CodeNode> results = nodeRepository.findByNodeType(params.get("type").toUpperCase());
        
        if (params.containsKey("public") && "true".equals(params.get("public"))) {
            results = results.stream()
                .filter(n -> Boolean.TRUE.equals(n.getIsPublic()))
                .toList();
        }
        if (params.containsKey("package")) {
            String pkg = params.get("package");
            results = results.stream()
                .filter(n -> pkg.equals(n.getPackageName()))
                .toList();
        }
        return results;
    }
}
