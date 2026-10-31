package com.example.Projeto.Integrador.controller;

import com.example.Projeto.Integrador.model.ItemServico;
import com.example.Projeto.Integrador.service.ItemServicoService;
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
@RequestMapping("/api/itens-servico")
public class ItemServicoController {

    private final ItemServicoService itemServicoService;

    public ItemServicoController(ItemServicoService itemServicoService) {
        this.itemServicoService = itemServicoService;
    }

    @GetMapping
    public List<ItemServico> findAll() {
        return itemServicoService.findAll();
    }

    @GetMapping("/{id}")
    public ItemServico findById(@PathVariable Long id) {
        return itemServicoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ItemServico> create(@Valid @RequestBody ItemServico itemServico) {
        ItemServico saved = itemServicoService.create(itemServico);
        return ResponseEntity.created(URI.create("/api/itens-servico/" + saved.getIdItem())).body(saved);
    }

    @PutMapping("/{id}")
    public ItemServico update(@PathVariable Long id, @Valid @RequestBody ItemServico itemServico) {
        return itemServicoService.update(id, itemServico);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemServicoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
