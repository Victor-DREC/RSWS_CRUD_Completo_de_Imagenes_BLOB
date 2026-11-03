
package com.krakedev.taller_jwt.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.krakedev.taller_jwt.entidades.AutoModificado;
import com.krakedev.taller_jwt.repositories.AutoModificadoRepository;

@RestController
@RequestMapping("/auth/autos-modificados")
@CrossOrigin(origins = "http://localhost:5175")
public class AutoModificadoController {

    private final AutoModificadoRepository autoRepository;

    public AutoModificadoController(AutoModificadoRepository autoRepository) {
        super();
        this.autoRepository = autoRepository;
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("marca") String marca,
            @RequestParam("modelo") String modelo,
            @RequestParam("anio") Integer anio) {

        try {

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Debes seleccionar una fotografia");
            }

            AutoModificado auto = new AutoModificado();

            auto.setMarca(marca);
            auto.setModelo(modelo);
            auto.setAnio(anio);
            auto.setMimeType(file.getContentType());
            auto.setFoto(file.getBytes());

            AutoModificado autoGuardado = autoRepository.save(auto);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Automovil registrado con exito");
            respuesta.put("id", autoGuardado.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar el automovil: " + e.getMessage());
        }
    }
    
 // ACTUALIZAR AUTOMOVIL
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @RequestParam("marca") String marca,
            @RequestParam("modelo") String modelo,
            @RequestParam("anio") Integer anio,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {

            AutoModificado auto = autoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Automovil no encontrado"));

            auto.setMarca(marca);
            auto.setModelo(modelo);
            auto.setAnio(anio);

            if (file != null && !file.isEmpty()) {
                auto.setMimeType(file.getContentType());
                auto.setFoto(file.getBytes());
            }

            autoRepository.save(auto);

            return ResponseEntity.ok("Automovil actualizado con exito");

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar el automovil: " + e.getMessage());
        }
    }
    
 // CONSULTAR FOTOGRAFÍA POR ID
    @GetMapping("/{id}/foto")
    public ResponseEntity<?> obtenerFoto(@PathVariable Integer id) {

        try {

            AutoModificado auto = autoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Automóvil no encontrado"));

            if (auto.getFoto() == null || auto.getFoto().length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("El automóvil no tiene una fotografía registrada");
            }

            MediaType tipoImagen;

            if (auto.getMimeType() != null && !auto.getMimeType().isBlank()) {
                tipoImagen = MediaType.parseMediaType(auto.getMimeType());
            } else {
                tipoImagen = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .contentType(tipoImagen)
                    .body(auto.getFoto());

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar la fotografía: " + e.getMessage());
        }
    }
    
 // ELIMINAR AUTOMOVIL POR ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {

        try {

            AutoModificado auto = autoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Automovil no encontrado"));

            autoRepository.delete(auto);

            return ResponseEntity.ok("Automovil eliminado con exito");

        } catch (RuntimeException e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar el automovil: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listar() {

        try {

            List<AutoModificado> autos = autoRepository.findAll();

            List<Map<String, Object>> respuesta = new ArrayList<>();

            for (AutoModificado auto : autos) {

                Map<String, Object> datos = new HashMap<>();

                datos.put("id", auto.getId());
                datos.put("marca", auto.getMarca());
                datos.put("modelo", auto.getModelo());
                datos.put("anio", auto.getAnio());
                datos.put("mimeType", auto.getMimeType());

                respuesta.add(datos);
            }

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al listar los automoviles: " + e.getMessage());
        }
    }
}
