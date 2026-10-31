package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.OrdemServico;
import com.example.Projeto.Integrador.repository.ItemServicoRepository;
import com.example.Projeto.Integrador.repository.OrdemServicoRepository;
import com.example.Projeto.Integrador.repository.PagamentoRepository;
import com.example.Projeto.Integrador.repository.VeiculoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrdemServicoService implements CrudService<OrdemServico> {

    private final OrdemServicoRepository ordemServicoRepository;
    private final VeiculoRepository veiculoRepository;
    private final ItemServicoRepository itemServicoRepository;
    private final PagamentoRepository pagamentoRepository;

    public OrdemServicoService(
            OrdemServicoRepository ordemServicoRepository,
            VeiculoRepository veiculoRepository,
            ItemServicoRepository itemServicoRepository,
            PagamentoRepository pagamentoRepository) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.veiculoRepository = veiculoRepository;
        this.itemServicoRepository = itemServicoRepository;
        this.pagamentoRepository = pagamentoRepository;
    }

    @Override
    public List<OrdemServico> findAll() {
        return ordemServicoRepository.findAll();
    }

    @Override
    public OrdemServico findById(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ordem de servico " + id + " nao encontrada"));
    }

    @Override
    public OrdemServico create(OrdemServico entity) {
        validateVeiculo(entity.getIdVeiculo());
        return ordemServicoRepository.create(entity);
    }

    @Override
    public OrdemServico update(Long id, OrdemServico entity) {
        findById(id);
        validateVeiculo(entity.getIdVeiculo());
        return ordemServicoRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        if (itemServicoRepository.existsByOsId(id) || pagamentoRepository.existsByOsId(id)) {
            throw new BusinessException("OS possui itens ou pagamento vinculados e nao pode ser excluida");
        }
        ordemServicoRepository.delete(id);
    }

    private void validateVeiculo(Long idVeiculo) {
        if (idVeiculo != null && veiculoRepository.findById(idVeiculo).isEmpty()) {
            throw new BusinessException("Veiculo informado nao existe");
        }
    }
}
