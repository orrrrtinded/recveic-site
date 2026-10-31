package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.ItemServico;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class ItemServicoRepository extends FirestoreCrudRepository<ItemServico> {

    public ItemServicoRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, ItemServico.class, "itens_servico", "idItem");
    }

    public boolean existsByOsId(Long idOs) {
        List<ItemServico> itens = findAll();
        return itens.stream().anyMatch(item -> idOs.equals(item.getIdOs()));
    }

    public boolean existsByServicoId(Long idServico) {
        List<ItemServico> itens = findAll();
        return itens.stream().anyMatch(item -> idServico.equals(item.getIdServico()));
    }
}
