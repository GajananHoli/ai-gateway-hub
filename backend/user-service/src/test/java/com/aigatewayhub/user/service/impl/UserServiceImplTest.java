package com.aigatewayhub.user.service.impl;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.request.UpdateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.User;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import com.aigatewayhub.user.exception.UserNotFoundException;
import com.aigatewayhub.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void shouldCreateUserSuccessfully() {

        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("Gajanan");
        request.setLastName("Holi");
        request.setEmail("gajanan@example.com");
        request.setPhone("9876543210");
        request.setRole(Role.USER);
        request.setStatus(UserStatus.ACTIVE);
        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(false);

        User savedUser = User.builder()
                .id(1L)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        UserResponse response = userService.createUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("gajanan@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getStatus()).isEqualTo("ACTIVE");

        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository).save(any(User.class));
    }
    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("Gajanan");
        request.setLastName("Holi");
        request.setEmail("gajanan@example.com");
        request.setPhone("9876543210");
        request.setRole(Role.USER);
        request.setStatus(UserStatus.ACTIVE);
        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already exists");

        // Verify
        verify(userRepository).existsByEmail(request.getEmail());

        // save() should never be called
        verify(userRepository, never()).save(any(User.class));
    }
    @Test
    void shouldGetUserByIdSuccessfully() {

        Long userId = 1L;

        User user = User.builder()
                .id(userId)
                .firstName("Gajanan")
                .lastName("Holi")
                .email("gajanan@example.com")
                .phone("9876543210")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(userId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(userId);
        assertThat(response.getFirstName()).isEqualTo("Gajanan");
        assertThat(response.getLastName()).isEqualTo("Holi");
        assertThat(response.getEmail()).isEqualTo("gajanan@example.com");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getStatus()).isEqualTo("ACTIVE");

        verify(userRepository).findById(userId);
    }

    @Test
    void shouldThrowUserNotFoundException() {

        Long userId = 100L;

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(userId))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("User not found with id : "+userId);

        verify(userRepository).findById(userId);
    }

    @Test
    void shouldUpdateUserSuccessfully() {
        Long userId = 1L;

        User existingUser = User.builder()
                .id(userId)
                .firstName("Old")
                .lastName("User")
                .email("old@example.com")
                .phone("1111111111")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Gajanan");
        request.setLastName("Holi");
        request.setEmail("gajanan@example.com");
        request.setPhone("9876543210");
        request.setRole(Role.ADMIN);
        request.setStatus(UserStatus.INACTIVE);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(existingUser));

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));


        UserResponse response = userService.updateUser(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.getFirstName()).isEqualTo("Gajanan");
        assertThat(response.getLastName()).isEqualTo("Holi");
        assertThat(response.getEmail()).isEqualTo("gajanan@example.com");
        assertThat(response.getPhone()).isEqualTo("9876543210");
        assertThat(response.getRole()).isEqualTo("ADMIN");
        assertThat(response.getStatus()).isEqualTo("INACTIVE");

        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
    }
    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingUser() {

        Long userId = 999L;

        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("test@example.com");
        request.setPhone("9999999999");
        request.setRole(Role.USER);
        request.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(userId, request))
                .isInstanceOf(UserNotFoundException.class);

        verify(userRepository).findById(userId);
        verify(userRepository, never()).save(any(User.class));
    }
    @Test
    void shouldDeleteUserSuccessfully() {

        Long userId = 1L;

        User user = User.builder()
                .id(userId)
                .firstName("Gajanan")
                .build();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        userService.deleteUser(userId);

        verify(userRepository).findById(userId);
        verify(userRepository).delete(user);
    }

    @Test
    void shouldReturnAllUsers() {

        Pageable pageable = PageRequest.of(0, 10);

        User user = User.builder()
                .id(1L)
                .firstName("Gajanan")
                .lastName("Holi")
                .email("gajanan@example.com")
                .phone("9876543210")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findAll(pageable))
                .thenReturn(page);

        Page<UserResponse> response =
                userService.getAllUsers(null, null, null, null, pageable);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getEmail())
                .isEqualTo("gajanan@example.com");

        verify(userRepository).findAll(pageable);
    }

    @Test
    void shouldFilterUsersByRole() {

        Pageable pageable = PageRequest.of(0, 10);

        User user = User.builder()
                .id(1L)
                .firstName("Admin")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findByRole(Role.ADMIN, pageable))
                .thenReturn(page);

        Page<UserResponse> response =
                userService.getAllUsers(
                        Role.ADMIN,
                        null,
                        null,
                        null,
                        pageable);

        assertThat(response.getContent()).hasSize(1);

        assertThat(response.getContent().get(0).getRole())
                .isEqualTo("ADMIN");

        verify(userRepository)
                .findByRole(Role.ADMIN, pageable);
    }

    @Test
    void shouldFilterUsersByStatus() {

        Pageable pageable = PageRequest.of(0, 10);

        User user = User.builder()
                .id(1L)
                .status(UserStatus.ACTIVE)
                .role(Role.USER)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findByStatus(UserStatus.ACTIVE, pageable))
                .thenReturn(page);

        Page<UserResponse> response =
                userService.getAllUsers(
                        null,
                        UserStatus.ACTIVE,
                        null,
                        null,
                        pageable);

        assertThat(response.getContent()).hasSize(1);

        verify(userRepository)
                .findByStatus(UserStatus.ACTIVE, pageable);
    }

    @Test
    void shouldSearchUsersByEmail() {

        Pageable pageable = PageRequest.of(0, 10);

        User user = User.builder()
                .email("gajanan@example.com")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findByEmailContainingIgnoreCase(
                "gajanan",
                pageable))
                .thenReturn(page);

        Page<UserResponse> response =
                userService.getAllUsers(
                        null,
                        null,
                        "gajanan",
                        null,
                        pageable);

        assertThat(response.getContent())
                .hasSize(1);

        verify(userRepository)
                .findByEmailContainingIgnoreCase(
                        "gajanan",
                        pageable);
    }

    @Test
    void shouldSearchUsersByName() {

        Pageable pageable = PageRequest.of(0, 10);

        User user = User.builder()
                .firstName("Gajanan")
                .lastName("Holi")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        "Gajanan",
                        "Gajanan",
                        pageable))
                .thenReturn(page);

        Page<UserResponse> response =
                userService.getAllUsers(
                        null,
                        null,
                        null,
                        "Gajanan",
                        pageable);

        assertThat(response.getContent())
                .hasSize(1);

        verify(userRepository)
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        "Gajanan",
                        "Gajanan",
                        pageable);
    }
}