package com.noisync.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DbTestController {

    private final JdbcTemplate jdbcTemplate;

    public DbTestController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/db-test")
    public Map<String, Object> test(Authentication auth) {
        Integer one  = jdbcTemplate.queryForObject("SELECT 1 FROM dual", Integer.class);
        String  user = jdbcTemplate.queryForObject("SELECT USER FROM dual", String.class);
        String  db   = jdbcTemplate.queryForObject(
                "SELECT SYS_CONTEXT('USERENV','DB_NAME') FROM dual", String.class);

        return Map.of(
                "ok",          true,
                "message",     "Conexión a Oracle ADB exitosa",
                "one",         one,
                "dbUser",      user,
                "dbName",      db,
                "calledBy",    "userId=" + auth.getPrincipal()
        );
    }
}
