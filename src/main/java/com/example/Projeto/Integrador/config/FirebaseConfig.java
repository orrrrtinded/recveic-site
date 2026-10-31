package com.example.Projeto.Integrador.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
public class FirebaseConfig {

    private static final String CREDENTIALS_JSON_ENV = "FIREBASE_CREDENTIALS_JSON";

    @Bean
    public Firestore firestore(FirebaseProperties properties) throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions.Builder options = FirebaseOptions.builder()
                    .setProjectId(properties.getProjectId())
                    .setCredentials(resolveCredentials(properties));

            if (StringUtils.hasText(properties.getDatabaseUrl())) {
                options.setDatabaseUrl(properties.getDatabaseUrl());
            }

            FirebaseApp.initializeApp(options.build());
        }

        return FirestoreClient.getFirestore();
    }

    private GoogleCredentials resolveCredentials(FirebaseProperties properties) throws IOException {
        if (StringUtils.hasText(properties.getCredentialsPath())) {
            Path credentialsPath = Path.of(properties.getCredentialsPath());
            if (Files.exists(credentialsPath)) {
                try (InputStream inputStream = Files.newInputStream(credentialsPath)) {
                    return GoogleCredentials.fromStream(inputStream);
                }
            }
        }

        String credentialsJson = System.getenv(CREDENTIALS_JSON_ENV);
        if (StringUtils.hasText(credentialsJson)) {
            try (InputStream inputStream = new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))) {
                return GoogleCredentials.fromStream(inputStream);
            }
        }

        try {
            return GoogleCredentials.getApplicationDefault();
        } catch (IOException exception) {
            throw new IOException(
                    "Credenciais Firebase nao encontradas. Coloque o arquivo em .firebase/serviceAccountKey.json, "
                            + "defina a variavel FIREBASE_CREDENTIALS_JSON com o conteudo do JSON, "
                            + "ou configure credenciais padrao do Google.",
                    exception);
        }
    }
}
