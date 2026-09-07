package com.aigatewayhub.user.e2e;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@AutoConfigureRestTestClient
@ActiveProfiles("test")
public class UserApiE2ETest {
    @Autowired
    RestTestClient restClient;

    @Container
    static MySQLContainer<?> mysql =
            new MySQLContainer<>("mysql:8.4")
                    .withDatabaseName("testdb")
                    .withUsername("test")
                    .withPassword("test");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {

        registry.add("spring.datasource.url", mysql::getJdbcUrl);

        registry.add("spring.datasource.username", mysql::getUsername);

        registry.add("spring.datasource.password", mysql::getPassword);

        registry.add("spring.datasource.driver-class-name",
                mysql::getDriverClassName);

        registry.add("spring.jpa.hibernate.ddl-auto",
                () -> "create-drop");
    }

    @Test
    void shouldCreateUser() {

        CreateUserRequest request = new CreateUserRequest();

        request.setFirstName("Gajanan");
        request.setLastName("Holi");
        request.setEmail("gajanan@test.com");
        request.setPhone("9876543210");
        request.setRole(Role.USER);
        request.setStatus(UserStatus.ACTIVE);

        restClient.post()
                .uri("/api/v1/users")
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(UserResponse.class)
                .value(response -> {

                    assertNotNull(response);

                    assertEquals("Gajanan", response.getFirstName());

                    assertEquals("USER", response.getRole());
                });
    }
    }

