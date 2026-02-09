package org.example.risk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.example.risk.domain.RiskRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenAiExplanationService implements AiExplanationService {
    private static final String ENDPOINT = "https://api.openai.com/v1/chat/completions";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String apiKey;
    private final String model;
    private final int timeoutSeconds;

    public OpenAiExplanationService(
        ObjectMapper objectMapper,
        @Value("${OPENAI_API_KEY:}") String apiKey,
        @Value("${app.openai.model:gpt-4o-mini-2024-07-18}") String model,
        @Value("${app.openai.timeoutSeconds:8}") int timeoutSeconds
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.timeoutSeconds = timeoutSeconds;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    }

    @Override
    public String generateExplanation(RiskRecord record) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        try {
            String requestBody = buildRequest(record);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return null;
            }

            return extractExplanation(response.body());
        } catch (Exception ex) {
            return null;
        }
    }

    private String buildRequest(RiskRecord record) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", model);

        ArrayNode messages = root.putArray("messages");
        ObjectNode system = messages.addObject();
        system.put("role", "system");
        system.put(
            "content",
            "You are an assistant that writes a decision risk analysis report in Korean. " +
                "You MUST NOT change, recompute, or override the given riskScore or riskLabel. " +
                "You only interpret the provided inputs and explain them. " +
                "Output must be valid JSON and match the provided schema exactly."
        );

        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", "Create a concise report for the following decision context:\n" + buildInputJson(record));

        ObjectNode responseFormat = root.putObject("response_format");
        responseFormat.put("type", "json_schema");
        ObjectNode jsonSchema = responseFormat.putObject("json_schema");
        jsonSchema.put("name", "risk_report");
        jsonSchema.put("strict", true);

        ObjectNode schema = jsonSchema.putObject("schema");
        schema.put("type", "object");
        schema.put("additionalProperties", false);
        ArrayNode required = schema.putArray("required");
        required.add("summary");
        required.add("insights");
        required.add("suggestions");

        ObjectNode properties = schema.putObject("properties");
        ObjectNode summary = properties.putObject("summary");
        summary.put("type", "string");
        summary.put("minLength", 1);

        ObjectNode insights = properties.putObject("insights");
        insights.put("type", "array");
        ObjectNode insightsItems = insights.putObject("items");
        insightsItems.put("type", "string");
        insights.put("minItems", 1);
        insights.put("maxItems", 3);

        ObjectNode suggestions = properties.putObject("suggestions");
        suggestions.put("type", "array");
        ObjectNode suggestionsItems = suggestions.putObject("items");
        suggestionsItems.put("type", "string");
        suggestions.put("minItems", 1);
        suggestions.put("maxItems", 3);

        root.put("temperature", 0.2);
        root.put("max_tokens", 400);

        return objectMapper.writeValueAsString(root);
    }

    private String buildInputJson(RiskRecord record) throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("riskScore", record.getRiskScore());
        input.put("riskLabel", record.getRiskLabel() != null ? record.getRiskLabel().name() : null);
        input.put("region", record.getRegion() != null ? record.getRegion().name() : null);
        input.put("priceTotal", record.getPriceTotal());
        input.put("people", record.getPeople());
        input.put("timeMinutes", record.getTimeMinutes());
        if (record.getMenu() != null) {
            input.put("menu", record.getMenu());
        }
        if (record.getLink() != null) {
            input.put("link", record.getLink());
        }
        return objectMapper.writeValueAsString(input);
    }

    private String extractExplanation(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            String content = root.at("/choices/0/message/content").asText(null);
            if (content == null || content.isBlank()) {
                return null;
            }
            JsonNode report = objectMapper.readTree(content);
            String summary = report.path("summary").asText(null);
            if (summary == null || summary.isBlank()) {
                return null;
            }

            List<String> lines = new ArrayList<>();
            lines.add(summary.trim());

            JsonNode insights = report.path("insights");
            if (insights.isArray()) {
                for (JsonNode item : insights) {
                    String text = item.asText(null);
                    if (text != null && !text.isBlank()) {
                        lines.add("- " + text.trim());
                    }
                }
            }

            JsonNode suggestions = report.path("suggestions");
            if (suggestions.isArray()) {
                for (JsonNode item : suggestions) {
                    String text = item.asText(null);
                    if (text != null && !text.isBlank()) {
                        lines.add("- " + text.trim());
                    }
                }
            }

            return String.join("\n", lines);
        } catch (Exception ex) {
            return null;
        }
    }
}
