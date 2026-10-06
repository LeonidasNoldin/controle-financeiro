package com.leonidas.controle_financeiro.dto;

import com.leonidas.controle_financeiro.model.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoResponseDTO(
        Long id,
        BigDecimal valor,
        LocalDate data,
        TipoMovimentacao tipo,
        String descricao,
        Long usuarioId
) {}
