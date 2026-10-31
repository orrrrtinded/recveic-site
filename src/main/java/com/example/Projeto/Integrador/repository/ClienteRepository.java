package com.example.Projeto.Integrador.repository;

import com.example.Projeto.Integrador.model.Cliente;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FieldPath;
import com.google.cloud.firestore.Query;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class ClienteRepository extends FirestoreCrudRepository<Cliente> {

    public ClienteRepository(Firestore firestore, CounterRepository counterRepository, ObjectMapper objectMapper) {
        super(firestore, counterRepository, objectMapper, Cliente.class, "clientes", "idCliente");
    }

    

    /**
     * Replace broad findAll usage with a paginated query that leverages Firestore indexes.
     * This method returns up to `limit` clients ordered by document id. If startAfterId is
     * provided, the query will start after that id (cursor-based pagination).
     */
    public List<Cliente> findAllPaged(int limit, Long startAfterId) {
        try {
            Query q = getFirestore().collection(getCollectionName()).orderBy(FieldPath.documentId());
            if (startAfterId != null) {
                q = q.startAfter(startAfterId.toString());
            }
            if (limit > 0) q = q.limit(limit);
            return findByQuery(q);
        } catch (Exception ex) {
            throw new IllegalStateException("Nao foi possivel consultar clientes paginados", ex);
        }
    }

    @Override
    protected Long nextId() {
        return nextAvailableId();
    }
}
