package com.example.authentication.controller;

import com.example.authentication.dto.CreateAccountRequest;
import com.example.authentication.entities.AppUser;
import com.example.authentication.service.AuthenticationService;
import com.example.authentication.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final KeycloakService keycloakService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody CreateAccountRequest request) {
        try {
            String userId = keycloakService.registerUser(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("status", "success");
            response.put("message", "User registered successfully. Please login to get your token.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> getToken(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String password = payload.get("password");
            
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "error", 
                    "message", "Username and password are required"
                ));
            }
            
            Map<String, Object> tokenResponse = keycloakService.getToken(username, password);
            return ResponseEntity.ok(tokenResponse);
        } catch (RuntimeException e) {
            // Return the actual error message for debugging
            return ResponseEntity.status(401).body(Map.of(
                "status", "error", 
                "message", e.getMessage()
            ));
        }
    }

    // Legacy endpoint for backward compatibility (deprecated)
    @Deprecated
    @PostMapping("/createAccount")
    public ResponseEntity<Map<String, Object>> createAccount(@RequestBody CreateAccountRequest request) {
        AppUser user = authenticationService.createAccount(request);

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("message", "Account created. Please use /api/auth/token to get JWT token from Keycloak");
        response.put("status", "success");

        return ResponseEntity.ok(response);
    }

    // Legacy endpoint for backward compatibility (deprecated)
    @Deprecated
    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");

        boolean success = authenticationService.authenticate(email, password);
        if (success) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Please use /api/auth/token endpoint to get JWT token from Keycloak");
            response.put("status", "deprecated");

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("status", "failure"));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            AppUser user = authenticationService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return authenticationService.getAllUsers();
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            AppUser user = authenticationService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/ban")
    public AppUser banUser(@PathVariable String userId) {
        return authenticationService.banUser(userId);
    }

    @PutMapping("/users/{userId}/unban")
    public AppUser unbanUser(@PathVariable String userId) {
        return authenticationService.unbanUser(userId);
    }

    @PutMapping("/users/{userId}/email")
    public ResponseEntity<?> updateEmail(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        try {
            String newEmail = payload.get("email");
            AppUser updatedUser = authenticationService.updateEmail(userId, newEmail);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/password")
    public ResponseEntity<?> updatePassword(@PathVariable String userId, @RequestBody Map<String, String> payload) {
        try {
            String newPassword = payload.get("password");
            AppUser updatedUser = authenticationService.updatePassword(userId, newPassword);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        }
    }
}
