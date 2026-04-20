package com.noisync.backend.service;

public class PasswordPolicy {

    public static final int MIN_LENGTH = 8;

    public static final String MESSAGE =
            "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número";

    public static boolean isValid(String password) {
        if (password == null) {
            return false;
        }

        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);

        return password.length() >= MIN_LENGTH && hasUpper && hasDigit;
    }

    public static void validateOrThrow(String password) {
        if (!isValid(password)) {
            throw new IllegalArgumentException(MESSAGE);
        }
    }
}