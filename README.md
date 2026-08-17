# Alimenta-o

Nova base visual e estrutural do Alimenta-o: uma experiência estática, responsiva e preparada para evoluir por etapas.

## Estrutura atual

- sete áreas reais: Hoje, Ofertas, Compras, Alimentação, Movimento, Trajetos e Progresso;
- navegação inferior contínua no desktop e rolável por toque no mobile;
- hero estrutural com entrada, presença e saída dirigidas pelo scroll nativo;
- capítulos editoriais reutilizáveis com títulos mascarados, pausas sticky seletivas e reveals progressivos;
- Palavra do Dia apresentada como momento editorial de tela cheia;
- transições suaves entre áreas e alternativa estática para `prefers-reduced-motion`;
- personagem vetorial autoral no hero, representando um contador de terno;
- ciclo sincronizado de 9 segundos entre CORRER, COMER e FLEXÃO, com 3 segundos por ação;
- animação do personagem pausada fora do hero ou quando a página não está visível;
- campo de partículas em Canvas 2D com três camadas de profundidade, resposta local ao ponteiro e parallax suave;
- densidade, resolução e movimento adaptados para mobile e `prefers-reduced-motion`;
- sistema visual construído com tokens CSS para facilitar futuras mudanças de identidade;
- rotas locais por hash, sem dependências ou processo de build.

Esta etapa não inclui Orbital Timeline ou checklist animado.

## Executar localmente

Sirva a pasta com qualquer servidor HTTP estático, por exemplo:

```bash
python -m http.server 4173
```

Depois acesse `http://localhost:4173/`.

## Publicação

[GitHub Pages](https://matheuscontabilidade2003.github.io/alimenta-o/)
