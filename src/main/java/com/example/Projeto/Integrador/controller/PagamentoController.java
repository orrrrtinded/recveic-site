package com.example.Projeto.Integrador.controller;

import com.example.Projeto.Integrador.model.Pagamento;
import com.example.Projeto.Integrador.service.PagamentoService;
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
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @GetMapping
    public List<Pagamento> findAll() {
        return pagamentoService.findAll();
    }

    @GetMapping("/{id}")
    public Pagamento findById(@PathVariable Long id) {
        return pagamentoService.findById(id);
    }

    @PostMapping
    public ResponseEntity<Pagamento> create(@Valid @RequestBody Pagamento pagamento) {
        Pagamento saved = pagamentoService.create(pagamento);
        return ResponseEntity.created(URI.create("/api/pagamentos/" + saved.getIdPagamento())).body(saved);
    }

    @PutMapping("/{id}")
    public Pagamento update(@PathVariable Long id, @Valid @RequestBody Pagamento pagamento) {
        return pagamentoService.update(id, pagamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        pagamentoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
