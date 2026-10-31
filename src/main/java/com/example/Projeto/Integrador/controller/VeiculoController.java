package com.example.Projeto.Integrador.controller;

import com.example.Projeto.Integrador.model.Veiculo;
import com.example.Projeto.Integrador.service.VeiculoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoService veiculoService;

    public VeiculoController(VeiculoService veiculoService) {
        this.veiculoService = veiculoService;
    }

    @GetMapping
    public List<Veiculo> findAll() {
        return veiculoService.findAll();
    }

    @GetMapping("/{id}")
    public Veiculo findById(@PathVariable Long id) {
        return veiculoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Veiculo> create(@Valid @RequestBody Veiculo veiculo) {
        Veiculo saved = veiculoService.create(veiculo);
        return ResponseEntity.created(URI.create("/api/veiculos/" + saved.getIdVeiculo())).body(saved);
    }

    @PutMapping("/{id}")
    public Veiculo update(@PathVariable Long id, @Valid @RequestBody Veiculo veiculo) {
        return veiculoService.update(id, veiculo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veiculoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
