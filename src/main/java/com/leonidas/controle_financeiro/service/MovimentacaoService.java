package com.leonidas.controle_financeiro.service;

import com.leonidas.controle_financeiro.dto.MovimentacaoRequestDTO;
import com.leonidas.controle_financeiro.dto.MovimentacaoResponseDTO;
import com.leonidas.controle_financeiro.exception.MovimentacaoNaoEncontradaException;
import com.leonidas.controle_financeiro.exception.UsuarioNaoEncontradoException;
import com.leonidas.controle_financeiro.model.Movimentacao;
import com.leonidas.controle_financeiro.model.TipoMovimentacao;
import com.leonidas.controle_financeiro.model.Usuario;
import com.leonidas.controle_financeiro.repository.MovimentacaoRepository;
import com.leonidas.controle_financeiro.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MovimentacaoService {

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public MovimentacaoResponseDTO salvar(MovimentacaoRequestDTO request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new UsuarioNaoEncontradoException(request.usuarioId()));

        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setValor(request.valor());
        movimentacao.setData(request.data());
        movimentacao.setTipo(request.tipo());
        movimentacao.setDescricao(request.descricao());
        movimentacao.setUsuario(usuario);

        Movimentacao salva = movimentacaoRepository.save(movimentacao);

        return new MovimentacaoResponseDTO(
                salva.getId(),
                salva.getValor(),
                salva.getData(),
                salva.getTipo(),
                salva.getDescricao(),
                salva.getUsuario().getId()
        );
    }

    public List<MovimentacaoResponseDTO> listarPorUsuario(Long usuarioId) {
        List<Movimentacao> movimentacoes = movimentacaoRepository.findByUsuarioId(usuarioId);

        return movimentacoes.stream()
                .map(m -> new MovimentacaoResponseDTO(m.getId(), m.getValor(), m.getData(), m.getTipo(), m.getDescricao(), m.getUsuario().getId()))
                .toList();
    }

    public BigDecimal calcularSaldo(Long usuarioId) {
        List<Movimentacao> movimentacoes = movimentacaoRepository.findByUsuarioId(usuarioId);

        BigDecimal saldo = BigDecimal.ZERO;

        for (Movimentacao m : movimentacoes) {
            if (m.getTipo() == TipoMovimentacao.ENTRADA) {
                saldo = saldo.add(m.getValor());
            } else {
                saldo = saldo.subtract(m.getValor());
            }
        }

        return saldo;
    }

    public void deletar(Long id) {
        if (!movimentacaoRepository.existsById(id)) {
            throw new MovimentacaoNaoEncontradaException(id);
        }
        movimentacaoRepository.deleteById(id);
    }
}
