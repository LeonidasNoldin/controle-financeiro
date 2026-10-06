package com.leonidas.controle_financeiro.exception;

public class UsuarioNaoEncontradoException extends RuntimeException{

    public UsuarioNaoEncontradoException(Long id) {
        super("Usuário não encontrado com id: " + id);
    }

    public UsuarioNaoEncontradoException(String email) {
        super("usuário não encontrado com Email: " + email );
    }
}
