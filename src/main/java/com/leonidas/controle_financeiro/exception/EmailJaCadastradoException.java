package com.leonidas.controle_financeiro.exception;

public class EmailJaCadastradoException extends RuntimeException {
    public EmailJaCadastradoException(String email) {
        super ("Email já cadastrado: " + email);
    }
}
