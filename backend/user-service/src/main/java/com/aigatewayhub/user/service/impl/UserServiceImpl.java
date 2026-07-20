package com.aigatewayhub.user.service.impl;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.request.UpdateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.User;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import com.aigatewayhub.user.exception.UserNotFoundException;
import com.aigatewayhub.user.repository.UserRepository;
import com.aigatewayhub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }
/*    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }*/
    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return mapToResponse(user);
    }
    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(id));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());

        User updatedUser = userRepository.save(user);

        return mapToResponse(updatedUser);
    }
    @Override
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(id));

        userRepository.delete(user);
    }
    @Override
    public Page<UserResponse> getAllUsers(
            Role role,
            UserStatus status,
            String email,
            String name,
            Pageable pageable) {

        if (role != null) {
            return userRepository.findByRole(role, pageable)
                    .map(this::mapToResponse);
        }

        if (status != null) {
            return userRepository.findByStatus(status, pageable)
                    .map(this::mapToResponse);
        }

        if (email != null && !email.isBlank()) {
            return userRepository.findByEmailContainingIgnoreCase(email, pageable)
                    .map(this::mapToResponse);
        }

        if (name != null && !name.isBlank()) {
            return userRepository
                    .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                            name,
                            name,
                            pageable)
                    .map(this::mapToResponse);
        }

        return userRepository.findAll(pageable)
                .map(this::mapToResponse);
    }
    private UserResponse mapToResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setStatus(user.getStatus().name());

        return response;
    }
}