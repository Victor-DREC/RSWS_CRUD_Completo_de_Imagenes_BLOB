package com.krakedev.taller_jwt.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.krakedev.taller_jwt.entidades.LoginRequest;

public interface LoginRequestRepository
        extends JpaRepository<LoginRequest, Long> {

    Optional<LoginRequest> findByUsername(String username);

}