package com.leonidas.controle_financeiro.repository;

import com.leonidas.controle_financeiro.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findByUsuarioId(Long usuarioId);
}