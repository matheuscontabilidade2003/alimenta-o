# Alimenta-o

Nova base visual e estrutural do Alimenta-o: uma experiência estática, responsiva e preparada para evoluir por etapas.

## Estrutura atual

- sete áreas reais: Hoje, Ofertas, Compras, Alimentação, Movimento, Trajetos e Progresso;
- navegação inferior contínua no desktop e rolável por toque no mobile;
- hero estrutural preparado para receber a animação principal em uma etapa posterior;
- sistema visual construído com tokens CSS para facilitar futuras mudanças de identidade;
- rotas locais por hash, sem dependências ou processo de build.

Esta etapa não inclui personagem, partículas, contador de ações, Orbital Timeline ou interações avançadas de scroll.

## Executar localmente

Sirva a pasta com qualquer servidor HTTP estático, por exemplo:

```bash
python -m http.server 4173
```

Depois acesse `http://localhost:4173/`.

## Publicação

[GitHub Pages](https://matheuscontabilidade2003.github.io/alimenta-o/)
