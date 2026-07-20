package com.aigatewayhub.user.service;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.request.UpdateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);
    //List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    Page<UserResponse> getAllUsers(
            Role role,
            UserStatus status,
            String email,
            String name,
            Pageable pageable);
}