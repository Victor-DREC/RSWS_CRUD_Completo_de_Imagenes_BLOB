
package com.krakedev.taller_jwt.config;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.krakedev.taller_jwt.JwtUtil;
import com.krakedev.taller_jwt.service.TokenBlackListService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenBlackListService blacklistService;

    public JwtAuthenticationFilter(TokenBlackListService blacklistService) {
        super();
        this.blacklistService = blacklistService;
    }

    // No necesitamos validar JWT para iniciar sesión o registrar usuarios
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String ruta = request.getServletPath();

        return request.getMethod().equalsIgnoreCase("OPTIONS")
                || ruta.equals("/auth/login")
                || ruta.equals("/auth/registrar");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Si no existe token, continuamos sin autenticación
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Extraemos el token
        String token = authHeader.substring(7);

        // Comprobamos si el token está en la lista negra
        if (blacklistService.estaInvalidado(token)) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"mensaje\":\"Acceso denegado. Token invalidado\"}");

            return;
        }

        // Validamos el token JWT
        DecodedJWT datosToken = JwtUtil.validarToken(token);

        if (datosToken == null) {

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"mensaje\":\"Token invalido o expirado\"}");

            return;
        }

        // Obtenemos los datos del usuario
        String username = datosToken.getSubject();
        String rolOriginal = datosToken.getClaim("rol").asString();

        String rolSpring = "ROLE_" + rolOriginal;

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(rolSpring);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singleton(authority));

        // Guardamos la autenticación en Spring Security
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Continuamos con la solicitud
        filterChain.doFilter(request, response);
    }
}
