(() => {
  "use strict";

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

  let marquee = null;
  let rateFrame = 0;
  let resizeTimer = 0;

  function todayTemplate() {
    return `
      <section class="view view--today" aria-labelledby="today-title">
        <div class="hero">
          <div class="hero__copy">
            <p class="eyebrow">01 — Hoje / visão principal</p>
            <h1 id="today-title">Tudo o que<br><span>sustenta o dia.</span></h1>
            <p class="hero__intro">Alimentação, compras, movimento e escolhas financeiras reunidos em uma rotina mais legível.</p>
            <div class="hero__meta" aria-label="Estrutura desta etapa">
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
        <div class="day-rail" aria-label="Estrutura inicial da área Hoje">
          <section class="day-rail__item"><span class="module-label">AGORA / 01</span><strong>O essencial do momento.</strong><p>Espaço reservado para Palavra do Dia, próxima refeição e alertas úteis.</p></section>
          <section class="day-rail__item"><span class="module-label">EM SEGUIDA / 02</span><strong>O ritmo da rotina.</strong><p>Base preparada para tarefas, movimento, alimentação e compromissos.</p></section>
          <section class="day-rail__item"><span class="module-label">HORIZONTE / 03</span><strong>O dia visto por inteiro.</strong><p>Região futura para informações financeiras e a Orbital Timeline.</p></section>
        </div>
      </section>`;
  }

  function areaTemplate(area) {
    return `
      <section class="view view--area" aria-labelledby="area-title">
        <header class="view-heading">
          <div><p class="eyebrow">${area.number} — Área do Alimenta-o</p><h1 id="area-title">${area.title}</h1></div>
          <p>${area.intro}</p>
        </header>
        <div class="editorial-grid">
          <section>
            <span class="module-label">${area.primaryLabel}</span>
            <h2>${area.primaryTitle}</h2>
            <p>${area.primaryCopy}</p>
            <div class="signal-list">
              ${area.signals.map(([number, label, state]) => `<div class="signal-row"><span>${number}</span><b>${label}</b><small>${state}</small></div>`).join("")}
            </div>
          </section>
          <section><span class="module-label">${area.secondaryLabel}</span><h2>${area.secondaryTitle}</h2><p>${area.secondaryCopy}</p></section>
        </div>
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
    window.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
    if (focus) appView.focus({ preventScroll: true });
    if (announce) announcer.textContent = `Área ${routes.find(item => item.id === route).label} aberta.`;
  }

  function navigate(route, { replace = false } = {}) {
    if (!routes.some(item => item.id === route)) return;
    const nextHash = `#${route}`;
    if (replace) history.replaceState({ route }, "", nextHash);
    else history.pushState({ route }, "", nextHash);
    render(route, { focus: true, announce: true });
    centerActiveOnMobile();
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
  navViewport.addEventListener("pointerleave", () => easeMarqueeTo(1));
  navViewport.addEventListener("focusin", () => {
    cancelAnimationFrame(rateFrame);
    if (marquee) marquee.playbackRate = 0;
  });
  navViewport.addEventListener("focusout", () => {
    if (!navViewport.matches(":hover")) easeMarqueeTo(1);
  });
  addEventListener("popstate", () => render(resolveRoute(), { focus: true, announce: true }));
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(startMarquee, 160); });
  desktopQuery.addEventListener("change", () => { startMarquee(); centerActiveOnMobile(); });
  reducedMotionQuery.addEventListener("change", startMarquee);

  document.querySelector("#current-date").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const initialRoute = resolveRoute();
  if (location.hash !== `#${initialRoute}`) history.replaceState({ route: initialRoute }, "", `#${initialRoute}`);
  render(initialRoute);
  requestAnimationFrame(startMarquee);
})();
