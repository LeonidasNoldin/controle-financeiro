package com.leonidas.controle_financeiro.controller;

import com.leonidas.controle_financeiro.dto.UsuarioRequestDTO;
import com.leonidas.controle_financeiro.dto.UsuarioResponseDTO;
import com.leonidas.controle_financeiro.model.Usuario;
import com.leonidas.controle_financeiro.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/usuarios")
@RestController
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listAll();
    }

    @GetMapping("/buscar")
    public UsuarioResponseDTO buscar(@RequestParam String email) {
        return usuarioService.buscarPorEmail(email);
    }

    @PostMapping
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody UsuarioRequestDTO request) {
        return usuarioService.cadastrar(request);
    }
}
