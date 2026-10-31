package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.Pagamento;
import com.example.Projeto.Integrador.repository.OrdemServicoRepository;
import com.example.Projeto.Integrador.repository.PagamentoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PagamentoService implements CrudService<Pagamento> {

    private final PagamentoRepository pagamentoRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public PagamentoService(PagamentoRepository pagamentoRepository, OrdemServicoRepository ordemServicoRepository) {
        this.pagamentoRepository = pagamentoRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    @Override
    public List<Pagamento> findAll() {
        return pagamentoRepository.findAll();
    }

    @Override
    public Pagamento findById(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pagamento " + id + " nao encontrado"));
    }

    @Override
    public Pagamento create(Pagamento entity) {
        validate(entity, null);
        return pagamentoRepository.create(entity);
    }

    @Override
    public Pagamento update(Long id, Pagamento entity) {
        findById(id);
        validate(entity, id);
        return pagamentoRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        pagamentoRepository.delete(id);
    }

    private void validate(Pagamento entity, Long currentId) {
        if (ordemServicoRepository.findById(entity.getIdOs()).isEmpty()) {
            throw new BusinessException("OS informada nao existe");
        }

        pagamentoRepository.findByOsId(entity.getIdOs()).ifPresent(existing -> {
            if (currentId == null || !existing.getIdPagamento().equals(currentId)) {
                throw new BusinessException("Ja existe pagamento vinculado a esta OS");
            }
        });
    }
}
