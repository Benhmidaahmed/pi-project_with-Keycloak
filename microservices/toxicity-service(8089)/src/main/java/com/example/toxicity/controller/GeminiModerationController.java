package com.example.toxicity.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

@RestController
@RequestMapping("/api/moderation")
public class GeminiModerationController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<Map<String, Object>> checkText(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        if (text == null || text.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", "Check if the following text contains blasphemy or inappropriate language. " +
                                                "If yes, return \"UNSAFE\". Otherwise return \"SAFE\":\n\n" + text)
                                }
                        )
                }
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl + "?key=" + apiKey,
                    entity,
                    Map.class
            );

            // --- DEBUGGING: print full response ---
            System.out.println("=== Gemini API Response ===");
            System.out.println(response.getBody());
            System.out.println("===========================");

            // --- Parse the answer ---
            Object candidatesObj = response.getBody().get("candidates");
            boolean safe = false;
            if (candidatesObj instanceof java.util.List candidatesList && !candidatesList.isEmpty()) {
                Object contentObj = ((Map) candidatesList.get(0)).get("content");
                if (contentObj instanceof Map contentMap) {
                    Object partsObj = contentMap.get("parts");
                    if (partsObj instanceof java.util.List partsList && !partsList.isEmpty()) {
                        Object part = partsList.get(0);
                        if (part instanceof Map partMap) {
                            String answer = partMap.get("text").toString().trim();
                            safe = answer.equalsIgnoreCase("SAFE");
                        }
                    }
                }
            }

            return ResponseEntity.ok(Map.of("safe", safe));
        } catch (HttpClientErrorException e) {
            System.err.println("HTTP Error from Gemini API: " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getResponseBodyAsString()));
        } catch (Exception e) {
            System.err.println("Exception during Gemini API call: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
