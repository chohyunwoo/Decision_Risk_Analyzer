package org.example.risk.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.example.risk.domain.Region;

public class RiskAnalyzeRequest {
    @NotNull
    private Region region;

    @NotNull
    @Min(0)
    private Double priceTotal;

    @NotNull
    @Min(1)
    private Integer people;

    @NotNull
    @Min(0)
    private Integer timeMinutes;

    private String menu;
    private String link;
    private ClientContext clientContext;

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public Double getPriceTotal() {
        return priceTotal;
    }

    public void setPriceTotal(Double priceTotal) {
        this.priceTotal = priceTotal;
    }

    public Integer getPeople() {
        return people;
    }

    public void setPeople(Integer people) {
        this.people = people;
    }

    public Integer getTimeMinutes() {
        return timeMinutes;
    }

    public void setTimeMinutes(Integer timeMinutes) {
        this.timeMinutes = timeMinutes;
    }

    public String getMenu() {
        return menu;
    }

    public void setMenu(String menu) {
        this.menu = menu;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public ClientContext getClientContext() {
        return clientContext;
    }

    public void setClientContext(ClientContext clientContext) {
        this.clientContext = clientContext;
    }

    public static class ClientContext {
        private String currency;
        private String locale;
        private String clientTime;

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getLocale() {
            return locale;
        }

        public void setLocale(String locale) {
            this.locale = locale;
        }

        public String getClientTime() {
            return clientTime;
        }

        public void setClientTime(String clientTime) {
            this.clientTime = clientTime;
        }
    }
}
