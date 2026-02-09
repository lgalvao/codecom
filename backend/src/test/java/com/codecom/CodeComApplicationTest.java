package com.codecom;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Integration test for CodeComApplication
 * Ensures the Spring application context loads successfully
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class CodeComApplicationTest {

    @Test
    void contextLoads() {
        // This test ensures that the Spring application context loads successfully
        // If the context fails to load, the test will fail
    }
}
