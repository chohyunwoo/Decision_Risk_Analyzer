package org.example.risk.dto;

import java.util.Map;

public class ErrorResponse {
    private String code;
    private String message;
    private Map<String, Object> details;
    private String requestId;

    public ErrorResponse() {}

    public ErrorResponse(String code, String message, Map<String, Object> details, String requestId) {
        this.code = code;
        this.message = message;
        this.details = details;
        this.requestId = requestId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, Object> getDetails() {
        return details;
    }

    public void setDetails(Map<String, Object> details) {
        this.details = details;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}
