package com.krakedev.taller_jwt.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class TokenBlackListService {

	//el Set es igual a List pero es mas rapido
	//el ConcurrentHashMap sirve para que no colapse el servidor si hay muchos usuarios al mismo tiemo
	private final Set<String> blacklist = ConcurrentHashMap.newKeySet();
	
	public void invalidarToken(String token) {
		
		blacklist.add(token);
		
	}
	
	public boolean estaInvalidado(String token) {
		//este metodo busca si existe o no lo que le mandamos dentro de la lista
		return blacklist.contains(token);
		
	}
	
}
