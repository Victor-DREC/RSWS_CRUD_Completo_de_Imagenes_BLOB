package com.krakedev.taller_jwt;

import java.util.Date;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

public class JwtUtil {

    private static final String SECRET_KEY =
            "MiClaveSecretaParaGenerarTokensJWT2026";

    private static final long TIEMPO_EXPIRACION = 86400000;

    private static final Algorithm ALGORITHM =
            Algorithm.HMAC256(SECRET_KEY);

    // Generar token
    public static String generarToken(String username, String rol) {

        Date fechaActual = new Date();

        Date fechaExpiracion =
                new Date(fechaActual.getTime() + TIEMPO_EXPIRACION);

        return JWT.create()
                .withSubject(username)
                .withClaim("rol", rol)
                .withIssuedAt(fechaActual)
                .withExpiresAt(fechaExpiracion)
                .sign(ALGORITHM);
    }

    // Validar token
    public static DecodedJWT validarToken(String token) {

        return JWT.require(ALGORITHM)
                .build()
                .verify(token);
    }

    // Obtener username
    public static String obtenerUsername(String token) {

        DecodedJWT tokenDecodificado = validarToken(token);

        return tokenDecodificado.getSubject();
    }

    // Obtener rol
    public static String obtenerRol(String token) {

        DecodedJWT tokenDecodificado = validarToken(token);

        return tokenDecodificado.getClaim("rol").asString();
    }
}