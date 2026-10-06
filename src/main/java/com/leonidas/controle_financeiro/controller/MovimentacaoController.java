package com.leonidas.controle_financeiro.controller;

import com.leonidas.controle_financeiro.dto.MovimentacaoRequestDTO;
import com.leonidas.controle_financeiro.dto.MovimentacaoResponseDTO;
import com.leonidas.controle_financeiro.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RequestMapping("/movimentacoes")
@RestController
public class MovimentacaoController {

    @Autowired
    private MovimentacaoService movimentacaoService;

    @PostMapping
    public MovimentacaoResponseDTO cadastrar(@Valid @RequestBody MovimentacaoRequestDTO request) {
        return movimentacaoService.salvar(request);
    }

    @GetMapping("/usuario")
    public List<MovimentacaoResponseDTO> listar(@RequestParam Long usuarioId) {
        return movimentacaoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/total")
    public BigDecimal valor(@RequestParam Long usuarioId){
        return movimentacaoService.calcularSaldo(usuarioId);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        movimentacaoService.deletar(id);
    }
}
