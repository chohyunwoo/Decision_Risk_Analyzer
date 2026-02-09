package org.example.risk.dto;

public class ErrorEnvelope {
    private ErrorResponse error;

    public ErrorEnvelope() {}

    public ErrorEnvelope(ErrorResponse error) {
        this.error = error;
    }

    public ErrorResponse getError() {
        return error;
    }

    public void setError(ErrorResponse error) {
        this.error = error;
    }
}
