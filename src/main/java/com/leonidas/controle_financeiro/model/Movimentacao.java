package com.leonidas.controle_financeiro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacao")
@Getter
@Setter
@NoArgsConstructor
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Campo Valor não preenchido")
    @Positive(message = "Insira apenas valores positivos")
    @Column(nullable = false)
    private BigDecimal valor;

    @NotNull(message = "Data não preenchida")
    @Column(nullable = false)
    private LocalDate data;

    @NotNull(message = "Tipo da transação não definido")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo;

    @Size(max = 100, message = "Núemro máximo de caracteres excedido. Número máximo: 100")
    @Column
    private String descricao;

    @NotNull(message = "Campo Usuário não preenchido")
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
