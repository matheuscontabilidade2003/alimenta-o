(() => {
  "use strict";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const routes = [
    { id: "today", label: "Hoje" },
    { id: "offers", label: "Ofertas" },
    { id: "shopping", label: "Compras" },
    { id: "food", label: "Alimentação" },
    { id: "movement", label: "Movimento" },
    { id: "routes", label: "Trajetos" },
    { id: "progress", label: "Progresso" }
  ];

  const routeContent = {
    offers: {
      number: "02", title: "Ofertas em contexto.",
      intro: "Um espaço para observar preços e decidir com calma — sem transformar economia em ruído.",
      primaryLabel: "RADAR DE PREÇOS", primaryTitle: "O que vale acompanhar.",
      primaryCopy: "Na próxima etapa, ofertas verificadas poderão ser reunidas por produto, mercado e validade.",
      secondaryLabel: "CRITÉRIO", secondaryTitle: "Preço bom precisa de referência.",
      secondaryCopy: "A estrutura está preparada para comparar histórico e necessidade real antes de destacar uma compra.",
      signals: [["01", "Itens acompanhados", "A DEFINIR"], ["02", "Mercados", "A DEFINIR"], ["03", "Validade das ofertas", "A DEFINIR"]]
    },
    shopping: {
      number: "03", title: "Comprar com intenção.",
      intro: "Lista, despensa e orçamento devem conversar na mesma direção, com clareza antes de quantidade.",
      primaryLabel: "LISTA ATUAL", primaryTitle: "O necessário vem primeiro.",
      primaryCopy: "A futura lista de compras ocupará este módulo sem misturar planejamento com publicidade.",
      secondaryLabel: "DESPENSA", secondaryTitle: "Estoque visível, desperdício menor.",
      secondaryCopy: "A base aceita posteriormente quantidades, validade e alertas derivados dos dados registrados.",
      signals: [["01", "Lista da semana", "SEM ITENS"], ["02", "Itens próximos do fim", "SEM DADOS"], ["03", "Orçamento de compras", "NÃO DEFINIDO"]]
    },
    food: {
      number: "04", title: "Alimentação sem ruído.",
      intro: "Planejar refeições como parte da rotina: informação suficiente, escolhas editáveis e nenhum julgamento.",
      primaryLabel: "PLANO ALIMENTAR", primaryTitle: "Uma refeição de cada vez.",
      primaryCopy: "O planejamento diário será inserido aqui mantendo horários, locais e alimentos fáceis de revisar.",
      secondaryLabel: "PREPARO", secondaryTitle: "A semana começa antes da fome.",
      secondaryCopy: "Esta região receberá organização de porções e preparo doméstico em uma etapa funcional posterior.",
      signals: [["01", "Próxima refeição", "SEM REGISTRO"], ["02", "Refeições planejadas", "SEM REGISTRO"], ["03", "Preparo semanal", "SEM REGISTRO"]]
    },
    movement: {
      number: "05", title: "Movimento possível.",
      intro: "Atividade física integrada ao dia, sem estética de academia e sem transformar constância em pressão.",
      primaryLabel: "RITMO", primaryTitle: "Consistência antes de intensidade.",
      primaryCopy: "Corrida, caminhada e treino em casa poderão ser registrados aqui com contexto e duração.",
      secondaryLabel: "RECUPERAÇÃO", secondaryTitle: "Descanso também é movimento.",
      secondaryCopy: "A arquitetura reserva espaço para esforço percebido, observações e dias de recuperação.",
      signals: [["01", "Atividade de hoje", "NÃO REGISTRADA"], ["02", "Tempo em movimento", "SEM DADOS"], ["03", "Ritmo da semana", "SEM DADOS"]]
    },
    routes: {
      number: "06", title: "Trajetos que cabem no dia.",
      intro: "Deslocamentos vistos como parte da rotina — tempo, distância e escolhas mais eficientes.",
      primaryLabel: "ROTAS", primaryTitle: "Entre casa, trabalho e faculdade.",
      primaryCopy: "A área está pronta para receber trajetos frequentes sem depender de mapas nesta primeira etapa.",
      secondaryLabel: "TEMPO", secondaryTitle: "Planejar também é preservar energia.",
      secondaryCopy: "Comparações futuras poderão relacionar duração, custo e movimento de cada deslocamento.",
      signals: [["01", "Próximo trajeto", "NÃO DEFINIDO"], ["02", "Distância", "SEM DADOS"], ["03", "Tempo estimado", "SEM DADOS"]]
    },
    progress: {
      number: "07", title: "Progresso com contexto.",
      intro: "Uma leitura ampla da rotina, construída apenas com os registros que realmente existem.",
      primaryLabel: "EVOLUÇÃO", primaryTitle: "Mais que um número isolado.",
      primaryCopy: "Indicadores e gráficos só serão mostrados quando houver dados suficientes para uma leitura responsável.",
      secondaryLabel: "CONSISTÊNCIA", secondaryTitle: "O que se repete transforma.",
      secondaryCopy: "Alimentação, economia, movimento e trajetos poderão convergir aqui sem inventar resultados.",
      signals: [["01", "Período observado", "SEM DADOS"], ["02", "Registros", "SEM DADOS"], ["03", "Tendência", "INDISPONÍVEL"]]
    }
  };

  const appView = document.querySelector("#app-view");
  const announcer = document.querySelector("#route-announcer");
  const navViewport = document.querySelector("#nav-viewport");
  const navTrack = document.querySelector("#nav-track");
  const navPrimary = document.querySelector("#nav-primary");
  const desktopQuery = matchMedia("(min-width: 761px)");
  const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = value => Math.max(0, Math.min(1, value));
  const smoothstep = value => {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
  };

  let marquee = null;
  let rateFrame = 0;
  let resizeTimer = 0;
  let scrollFrame = 0;
  let transitionTimer = 0;
  let transitionToken = 0;
  let sceneMetrics = [];
  let revealMetrics = [];

  function titleLines(lines, id = "") {
    return `<h1 ${id ? `id="${id}"` : ""} data-reveal="title">${lines.map(line => `<span class="title-mask"><span>${line}</span></span>`).join("")}</h1>`;
  }

  function todayTemplate() {
    return `
      <section class="view view--today" aria-labelledby="today-title">
        <div class="hero-scene" data-scroll-scene="hero">
          <div class="hero" data-sticky-section>
            <div class="hero__copy">
              <p class="eyebrow" data-reveal="soft">01 — Hoje / visão principal</p>
              ${titleLines(["Tudo o que", "sustenta o dia."], "today-title")}
              <p class="hero__intro" data-reveal="block">Alimentação, compras, movimento e escolhas financeiras reunidos em uma rotina mais legível.</p>
              <div class="hero__meta" data-reveal="soft" aria-label="Estrutura desta etapa">
                <div><span>Estado</span><strong>Nova base</strong></div>
                <div><span>Foco</span><strong>Organização</strong></div>
                <div><span>Próximo</span><strong>Interações</strong></div>
              </div>
            </div>
            <div class="future-stage" aria-label="Área preparada para a futura animação principal">
              <span class="stage-label">PALCO DE INTERAÇÃO / FUTURO</span>
              <span class="stage-state">ESTRUTURA ATIVA</span>
              <div class="stage-axis"><span>CORRER</span><span>COMER</span><span>FLEXÃO</span></div>
            </div>
          </div>
        </div>

        <div class="day-rail" aria-label="Estrutura inicial da área Hoje">
          <section class="day-rail__item" data-reveal="soft"><span class="module-label">AGORA / 01</span><strong>O essencial do momento.</strong><p>Palavra, próxima refeição e alertas úteis.</p></section>
          <section class="day-rail__item" data-reveal="block"><span class="module-label">EM SEGUIDA / 02</span><strong>O ritmo da rotina.</strong><p>Movimento, alimentação e compromissos.</p></section>
          <section class="day-rail__item" data-reveal="soft"><span class="module-label">HORIZONTE / 03</span><strong>O dia visto por inteiro.</strong><p>Informações financeiras e progresso.</p></section>
        </div>

        <section class="word-scene" data-scroll-scene="word" aria-labelledby="word-title">
          <div class="word-stage" data-sticky-section>
            <p class="word-stage__label">02 / PALAVRA DO DIA</p>
            <blockquote id="word-title">“Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu.”</blockquote>
            <cite>Eclesiastes 3:1</cite>
            <span class="word-stage__line" aria-hidden="true"></span>
          </div>
        </section>

        <section class="chapter-split chapter-split--food" data-scroll-scene="chapter" aria-labelledby="meal-chapter-title">
          <header class="chapter-marker" data-sticky-section>
            <span>03</span>
            <p>ALIMENTAÇÃO</p>
            <h2 id="meal-chapter-title">Uma pausa que organiza o restante.</h2>
          </header>
          <div class="chapter-flow">
            <article class="meal-moment" data-reveal="meal">
              <time data-step="0">12:00</time>
              <h3 data-step="1">Almoço</h3>
              <p data-step="2">O planejamento ainda não foi registrado. A informação aparecerá aqui sem julgamento e sem excesso.</p>
              <button class="text-route" data-route="food" data-step="3">Abrir Alimentação <span aria-hidden="true">↗</span></button>
            </article>
            <div class="flow-note" data-reveal="soft">
              <span class="module-label">DEPOIS</span>
              <p>Preparo, localização e histórico entrarão em sequência curta quando os dados existirem.</p>
            </div>
          </div>
        </section>

        <section class="chapter-panel" data-scroll-scene="panel" aria-labelledby="movement-chapter-title">
          <div class="chapter-panel__inner" data-sticky-section>
            <div class="chapter-panel__number">04</div>
            <div class="chapter-panel__copy" data-reveal="title">
              <span class="module-label">MOVIMENTO</span>
              <h2 id="movement-chapter-title">O corpo também organiza o tempo.</h2>
              <p>Nenhuma atividade está registrada nesta base. O espaço está pronto para receber movimento e recuperação.</p>
              <button class="text-route" data-route="movement">Abrir Movimento <span aria-hidden="true">↗</span></button>
            </div>
          </div>
        </section>

        <section class="summary-chapter" aria-labelledby="summary-title">
          <p class="eyebrow" data-reveal="soft">05 — Resumo</p>
          <div data-reveal="title">${titleLines(["O dia não é", "uma lista de cards."], "summary-title")}</div>
          <p class="summary-chapter__copy" data-reveal="block">É uma sequência de decisões conectadas. As próximas etapas adicionarão interação sem perder esse ritmo.</p>
        </section>
      </section>`;
  }

  function areaTemplate(area) {
    return `
      <section class="view view--area" aria-labelledby="area-title">
        <div class="area-hero-scene" data-scroll-scene="area">
          <header class="view-heading" data-sticky-section>
            <div>
              <p class="eyebrow" data-reveal="soft">${area.number} — Área do Alimenta-o</p>
              ${titleLines([area.title], "area-title")}
            </div>
            <p data-reveal="block">${area.intro}</p>
          </header>
        </div>
        <div class="editorial-grid">
          <section data-reveal="block">
            <span class="module-label">${area.primaryLabel}</span>
            <h2 data-reveal="title">${area.primaryTitle}</h2>
            <p data-reveal="soft">${area.primaryCopy}</p>
            <div class="signal-list">
              ${area.signals.map(([number, label, state], index) => `<div class="signal-row" data-reveal="soft" style="--reveal-delay:${index * .08}"><span>${number}</span><b>${label}</b><small>${state}</small></div>`).join("")}
            </div>
          </section>
          <section data-reveal="soft">
            <span class="module-label">${area.secondaryLabel}</span>
            <h2>${area.secondaryTitle}</h2>
            <p>${area.secondaryCopy}</p>
          </section>
        </div>
        <footer class="area-outro" data-reveal="title"><span>${area.number}</span><p>Continuar pela faixa inferior.</p></footer>
      </section>`;
  }

  function resolveRoute() {
    const hash = location.hash.replace("#", "");
    return routes.some(route => route.id === hash) ? hash : "today";
  }

  function updateNavigation(route) {
    document.querySelectorAll(".motion-nav__item").forEach(item => {
      const active = item.dataset.route === route;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    document.querySelectorAll("[data-mirror]").forEach(item => item.classList.toggle("is-active", item.dataset.mirror === route));
  }

  function render(route, { focus = false, announce = false } = {}) {
    document.body.dataset.view = route;
    appView.innerHTML = route === "today" ? todayTemplate() : areaTemplate(routeContent[route]);
    updateNavigation(route);
    window.scrollTo({ top: 0, behavior: "auto" });
    if (focus) appView.focus({ preventScroll: true });
    if (announce) announcer.textContent = `Área ${routes.find(item => item.id === route).label} aberta.`;
    requestAnimationFrame(measureScrollSystem);
  }

  function transitionTo(route, { focus = true, announce = true } = {}) {
    const token = ++transitionToken;
    clearTimeout(transitionTimer);
    appView.classList.remove("is-entering");
    appView.classList.add("is-leaving");

    transitionTimer = setTimeout(() => {
      if (token !== transitionToken) return;
      render(route, { focus, announce });
      appView.classList.remove("is-leaving");
      appView.classList.add("is-entering");
      centerActiveOnMobile();
      requestAnimationFrame(() => requestAnimationFrame(() => appView.classList.remove("is-entering")));
    }, reducedMotionQuery.matches ? 0 : 180);
  }

  function navigate(route) {
    if (!routes.some(item => item.id === route) || route === resolveRoute()) return;
    history.pushState({ route }, "", `#${route}`);
    transitionTo(route);
  }

  function centerActiveOnMobile() {
    if (desktopQuery.matches) return;
    navPrimary.querySelector(".is-active")?.scrollIntoView({ behavior: reducedMotionQuery.matches ? "auto" : "smooth", inline: "center", block: "nearest" });
  }

  function stopMarquee() {
    cancelAnimationFrame(rateFrame);
    marquee?.cancel();
    marquee = null;
    navTrack.style.transform = "";
  }

  function startMarquee() {
    stopMarquee();
    if (!desktopQuery.matches || reducedMotionQuery.matches) return;
    const distance = navPrimary.getBoundingClientRect().width;
    if (!distance) return;
    marquee = navTrack.animate(
      [{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(-${distance}px,0,0)` }],
      { duration: 46000, iterations: Infinity, easing: "linear" }
    );
  }

  function easeMarqueeTo(targetRate) {
    if (!marquee) return;
    cancelAnimationFrame(rateFrame);
    const initialRate = marquee.playbackRate;
    const start = performance.now();
    const duration = 520;
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      marquee.playbackRate = initialRate + (targetRate - initialRate) * eased;
      if (progress < 1) rateFrame = requestAnimationFrame(step);
    }
    rateFrame = requestAnimationFrame(step);
  }

  function documentMetric(element) {
    const rect = element.getBoundingClientRect();
    const delay = Number.parseFloat(getComputedStyle(element).getPropertyValue("--reveal-delay")) || 0;
    return { element, top: rect.top + scrollY, height: Math.max(1, rect.height), type: element.dataset.scrollScene || element.dataset.reveal, delay };
  }

  function measureScrollSystem() {
    sceneMetrics = [...appView.querySelectorAll("[data-scroll-scene]")].map(documentMetric);
    revealMetrics = [...appView.querySelectorAll("[data-reveal]")].map(documentMetric);
    document.body.classList.toggle("motion-reduced", reducedMotionQuery.matches);
    updateScrollSystem();
  }

  function updateScrollSystem() {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;

    if (reducedMotionQuery.matches) {
      [...sceneMetrics, ...revealMetrics].forEach(({ element }) => {
        element.style.setProperty("--scene-progress", 1);
        element.style.setProperty("--scene-enter", 1);
        element.style.setProperty("--scene-exit", 0);
        element.style.setProperty("--reveal-enter", 1);
        element.style.setProperty("--reveal-exit", 0);
      });
      return;
    }

    const y = scrollY;
    const viewport = innerHeight;

    sceneMetrics.forEach(({ element, top, height, type }) => {
      const travel = Math.max(1, height - viewport);
      const progress = clamp((y - top) / travel);
      const enter = type === "hero" ? 1 : smoothstep(progress / .26);
      const exit = smoothstep((progress - .7) / .3);
      element.style.setProperty("--scene-progress", progress.toFixed(4));
      element.style.setProperty("--scene-enter", enter.toFixed(4));
      element.style.setProperty("--scene-exit", exit.toFixed(4));
      element.style.setProperty("--scene-presence", (enter * (1 - exit)).toFixed(4));
      element.style.setProperty("--phase-a", smoothstep((progress - .04) / .22).toFixed(4));
      element.style.setProperty("--phase-b", smoothstep((progress - .18) / .24).toFixed(4));
      element.style.setProperty("--phase-c", smoothstep((progress - .34) / .22).toFixed(4));
    });

    revealMetrics.forEach(({ element, top, height, delay }) => {
      const entry = smoothstep((y + viewport * (.9 - delay) - top) / (viewport * .3));
      const exitStart = top + height - viewport * .12;
      const exit = smoothstep((y - exitStart) / (viewport * .38));
      element.style.setProperty("--reveal-enter", entry.toFixed(4));
      element.style.setProperty("--reveal-exit", exit.toFixed(4));
      element.dataset.revealState = entry < .98 ? "entering" : exit > .02 ? "leaving" : "present";
    });
  }

  function queueScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollSystem);
  }

  document.addEventListener("click", event => {
    const routeTrigger = event.target.closest("[data-route]");
    if (!routeTrigger) return;
    event.preventDefault();
    navigate(routeTrigger.dataset.route);
  });

  navViewport.addEventListener("pointerenter", () => {
    cancelAnimationFrame(rateFrame);
    if (marquee) marquee.playbackRate = .04;
  });
  navViewport.addEventListener("pointerdown", () => {
    cancelAnimationFrame(rateFrame);
    if (marquee) marquee.playbackRate = 0;
  });
  navViewport.addEventListener("pointerleave", () => easeMarqueeTo(1));
  navViewport.addEventListener("focusin", () => {
    cancelAnimationFrame(rateFrame);
    if (marquee) marquee.playbackRate = 0;
  });
  navViewport.addEventListener("focusout", () => {
    if (!navViewport.matches(":hover")) easeMarqueeTo(1);
  });

  addEventListener("scroll", queueScrollUpdate, { passive: true });
  addEventListener("popstate", () => transitionTo(resolveRoute()));
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { startMarquee(); measureScrollSystem(); }, 160);
  });
  desktopQuery.addEventListener("change", () => { startMarquee(); centerActiveOnMobile(); measureScrollSystem(); });
  reducedMotionQuery.addEventListener("change", () => { startMarquee(); measureScrollSystem(); });

  document.querySelector("#current-date").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const initialRoute = resolveRoute();
  if (location.hash !== `#${initialRoute}`) history.replaceState({ route: initialRoute }, "", `#${initialRoute}`);
  render(initialRoute);
  requestAnimationFrame(startMarquee);
  document.fonts?.ready.then(measureScrollSystem);
  setTimeout(measureScrollSystem, 140);
})();
