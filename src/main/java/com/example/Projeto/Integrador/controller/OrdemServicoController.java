package com.example.Projeto.Integrador.controller;

import com.example.Projeto.Integrador.model.OrdemServico;
import com.example.Projeto.Integrador.service.OrdemServicoService;
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
@RequestMapping("/api/ordens-servico")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }

    @GetMapping
    public List<OrdemServico> findAll() {
        return ordemServicoService.findAll();
    }

    @GetMapping("/{id}")
    public OrdemServico findById(@PathVariable Long id) {
        return ordemServicoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<OrdemServico> create(@Valid @RequestBody OrdemServico ordemServico) {
        OrdemServico saved = ordemServicoService.create(ordemServico);
        return ResponseEntity.created(URI.create("/api/ordens-servico/" + saved.getIdOs())).body(saved);
    }

    @PutMapping("/{id}")
    public OrdemServico update(@PathVariable Long id, @Valid @RequestBody OrdemServico ordemServico) {
        return ordemServicoService.update(id, ordemServico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ordemServicoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
