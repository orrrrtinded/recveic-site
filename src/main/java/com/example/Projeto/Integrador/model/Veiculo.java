package com.example.Projeto.Integrador.model;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Veiculo {

    private Long idVeiculo;

    @NotBlank(message = "Placa e obrigatoria")
    @Size(max = 10, message = "Placa deve ter no maximo 10 caracteres")
    private String placa;

    @NotBlank(message = "Marca e obrigatoria")
    @Size(max = 50, message = "Marca deve ter no maximo 50 caracteres")
    private String marca;

    @Size(max = 100, message = "Modelo deve ter no maximo 100 caracteres")
    private String modelo;

    @NotNull(message = "Ano e obrigatorio")
    @Min(value = 1886, message = "Ano invalido")
    private Integer ano;

    @Size(max = 30, message = "Cor deve ter no maximo 30 caracteres")
    private String cor;

    @Size(max = 50, message = "Chassi deve ter no maximo 50 caracteres")
    private String chassi;

    private Long idCliente;

    public Long getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Long idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getChassi() {
        return chassi;
    }

    public void setChassi(String chassi) {
        this.chassi = chassi;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }
}
