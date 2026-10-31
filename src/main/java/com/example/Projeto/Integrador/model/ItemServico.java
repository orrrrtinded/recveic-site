package com.example.Projeto.Integrador.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ItemServico {

    private Long idItem;

    @NotNull(message = "OS e obrigatoria")
    private Long idOs;

    @NotNull(message = "Servico e obrigatorio")
    private Long idServico;

    @NotNull(message = "Quantidade e obrigatoria")
    @Min(value = 1, message = "Quantidade deve ser no minimo 1")
    private Integer quantidade;

    @NotNull(message = "Valor unitario e obrigatorio")
    @DecimalMin(value = "0.01", inclusive = true, message = "Valor unitario deve ser maior que zero")
    private BigDecimal valorUnitario;

    public Long getIdItem() {
        return idItem;
    }

    public void setIdItem(Long idItem) {
        this.idItem = idItem;
    }

    public Long getIdOs() {
        return idOs;
    }

    public void setIdOs(Long idOs) {
        this.idOs = idOs;
    }

    public Long getIdServico() {
        return idServico;
    }

    public void setIdServico(Long idServico) {
        this.idServico = idServico;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public BigDecimal getValorUnitario() {
        return valorUnitario;
    }

    public void setValorUnitario(BigDecimal valorUnitario) {
        this.valorUnitario = valorUnitario;
    }
}
