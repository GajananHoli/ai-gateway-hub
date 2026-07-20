package com.aigatewayhub.user.controller;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.request.UpdateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import com.aigatewayhub.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User API", description = "User Management APIs")
public class UserController {

    private final UserService userService;

    @Operation(
            summary = "Create User",
            description = "Creates a new user"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created"),
            @ApiResponse(responseCode = "400", description = "Validation failed")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid @RequestBody CreateUserRequest request) {
        System.out.println("Inside UserController");
        return userService.createUser(request);
    }

/*    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }
   */
    @GetMapping(params = "id")
    public UserResponse getUserById(@RequestParam Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping
    public Page<UserResponse> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            Pageable pageable) {

        return userService.getAllUsers(
                role,
                status,
                email,
                name,
                pageable);
    }
}