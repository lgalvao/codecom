package com.codecom.integration;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.client.RestTemplate;

/**
 * Base class for integration tests
 * 
 * Provides:
 * - Spring Boot context with random port
 * - RestTemplate for REST API testing
 * - H2 in-memory database with test configuration
 * - Test seed data automatically loaded
 * 
 * Usage: Extend this class in integration test classes
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
public abstract class BaseIntegrationTest {

    @LocalServerPort
    protected int port;

    protected RestTemplate restTemplate;

    protected String baseUrl;

    @BeforeEach
    void setUpBase() {
        baseUrl = "http://localhost:" + port;
        restTemplate = new RestTemplate();
    }

    /**
     * Helper method to build API endpoint URLs
     */
    protected String apiUrl(String path) {
        return baseUrl + path;
    }
}
