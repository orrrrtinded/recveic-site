package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.Servico;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

@Repository
public class ServicoRepository extends FirestoreCrudRepository<Servico> {

    public ServicoRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, Servico.class, "servicos", "idServico");
    }
}
