package com.example.authentication.service;

import com.example.authentication.dto.CreateAccountRequest;
import com.example.authentication.entities.AppUser;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class KeycloakService {

    private final Keycloak keycloak;
    private final AuthenticationService authenticationService;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    /**
     * Register a new user in Keycloak
     */
    public String registerUser(CreateAccountRequest request) {
        try {
            // Create user in MongoDB first
            AppUser appUser = authenticationService.createAccount(request);

            // Create user representation for Keycloak
            UserRepresentation user = new UserRepresentation();
            user.setUsername(request.email());
            user.setEmail(request.email());
            user.setEmailVerified(true);
            user.setEnabled(true);

            // Set credentials
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(request.password());
            credential.setTemporary(false);
            user.setCredentials(Collections.singletonList(credential));

            // Set attributes
            Map<String, List<String>> attributes = new HashMap<>();
            attributes.put("userId", Collections.singletonList(appUser.getId()));
            attributes.put("phoneNumber", Collections.singletonList(request.phoneNumber()));
            attributes.put("userType", Collections.singletonList(request.userType().toString()));
            if (request.userType() == AppUser.UserType.DRIVER) {
                attributes.put("licenseNumber", Collections.singletonList(request.licenseNumber()));
                attributes.put("vehicleNumber", Collections.singletonList(request.vehicleNumber()));
                attributes.put("vehiclePlate", Collections.singletonList(request.vehiclePlate()));
            }
            user.setAttributes(attributes);

            // Create user in Keycloak
            var response = keycloak.realm(realm).users().create(user);
            
            if (response.getStatus() == 201) {
                // Extract user ID from Location header more reliably
                String locationPath = response.getLocation().getPath();
                String[] pathSegments = locationPath.split("/");
                String userId = pathSegments[pathSegments.length - 1];
                
                // Assign role based on user type
                assignRoleToUser(userId, request.userType().toString());
                
                return appUser.getId();
            } else {
                throw new RuntimeException("Failed to create user in Keycloak");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error registering user: " + e.getMessage(), e);
        }
    }

    /**
     * Assign role to user in Keycloak
     */
    private void assignRoleToUser(String keycloakUserId, String roleName) {
        try {
            RoleRepresentation role = keycloak.realm(realm)
                    .roles()
                    .get(roleName)
                    .toRepresentation();

            keycloak.realm(realm)
                    .users()
                    .get(keycloakUserId)
                    .roles()
                    .realmLevel()
                    .add(Collections.singletonList(role));
        } catch (Exception e) {
            throw new RuntimeException("Error assigning role: " + e.getMessage(), e);
        }
    }

    /**
     * Get JWT token from Keycloak
     */
    public Map<String, Object> getToken(String username, String password) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = serverUrl + "/realms/" + realm + "/protocol/openid-connect/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "password");
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("username", username);
            body.add("password", password);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = new HashMap<>(response.getBody());
                
                // Try to get user info from MongoDB (optional - user might not exist in MongoDB yet)
                try {
                    AppUser user = authenticationService.getUserByEmail(username);
                    result.put("user", user);
                } catch (Exception e) {
                    // User doesn't exist in MongoDB yet, but Keycloak authentication succeeded
                    // This is fine for test users imported from realm-export.json
                    result.put("user", null);
                }
                
                result.put("status", "success");
                return result;
            } else {
                throw new RuntimeException("Failed to authenticate");
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // This catches 401 errors from Keycloak
            throw new RuntimeException("Invalid credentials or Keycloak authentication failed: " + e.getMessage(), e);
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // This catches connection errors to Keycloak
            throw new RuntimeException("Cannot connect to Keycloak server at " + serverUrl + ". Please ensure Keycloak is running.", e);
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        }
    }
}
