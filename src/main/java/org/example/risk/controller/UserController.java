package org.example.risk.controller;

import org.example.risk.dto.UserMeResponse;
import org.example.risk.security.UserPrincipal;
import org.example.risk.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    public UserMeResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.getMe(principal.getUserId());
    }
}
