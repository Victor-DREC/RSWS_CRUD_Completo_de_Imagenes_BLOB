package com.krakedev.taller_jwt.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.krakedev.taller_jwt.JwtUtil;
import com.krakedev.taller_jwt.entidades.LoginRequest;
import com.krakedev.taller_jwt.repositories.LoginRequestRepository;

@RestController
@RequestMapping("/auth")
public class LoginRequestController {

    private final LoginRequestRepository repository;
    private final PasswordEncoder passwordEncoder;

    public LoginRequestController(
            LoginRequestRepository repository,
            PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody LoginRequest usuario) {

        try {

            if (usuario.getUsername() == null ||
                usuario.getUsername().trim().isEmpty() ||
                usuario.getPassword() == null ||
                usuario.getPassword().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Username y contraseña son obligatorios");
            }

            if (repository.findByUsername(usuario.getUsername()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("El username ya se encuentra registrado");
            }

            usuario.setRol("USER");

            usuario.setPassword(
                    passwordEncoder.encode(usuario.getPassword())
            );

            LoginRequest usuarioNuevo = repository.save(usuario);

            Map<String, Object> respuesta = new HashMap<>();

            respuesta.put("mensaje", "Usuario registrado correctamente");
            respuesta.put("id", usuarioNuevo.getId());
            respuesta.put("username", usuarioNuevo.getUsername());
            respuesta.put("rol", usuarioNuevo.getRol());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(respuesta);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar usuario: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest credenciales) {

        try {

            if (credenciales.getUsername() == null ||
                credenciales.getPassword() == null) {

                return ResponseEntity.badRequest()
                        .body("Username y contraseña son obligatorios");
            }

            LoginRequest usuario = repository.findByUsername(
                    credenciales.getUsername()
            ).orElse(null);

            if (usuario == null || !passwordEncoder.matches(
                    credenciales.getPassword(),
                    usuario.getPassword())) {

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Usuario o contraseña incorrectos");
            }

            String token = JwtUtil.generarToken(
                    usuario.getUsername(),
                    usuario.getRol()
            );

            Map<String, Object> respuesta = new HashMap<>();

            respuesta.put("mensaje", "Inicio de sesión exitoso");
            respuesta.put("token", token);
            respuesta.put("username", usuario.getUsername());
            respuesta.put("rol", usuario.getRol());

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al iniciar sesión: " + e.getMessage());
        }
    }
}