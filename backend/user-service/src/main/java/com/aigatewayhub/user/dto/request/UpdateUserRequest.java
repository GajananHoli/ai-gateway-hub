package com.aigatewayhub.user.dto.request;

import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Status is required")
    private UserStatus status;
}