package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.OrdemServico;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class OrdemServicoRepository extends FirestoreCrudRepository<OrdemServico> {

    public OrdemServicoRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, OrdemServico.class, "ordens_servico", "idOs");
    }

    public boolean existsByVeiculoId(Long idVeiculo) {
        List<OrdemServico> ordens = findAll();
        return ordens.stream().anyMatch(ordem -> idVeiculo.equals(ordem.getIdVeiculo()));
    }
}
