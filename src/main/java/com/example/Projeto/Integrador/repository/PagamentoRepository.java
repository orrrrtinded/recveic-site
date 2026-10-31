package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.Pagamento;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class PagamentoRepository extends FirestoreCrudRepository<Pagamento> {

    public PagamentoRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, Pagamento.class, "pagamentos", "idPagamento");
    }

    public boolean existsByOsId(Long idOs) {
        return findAll().stream().anyMatch(pagamento -> idOs.equals(pagamento.getIdOs()));
    }

    public Optional<Pagamento> findByOsId(Long idOs) {
        List<Pagamento> pagamentos = findAll();
        return pagamentos.stream().filter(pagamento -> idOs.equals(pagamento.getIdOs())).findFirst();
    }
}
