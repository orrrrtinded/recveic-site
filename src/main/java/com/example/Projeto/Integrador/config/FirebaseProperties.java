package com.example.Projeto.Integrador.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "firebase")
public class FirebaseProperties {

    private String projectId = "projetointegrador-4f2dd";
    private String credentialsPath;
    private String databaseUrl;

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getCredentialsPath() {
        return credentialsPath;
    }

    public void setCredentialsPath(String credentialsPath) {
        this.credentialsPath = credentialsPath;
    }

    public String getDatabaseUrl() {
        return databaseUrl;
    }

    public void setDatabaseUrl(String databaseUrl) {
        this.databaseUrl = databaseUrl;
    }
}
