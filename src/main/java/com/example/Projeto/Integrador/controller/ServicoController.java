package com.example.Projeto.Integrador.controller;

import com.example.Projeto.Integrador.model.Servico;
import com.example.Projeto.Integrador.service.ServicoService;
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
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public List<Servico> findAll() {
        return servicoService.findAll();
    }

    @GetMapping("/{id}")
    public Servico findById(@PathVariable Long id) {
        return servicoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Servico> create(@Valid @RequestBody Servico servico) {
        Servico saved = servicoService.create(servico);
        return ResponseEntity.created(URI.create("/api/servicos/" + saved.getIdServico())).body(saved);
    }

    @PutMapping("/{id}")
    public Servico update(@PathVariable Long id, @Valid @RequestBody Servico servico) {
        return servicoService.update(id, servico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        servicoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
