package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.ItemServico;
import com.example.Projeto.Integrador.repository.ItemServicoRepository;
import com.example.Projeto.Integrador.repository.OrdemServicoRepository;
import com.example.Projeto.Integrador.repository.ServicoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ItemServicoService implements CrudService<ItemServico> {

    private final ItemServicoRepository itemServicoRepository;
    private final OrdemServicoRepository ordemServicoRepository;
    private final ServicoRepository servicoRepository;

    public ItemServicoService(
            ItemServicoRepository itemServicoRepository,
            OrdemServicoRepository ordemServicoRepository,
            ServicoRepository servicoRepository) {
        this.itemServicoRepository = itemServicoRepository;
        this.ordemServicoRepository = ordemServicoRepository;
        this.servicoRepository = servicoRepository;
    }

    @Override
    public List<ItemServico> findAll() {
        return itemServicoRepository.findAll();
    }

    @Override
    public ItemServico findById(Long id) {
        return itemServicoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item de servico " + id + " nao encontrado"));
    }

    @Override
    public ItemServico create(ItemServico entity) {
        validateRelations(entity);
        return itemServicoRepository.create(entity);
    }

    @Override
    public ItemServico update(Long id, ItemServico entity) {
        findById(id);
        validateRelations(entity);
        return itemServicoRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        itemServicoRepository.delete(id);
    }

    private void validateRelations(ItemServico entity) {
        if (ordemServicoRepository.findById(entity.getIdOs()).isEmpty()) {
            throw new BusinessException("OS informada nao existe");
        }
        if (servicoRepository.findById(entity.getIdServico()).isEmpty()) {
            throw new BusinessException("Servico informado nao existe");
        }
    }
}
