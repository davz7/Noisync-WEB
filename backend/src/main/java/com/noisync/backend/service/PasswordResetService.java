package com.noisync.backend.service;

import com.noisync.backend.dto.ForgotPasswordRequest;
import com.noisync.backend.dto.ResetPasswordRequest;
import com.noisync.backend.domain.AppUser;
import com.noisync.backend.repository.AppUserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final JdbcTemplate jdbc;
    private final AppUserRepository userRepo;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    @Value("${app.frontend.reset-url}")
    private String resetUrl;

    public PasswordResetService(
            JdbcTemplate jdbc,
            AppUserRepository userRepo,
            PasswordEncoder encoder,
            EmailService emailService
    ) {
        this.jdbc = jdbc;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    @Transactional
    public void requestReset(ForgotPasswordRequest req) {

        AppUser user = userRepo
                .findByCorreoIgnoreCase(req.email())
                .orElseThrow(() ->
                        new RuntimeException("Si el correo existe, recibirás instrucciones.")
                );

        String token = UUID.randomUUID().toString().replace("-", "");
        String tokenHash = sha256Hex(token);

        jdbc.update("""
            INSERT INTO password_reset_token (
              user_id,
              token_hash,
              fecha_expiracion,
              estatus
            )
            VALUES (?, ?, SYSTIMESTAMP + NUMTODSINTERVAL(1,'HOUR'), 'PENDIENTE')
        """, user.getUserId(), tokenHash);

        String link = resetUrl + token;

        emailService.send(
                user.getCorreo(),
                "Noisync - Recuperación de contraseña",
                "Haz clic en el siguiente enlace:\n\n" + link +
                        "\n\nEste enlace expira en 1 hora."
        );
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {

        if (!req.newPassword().equals(req.confirmPassword())) {
            throw new IllegalArgumentException("Las contraseñas no coinciden.");
        }

        if (!PasswordPolicy.isValid(req.newPassword())) {
            throw new IllegalArgumentException(PasswordPolicy.MESSAGE);
        }

        String tokenHash = sha256Hex(req.token());

        Long resetId = jdbc.queryForObject("""
            SELECT reset_id
            FROM password_reset_token
            WHERE token_hash = ?
              AND estatus = 'PENDIENTE'
              AND fecha_expiracion > SYSTIMESTAMP
        """, Long.class, tokenHash);

        if (resetId == null) {
            throw new IllegalArgumentException("Token inválido o expirado.");
        }

        Long userId = jdbc.queryForObject("""
            SELECT user_id
            FROM password_reset_token
            WHERE reset_id = ?
        """, Long.class, resetId);

        AppUser user = userRepo.findById(userId).orElseThrow();

        user.setPasswordHash(encoder.encode(req.newPassword()));
        user.setPrimerLogin(0);
        userRepo.save(user);

        jdbc.update("""
            UPDATE password_reset_token
            SET estatus = 'USADO',
                fecha_uso = SYSTIMESTAMP
            WHERE reset_id = ?
        """, resetId);
    }

    @Transactional
    public void leaderResetPassword(Long bandId, Long musicianId) {
        AppUser musician = userRepo.findById(musicianId)
                .orElseThrow(() -> new IllegalArgumentException("Músico no encontrado"));

        if (!musician.getBandId().equals(bandId) || !musician.getRol().equals("MUSICIAN")) {
            throw new IllegalArgumentException("Músico no pertenece a esta banda");
        }

        String tempPassword = "Tmp" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 8) + "1A";

        musician.setPasswordHash(encoder.encode(tempPassword));
        musician.setPrimerLogin(1);
        userRepo.save(musician);

        emailService.send(
                musician.getCorreo(),
                "Noisync - Tu contraseña fue restablecida",
                "El líder de tu banda restableció tu contraseña.\n\n" +
                "Tu nueva contraseña temporal es: " + tempPassword + "\n\n" +
                "Al iniciar sesión deberás cambiarla."
        );
    }

    private static String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo generar hash");
        }
    }
}