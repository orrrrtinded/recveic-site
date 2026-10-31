package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.Servico;
import com.example.Projeto.Integrador.repository.ItemServicoRepository;
import com.example.Projeto.Integrador.repository.ServicoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ServicoService implements CrudService<Servico> {

    private final ServicoRepository servicoRepository;
    private final ItemServicoRepository itemServicoRepository;

    public ServicoService(ServicoRepository servicoRepository, ItemServicoRepository itemServicoRepository) {
        this.servicoRepository = servicoRepository;
        this.itemServicoRepository = itemServicoRepository;
    }

    @Override
    public List<Servico> findAll() {
        return servicoRepository.findAll();
    }

    @Override
    public Servico findById(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Servico " + id + " nao encontrado"));
    }

    @Override
    public Servico create(Servico entity) {
        return servicoRepository.create(entity);
    }

    @Override
    public Servico update(Long id, Servico entity) {
        findById(id);
        return servicoRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        if (itemServicoRepository.existsByServicoId(id)) {
            throw new BusinessException("Servico possui itens vinculados e nao pode ser excluido");
        }
        servicoRepository.delete(id);
    }
}
