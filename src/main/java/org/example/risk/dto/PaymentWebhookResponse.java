package org.example.risk.dto;

public class PaymentWebhookResponse {
    private boolean received;

    public PaymentWebhookResponse() {}

    public PaymentWebhookResponse(boolean received) {
        this.received = received;
    }

    public boolean isReceived() {
        return received;
    }

    public void setReceived(boolean received) {
        this.received = received;
    }
}
