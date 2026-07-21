package com.aigatewayhub.user.controller;

import com.aigatewayhub.user.dto.request.CreateUserRequest;
import com.aigatewayhub.user.dto.response.UserResponse;
import com.aigatewayhub.user.entity.enums.Role;
import com.aigatewayhub.user.entity.enums.UserStatus;
import com.aigatewayhub.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    UserService userService;

    @Test
    void shouldCreateUser() throws Exception {

        CreateUserRequest request = new CreateUserRequest();

        request.setFirstName("Gajanan");
        request.setLastName("Holi");
        request.setEmail("gajanan@example.com");
        request.setPhone("9876543210");
        request.setRole(Role.USER);
        request.setStatus(UserStatus.ACTIVE);
        UserResponse response = new UserResponse();

        response.setId(1L);
        response.setFirstName("Gajanan");
        response.setLastName("Holi");
        response.setEmail("gajanan@example.com");
        response.setPhone("9876543210");
        response.setRole("USER");
        response.setStatus("ACTIVE");

        when(userService.createUser(any(CreateUserRequest.class)))
                .thenReturn(response);

        String json = objectMapper.writeValueAsString(request);
/*
        System.out.println("======================================");
        System.out.println("Request JSON:");
        System.out.println(json);
        System.out.println("======================================");*/

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("gajanan@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

}