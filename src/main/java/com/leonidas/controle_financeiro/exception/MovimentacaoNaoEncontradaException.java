package com.leonidas.controle_financeiro.exception;

public class MovimentacaoNaoEncontradaException extends RuntimeException {
    public MovimentacaoNaoEncontradaException(Long id) {
        super("Movimentação não encontrada com o id: " + id);
    }
}
