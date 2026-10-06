package com.leonidas.controle_financeiro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
        @NotBlank(message = "O nome do Usuário é obrigatório") String nome,

        @NotBlank(message = "O campo email deve ser preenchido")
        @Email(message = "Email inválido") String email,

        @NotBlank(message = "O campo senha deve ser preenchido")
        @Size(min = 5, max = 50, message = "A senha deve ter entre 5 e 50 caracteres") String senha
) {}