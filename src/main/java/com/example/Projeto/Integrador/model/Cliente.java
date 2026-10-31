package com.example.Projeto.Integrador.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Cliente {

    private Long idCliente;

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
    private String nome;

    @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 digitos")
    private String cpf;

    @NotBlank(message = "Rua e obrigatoria")
    @Size(max = 150, message = "Rua deve ter no maximo 150 caracteres")
    private String rua;

    @NotBlank(message = "Numero e obrigatorio")
    @Size(max = 10, message = "Numero deve ter no maximo 10 caracteres")
    private String numero;

    @Size(max = 100, message = "Complemento deve ter no maximo 100 caracteres")
    private String complemento;

    @NotBlank(message = "Bairro e obrigatorio")
    @Size(max = 100, message = "Bairro deve ter no maximo 100 caracteres")
    private String bairro;

    @NotBlank(message = "Cidade e obrigatoria")
    @Size(max = 100, message = "Cidade deve ter no maximo 100 caracteres")
    private String cidade;

    @NotBlank(message = "Estado e obrigatorio")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "Estado deve conter 2 letras")
    private String estado;

    @NotBlank(message = "CEP e obrigatorio")
    @Size(max = 10, message = "CEP deve ter no maximo 10 caracteres")
    private String cep;

    @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres")
    private String telefone;

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
}
