package com.example.Projeto.Integrador.repository;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class CounterRepository {

    private final Firestore firestore;

    public CounterRepository(Firestore firestore) {
        this.firestore = firestore;
    }

    public Long nextId(String sequenceName) {
        DocumentReference documentReference = firestore.collection("_counters").document(sequenceName);
        try {
            return firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(documentReference).get();
                long nextValue = snapshot.exists() && snapshot.contains("value")
                        ? snapshot.getLong("value") + 1
                        : 1L;
                transaction.set(documentReference, Map.of("value", nextValue));
                return nextValue;
            }).get();
        } catch (Exception exception) {
            throw new IllegalStateException("Nao foi possivel gerar identificador para " + sequenceName, exception);
        }
    }
}
