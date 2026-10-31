package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.Veiculo;
import com.example.Projeto.Integrador.repository.ClienteRepository;
import com.example.Projeto.Integrador.repository.OrdemServicoRepository;
import com.example.Projeto.Integrador.repository.VeiculoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class VeiculoService implements CrudService<Veiculo> {

    private final VeiculoRepository veiculoRepository;
    private final ClienteRepository clienteRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public VeiculoService(
            VeiculoRepository veiculoRepository,
            ClienteRepository clienteRepository,
            OrdemServicoRepository ordemServicoRepository) {
        this.veiculoRepository = veiculoRepository;
        this.clienteRepository = clienteRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    @Override
    public List<Veiculo> findAll() {
        return veiculoRepository.findAll();
    }

    @Override
    public Veiculo findById(Long id) {
        return veiculoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Veiculo " + id + " nao encontrado"));
    }

    @Override
    public Veiculo create(Veiculo entity) {
        validateCliente(entity.getIdCliente());
        return veiculoRepository.create(entity);
    }

    @Override
    public Veiculo update(Long id, Veiculo entity) {
        findById(id);
        validateCliente(entity.getIdCliente());
        return veiculoRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        if (ordemServicoRepository.existsByVeiculoId(id)) {
            throw new BusinessException("Veiculo possui ordens de servico vinculadas e nao pode ser excluido");
        }
        veiculoRepository.delete(id);
    }

    private void validateCliente(Long idCliente) {
        if (idCliente != null && clienteRepository.findById(idCliente).isEmpty()) {
            throw new BusinessException("Cliente informado nao existe");
        }
    }
}
