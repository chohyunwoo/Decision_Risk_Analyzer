package org.example.risk;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;

@RestController
@CrossOrigin(origins = "http://localhost:3001")
public class RiskAnalysisController {
    private final RiskAnalysisService service;

    public RiskAnalysisController(RiskAnalysisService service) {
        this.service = service;
    }

    @PostMapping(
        value = "/analysis",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public RiskAnalysisResponse analyze(@RequestBody RiskAnalysisRequest request) {
        FoodDecisionInput input = new FoodDecisionInput(
            request.getLink(),
            request.getTimeOfDay(),
            request.getPriceRange()
        );
        int score = service.analyze(input);
        return new RiskAnalysisResponse(score);
    }
}
