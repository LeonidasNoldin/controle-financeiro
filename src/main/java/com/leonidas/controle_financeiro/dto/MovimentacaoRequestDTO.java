package com.leonidas.controle_financeiro.dto;

import com.leonidas.controle_financeiro.model.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoRequestDTO(
        @NotNull(message = "Campo Valor não preenchido")
        @Positive(message = "Insira apenas valores positivos") BigDecimal valor,

        @NotNull(message = "Data não preenchida") LocalDate data,

        @NotNull(message = "Tipo da transação não definido") TipoMovimentacao tipo,

        @Size(max = 100, message = "Número máximo de caracteres excedido. Número máximo: 100") String descricao,

        @NotNull(message = "Campo Usuário não preenchido") Long usuarioId
) {}