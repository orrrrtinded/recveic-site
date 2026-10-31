package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.Veiculo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class VeiculoRepository extends FirestoreCrudRepository<Veiculo> {

    public VeiculoRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, Veiculo.class, "veiculos", "idVeiculo");
    }

    public boolean existsByClienteId(Long idCliente) {
        List<Veiculo> veiculos = findAll();
        return veiculos.stream().anyMatch(veiculo -> idCliente.equals(veiculo.getIdCliente()));
    }
}
