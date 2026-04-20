package com.noisync.backend.service;

import com.noisync.backend.domain.AppUser;
import com.noisync.backend.dto.RegisterLeaderRequest;
import com.noisync.backend.dto.RegisterLeaderResponse;
import com.noisync.backend.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegisterLeaderService {

    private static final Logger log = LoggerFactory.getLogger(RegisterLeaderService.class);

    private final EmailVerificationService emailVerificationService;
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final AppUserRepository appUserRepository;

    public RegisterLeaderService(
            JdbcTemplate jdbc,
            PasswordEncoder encoder,
            EmailVerificationService emailVerificationService,
            AppUserRepository appUserRepository) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.emailVerificationService = emailVerificationService;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public RegisterLeaderResponse register(RegisterLeaderRequest req) {
        log.info(">> INICIO register para username={}", req.username());

        if (!req.password().equals(req.confirmPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }

        PasswordPolicy.validateOrThrow(req.password());
        log.info(">> Validaciones OK");

        Integer usernameCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM app_user WHERE LOWER(username) = LOWER(?)",
                Integer.class, req.username());
        if (usernameCount != null && usernameCount > 0) {
            throw new IllegalArgumentException("Ese username ya está registrado");
        }

        Integer correoCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM app_user WHERE LOWER(email) = LOWER(?)",
                Integer.class, req.correo());
        if (correoCount != null && correoCount > 0) {
            throw new IllegalArgumentException("Ese correo ya está registrado");
        }
        log.info(">> Username y correo disponibles");

        jdbc.update("""
                INSERT INTO band (nombre, descripcion, genero_musical, leader_user_id)
                VALUES (?, NULL, NULL, NULL)
                """, req.nombreBanda());
        Long bandId = jdbc.queryForObject("SELECT MAX(band_id) FROM band", Long.class);
        log.info(">> Band creada, bandId={}", bandId);

        jdbc.update("""
                INSERT INTO person (nombre_completo, telefono, correo, correo_verificado)
                VALUES (?, ?, ?, 0)
                """, req.nombreCompleto(), req.telefono(), req.correo());
        Long personId = jdbc.queryForObject("SELECT MAX(person_id) FROM person", Long.class);
        log.info(">> Person creada, personId={}", personId);

        String passwordHash = encoder.encode(req.password());
        jdbc.update("""
                INSERT INTO app_user (
                    person_id, band_id, rol, username, password_hash,
                    email, estatus, primer_login, activo, failed_attempts, locked_until
                ) VALUES (?, ?, 'LEADER', ?, ?, ?, 'PENDIENTE', 0, 1, 0, NULL)
                """, personId, bandId, req.username(), passwordHash, req.correo());
        Long userId = jdbc.queryForObject("SELECT MAX(user_id) FROM app_user", Long.class);
        log.info(">> AppUser creado, userId={}", userId);

        jdbc.update("UPDATE band SET leader_user_id = ? WHERE band_id = ?", userId, bandId);
        log.info(">> Band vinculada al leader");

        log.info(">> Transaccion completada, userId={}", userId);
        return new RegisterLeaderResponse(true, bandId, userId, "Cuenta creada correctamente.");
    }

    public void sendVerificationEmail(Long userId) {
        log.info(">> Buscando usuario para enviar email, userId={}", userId);
        AppUser leader = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        log.info(">> Enviando email de verificación...");
        emailVerificationService.sendVerification(leader);
        log.info(">> Email enviado correctamente");
    }
}