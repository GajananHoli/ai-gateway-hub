package com.aigatewayhub.user.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI userServiceOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("AI Gateway Hub - User Service")
                        .description("User Management REST APIs")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("Gajanan Holi")
                                .email("gajananholi@gmail.com"))
                        .license(new License()
                                .name("Apache 2.0")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Documentation"));
    }
}