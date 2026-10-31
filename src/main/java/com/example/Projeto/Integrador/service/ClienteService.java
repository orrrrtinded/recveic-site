package com.example.Projeto.Integrador.service;

import com.example.Projeto.Integrador.model.Cliente;
import com.example.Projeto.Integrador.repository.ClienteRepository;
import com.example.Projeto.Integrador.repository.VeiculoRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ClienteService implements CrudService<Cliente> {

    private final ClienteRepository clienteRepository;
    private final VeiculoRepository veiculoRepository;

    public ClienteService(ClienteRepository clienteRepository, VeiculoRepository veiculoRepository) {
        this.clienteRepository = clienteRepository;
        this.veiculoRepository = veiculoRepository;
    }

    @Override
    public List<Cliente> findAll() {
        // Use paginated query to avoid loading entire collection into memory.
        // Returning first 200 entries as a default page.
        return clienteRepository.findAllPaged(200, null);
    }

    @Override
    public Cliente findById(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente " + id + " nao encontrado"));
    }

    @Override
    public Cliente create(Cliente entity) {
        return clienteRepository.create(entity);
    }

    @Override
    public Cliente update(Long id, Cliente entity) {
        findById(id);
        return clienteRepository.update(id, entity);
    }

    @Override
    public void delete(Long id) {
        findById(id);
        if (veiculoRepository.existsByClienteId(id)) {
            throw new BusinessException("Cliente possui veiculos vinculados e nao pode ser excluido");
        }
        clienteRepository.delete(id);
    }
}
