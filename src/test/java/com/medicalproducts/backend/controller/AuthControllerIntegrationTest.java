package com.medicalproducts.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicalproducts.backend.dto.LoginRequest;
import com.medicalproducts.backend.dto.RegisterRequest;
import com.medicalproducts.backend.entity.Role;
import com.medicalproducts.backend.entity.User;
import com.medicalproducts.backend.repository.UserRepository;
import com.medicalproducts.backend.security.CustomUserDetailsService;
import com.medicalproducts.backend.security.JwtAuthFilter;
import com.medicalproducts.backend.security.JwtUtils;
import com.medicalproducts.backend.security.RateLimitFilter;
import com.medicalproducts.backend.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, JwtUtils.class,
        CustomUserDetailsService.class, RateLimitFilter.class})
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    void register_validRequest_returns201WithToken() throws Exception {
        RegisterRequest request = new RegisterRequest("testuser", "password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("testuser");
        savedUser.setPassword("encoded");
        savedUser.setRole(Role.ROLE_ADMIN);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    void register_duplicateUsername_returns400() throws Exception {
        RegisterRequest request = new RegisterRequest("existing", "password123");
        when(userRepository.existsByUsername("existing")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        LoginRequest login = new LoginRequest("admin", "password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("admin", null));
        User user = new User();
        user.setUsername("admin");
        user.setRole(Role.ROLE_ADMIN);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        LoginRequest login = new LoginRequest("nobody", "wrong");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminEndpoint_noAuth_returns403() throws Exception {
        mockMvc.perform(post("/api/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"test\",\"slug\":\"test\"}"))
                .andExpect(status().isForbidden());
    }
}
