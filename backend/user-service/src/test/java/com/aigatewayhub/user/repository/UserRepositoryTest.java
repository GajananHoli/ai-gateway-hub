package com.aigatewayhub.user.repository;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

import com.aigatewayhub.user.entity.User;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        createUser(
                "Gajanan",
                "Holi",
                "gajanan@example.com",
                Role.USER,
                UserStatus.ACTIVE);

        createUser(
                "John",
                "Smith",
                "john@example.com",
                Role.ADMIN,
                UserStatus.INACTIVE);
    }

    private User createUser(
            String firstName,
            String lastName,
            String email,
            Role role,
            UserStatus status) {

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone("9876543210")
                .role(role)
                .status(status)
                .build();

        return userRepository.save(user);
    }

    @Test
    void shouldReturnTrueWhenEmailExists() {

        assertTrue(
                userRepository.existsByEmail("gajanan@example.com")
        );
    }

    @Test
    void shouldFindUsersByRole() {

        var page =
                userRepository.findByRole(
                        Role.ADMIN,
                        org.springframework.data.domain.PageRequest.of(0,10));

        assertEquals(1, page.getTotalElements());
    }

    @Test
    void shouldFindUsersByStatus() {

        var page =
                userRepository.findByStatus(
                        UserStatus.ACTIVE,
                        org.springframework.data.domain.PageRequest.of(0,10));

        assertEquals(1, page.getTotalElements());
    }

    @Test
    void shouldFindUsersByEmailContaining() {

        var page =
                userRepository.findByEmailContainingIgnoreCase(
                        "gajanan",
                        org.springframework.data.domain.PageRequest.of(0,10));

        assertEquals(1, page.getTotalElements());
    }

    @Test
    void shouldFindUsersByName() {

        var page =
                userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        "Gaj",
                        "Gaj",
                        org.springframework.data.domain.PageRequest.of(0,10));

        assertEquals(1, page.getTotalElements());
    }
}
