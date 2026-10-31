package com.example.Projeto.Integrador.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Servico {

    private Long idServico;

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
    private String nome;

    @Size(max = 200, message = "Descricao deve ter no maximo 200 caracteres")
    private String descricao;

    @NotNull(message = "Valor e obrigatorio")
    @DecimalMin(value = "0.01", inclusive = true, message = "Valor deve ser maior que zero")
    private BigDecimal valor;

    public Long getIdServico() {
        return idServico;
    }

    public void setIdServico(Long idServico) {
        this.idServico = idServico;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
