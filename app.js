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
  const heroActions = [
    { id: "run", number: "01", label: "CORRER", state: "EM MOVIMENTO" },
    { id: "eat", number: "02", label: "COMER", state: "PAUSA CONSCIENTE" },
    { id: "pushup", number: "03", label: "FLEXÃO", state: "FORÇA E ROTINA" }
  ];
  const heroActionDuration = 3000;
  const heroCycleDuration = heroActionDuration * heroActions.length;
  let heroActionFrame = 0;
  let heroVisibilityObserver = null;
  let heroStage = null;
  let heroInView = false;
  let heroPlaying = false;
  let heroCycleOrigin = 0;
  let heroElapsed = 0;
  let heroActionIndex = -1;

  function titleLines(lines, id = "") {
    return `<h1 ${id ? `id="${id}"` : ""} data-reveal="title">${lines.map(line => `<span class="title-mask"><span>${line}</span></span>`).join("")}</h1>`;
  }

  function accountantScene() {
    return `
      <div class="character-stage is-loading" data-character-stage aria-hidden="true">
        <span class="stage-label">ASSISTENTE / ROTINA</span>
        <span class="stage-state" data-character-state>EM MOVIMENTO</span>
        <div class="character-loader"><i></i><span>Preparando o dia</span></div>
        <div class="character-aura"></div>
        <svg class="accountant-character" viewBox="0 0 640 760" role="presentation" focusable="false">
          <defs>
            <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3c4144"/><stop offset=".5" stop-color="#202427"/><stop offset="1" stop-color="#0c0e10"/></linearGradient>
            <linearGradient id="suitLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#555b5e"/><stop offset="1" stop-color="#25292c"/></linearGradient>
            <linearGradient id="skin" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#edc5a6"/><stop offset="1" stop-color="#b97f60"/></linearGradient>
            <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cfd2d0"/></linearGradient>
            <filter id="softShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".32"/></filter>
          </defs>

          <g class="character-pose character-pose--run is-active" data-character-pose="run" filter="url(#softShadow)">
            <ellipse class="pose-shadow" cx="350" cy="699" rx="190" ry="20"/>
            <g class="run-leg run-leg--back">
              <path d="M328 425 C300 451 274 486 252 524 C236 550 211 579 178 614 L216 641 C260 608 291 578 314 544 C340 505 361 467 369 438 Z" fill="url(#suit)"/>
              <path d="M178 610 C157 629 142 648 132 667 C155 681 186 683 224 676 L231 649 L207 625 Z" fill="#111315"/>
              <path d="M145 664 C171 672 195 672 221 665" fill="none" stroke="#676c6e" stroke-width="4" stroke-linecap="round"/>
            </g>
            <g class="run-leg run-leg--front">
              <path d="M369 426 C392 458 420 489 452 520 C474 543 491 581 499 633 L454 641 C443 602 425 575 399 553 C364 523 336 493 318 455 Z" fill="url(#suitLight)"/>
              <path d="M451 633 C461 632 485 629 502 633 C527 641 544 654 552 669 C516 677 477 676 443 665 Z" fill="#111315"/>
              <path d="M459 660 C485 666 512 666 537 661" fill="none" stroke="#676c6e" stroke-width="4" stroke-linecap="round"/>
            </g>
            <g class="run-arm run-arm--back">
              <path d="M315 252 C277 273 249 307 231 353 C218 386 202 414 181 439 L216 465 C247 437 268 407 282 371 C294 342 316 318 343 301 Z" fill="url(#suit)"/>
              <path d="M181 437 C165 448 158 463 164 477 C171 491 192 495 207 484 L220 463 Z" fill="url(#skin)"/>
            </g>
            <g class="run-body">
              <path d="M339 206 L387 210 L397 241 L350 252 L323 231 Z" fill="url(#skin)"/>
              <path d="M302 232 C328 214 393 212 423 237 C448 286 457 354 452 432 C411 455 340 461 291 432 C283 360 284 294 302 232 Z" fill="url(#suit)"/>
              <path d="M340 226 L370 246 L397 226 L405 340 L350 359 L318 248 Z" fill="url(#shirt)"/>
              <path d="M338 228 L365 249 L339 292 L303 238 Z M397 229 L369 250 L397 294 L426 242 Z" fill="#171a1c" stroke="#5a5f62" stroke-width="2"/>
              <path d="M365 249 L379 268 L369 349 L352 350 L351 269 Z" fill="#ef334c"/>
              <path d="M301 336 C345 357 400 355 449 328" fill="none" stroke="#5d6264" stroke-width="3" opacity=".55"/>
              <path d="M420 278 L439 275 L441 293 L421 296 Z" fill="#f2f3ef" opacity=".88"/>
            </g>
            <g class="run-arm run-arm--front">
              <path d="M420 245 C449 260 467 286 473 319 C478 347 492 370 516 389 L491 421 C456 398 435 367 425 332 C417 306 400 291 381 281 Z" fill="url(#suitLight)"/>
              <path d="M489 391 C505 383 523 387 531 402 C538 416 531 433 515 439 C500 444 488 432 480 418 Z" fill="url(#skin)"/>
            </g>
            <g class="run-head">
              <ellipse cx="367" cy="151" rx="57" ry="67" fill="url(#skin)"/>
              <path d="M311 141 C312 87 344 68 380 75 C420 81 434 112 421 147 C410 124 389 110 353 111 C340 126 328 136 311 141 Z" fill="#17191a"/>
              <path d="M321 116 C339 92 375 86 408 102" fill="none" stroke="#4f5456" stroke-width="7" stroke-linecap="round" opacity=".65"/>
              <ellipse cx="346" cy="151" rx="4" ry="5" fill="#252627"/><ellipse cx="388" cy="151" rx="4" ry="5" fill="#252627"/>
              <path d="M368 154 L365 176 L375 177" fill="none" stroke="#936149" stroke-width="3" stroke-linecap="round"/>
              <path d="M348 190 C359 198 376 199 388 188" fill="none" stroke="#713f39" stroke-width="4" stroke-linecap="round"/>
              <path d="M334 139 C343 134 352 134 359 138 M380 138 C390 133 399 134 405 140" fill="none" stroke="#3b2a25" stroke-width="4" stroke-linecap="round"/>
            </g>
          </g>

          <g class="character-pose character-pose--eat" data-character-pose="eat" filter="url(#softShadow)">
            <ellipse class="pose-shadow" cx="355" cy="702" rx="155" ry="19"/>
            <g class="eat-legs">
              <path d="M310 443 L363 443 L355 650 L299 650 Z M365 443 L420 438 L443 650 L386 650 Z" fill="url(#suit)"/>
              <path d="M293 642 L357 642 L365 679 C327 688 286 684 267 669 Z M385 642 L445 642 L477 670 C446 683 405 682 379 674 Z" fill="#111315"/>
              <path d="M282 670 C309 676 334 675 355 669 M393 671 C418 676 441 675 461 669" fill="none" stroke="#676c6e" stroke-width="4" stroke-linecap="round"/>
            </g>
            <g class="eat-body">
              <path d="M340 207 L389 207 L396 246 L347 253 L328 229 Z" fill="url(#skin)"/>
              <path d="M298 232 C337 213 395 216 430 239 C450 293 451 372 435 451 C395 468 331 469 288 447 C280 363 281 288 298 232 Z" fill="url(#suit)"/>
              <path d="M337 228 L368 248 L397 228 L405 348 L344 348 L318 244 Z" fill="url(#shirt)"/>
              <path d="M337 229 L366 249 L339 294 L301 238 Z M398 229 L370 249 L399 294 L430 240 Z" fill="#171a1c" stroke="#5a5f62" stroke-width="2"/>
              <path d="M366 249 L380 267 L370 348 L351 348 L352 268 Z" fill="#ef334c"/>
              <path d="M300 352 C343 369 393 368 439 349" fill="none" stroke="#5d6264" stroke-width="3" opacity=".55"/>
              <path d="M405 279 L427 277 L428 296 L406 298 Z" fill="#f2f3ef"/>
            </g>
            <g class="eat-arm eat-arm--tray">
              <path d="M305 254 C276 273 258 315 261 359 C263 389 280 414 307 430 L333 397 C315 383 307 365 309 344 C312 318 327 299 342 286 Z" fill="url(#suitLight)"/>
              <path d="M305 414 C324 401 347 404 360 421 C369 434 365 450 349 458 C329 467 308 454 294 438 Z" fill="url(#skin)"/>
              <path d="M280 425 Q329 406 378 425 L368 453 Q329 469 290 452 Z" fill="#f2f3ef"/>
              <path d="M284 425 Q329 444 374 425" fill="none" stroke="#8a8f8c" stroke-width="4"/>
              <path d="M320 418 C326 403 341 400 349 416" fill="#ef334c"/>
            </g>
            <g class="eat-arm eat-arm--mouth">
              <path d="M421 252 C449 269 465 298 462 329 C458 357 439 373 413 372 L405 333 C422 329 429 317 426 301 C423 286 411 277 396 272 Z" fill="url(#suit)"/>
              <path d="M405 328 C418 316 436 317 447 330 C458 343 455 361 442 371 C428 381 409 374 400 359 Z" fill="url(#skin)"/>
              <circle cx="428" cy="333" r="8" fill="#ef334c"/>
            </g>
            <g class="eat-head">
              <ellipse cx="368" cy="150" rx="57" ry="67" fill="url(#skin)"/>
              <path d="M312 141 C313 88 343 69 381 75 C420 81 434 111 422 147 C409 123 387 109 353 111 C340 126 328 136 312 141 Z" fill="#17191a"/>
              <path d="M323 115 C342 93 376 87 407 102" fill="none" stroke="#4f5456" stroke-width="7" stroke-linecap="round" opacity=".65"/>
              <ellipse cx="347" cy="151" rx="4" ry="5" fill="#252627"/><ellipse cx="389" cy="151" rx="4" ry="5" fill="#252627"/>
              <path d="M368 154 L365 176 L374 178" fill="none" stroke="#936149" stroke-width="3" stroke-linecap="round"/>
              <path d="M355 190 Q370 199 385 189" fill="none" stroke="#713f39" stroke-width="4" stroke-linecap="round"/>
              <path d="M334 139 C344 134 352 134 359 138 M381 138 C390 133 399 134 405 140" fill="none" stroke="#3b2a25" stroke-width="4" stroke-linecap="round"/>
            </g>
          </g>

          <g class="character-pose character-pose--pushup" data-character-pose="pushup" filter="url(#softShadow)">
            <ellipse class="pose-shadow" cx="344" cy="598" rx="270" ry="22"/>
            <g class="pushup-figure">
              <g class="pushup-legs">
                <path d="M390 407 C454 417 505 436 559 471 L541 510 C486 486 436 474 373 464 Z" fill="url(#suit)"/>
                <path d="M543 471 C569 477 598 488 619 506 C607 526 580 538 542 535 L522 507 Z" fill="#111315"/>
                <path d="M563 525 C584 526 601 520 613 510" fill="none" stroke="#676c6e" stroke-width="4" stroke-linecap="round"/>
              </g>
              <g class="pushup-body">
                <path d="M205 375 L249 351 L273 376 L251 413 L211 414 Z" fill="url(#skin)"/>
                <path d="M244 356 C304 349 371 369 421 409 L393 479 C329 468 274 451 218 419 C214 397 224 373 244 356 Z" fill="url(#suit)"/>
                <path d="M251 365 L284 375 L296 444 L247 421 Z" fill="url(#shirt)"/>
                <path d="M281 375 L299 387 L289 440 L274 435 L273 391 Z" fill="#ef334c"/>
                <path d="M249 365 L283 376 L262 408 L227 376 Z M290 378 L304 371 C346 381 385 397 419 421 L399 450 C358 421 327 405 293 397 Z" fill="#171a1c" stroke="#5a5f62" stroke-width="2"/>
                <path d="M334 398 L357 406 L351 424 L328 416 Z" fill="#f2f3ef"/>
              </g>
              <g class="pushup-arm pushup-arm--far">
                <path d="M299 400 C277 426 269 464 279 507 L316 501 C314 471 323 448 342 429 Z" fill="url(#suitLight)"/>
                <path d="M279 499 C258 508 249 527 256 545 C265 562 289 564 306 550 L316 507 Z" fill="url(#skin)"/>
                <path d="M252 550 L316 550" fill="none" stroke="#777c7e" stroke-width="7" stroke-linecap="round"/>
              </g>
              <g class="pushup-arm pushup-arm--near">
                <path d="M234 390 C207 420 197 465 207 516 L249 513 C246 476 257 447 279 425 Z" fill="url(#suit)"/>
                <path d="M207 508 C184 518 174 540 183 559 C193 577 220 578 238 561 L249 516 Z" fill="url(#skin)"/>
                <path d="M178 562 L246 562" fill="none" stroke="#777c7e" stroke-width="8" stroke-linecap="round"/>
              </g>
              <g class="pushup-head">
                <ellipse cx="162" cy="363" rx="55" ry="63" fill="url(#skin)" transform="rotate(-12 162 363)"/>
                <path d="M108 352 C107 311 132 286 169 292 C204 297 220 326 211 359 C195 335 176 323 141 326 C132 339 122 348 108 352 Z" fill="#17191a"/>
                <path d="M120 323 C139 303 169 301 195 314" fill="none" stroke="#4f5456" stroke-width="7" stroke-linecap="round" opacity=".65"/>
                <ellipse cx="149" cy="363" rx="4" ry="5" fill="#252627"/><ellipse cx="187" cy="355" rx="4" ry="5" fill="#252627"/>
                <path d="M168 363 L171 380 L180 380" fill="none" stroke="#936149" stroke-width="3" stroke-linecap="round"/>
                <path d="M151 391 C162 397 176 395 186 386" fill="none" stroke="#713f39" stroke-width="4" stroke-linecap="round"/>
              </g>
            </g>
          </g>
        </svg>
        <span class="character-ground"></span>
      </div>`;
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
              <div class="hero-action" data-action-controller data-reveal="soft">
                <div class="hero-action__current" aria-live="off">
                  <span data-action-number>01</span>
                  <strong data-action-label>CORRER</strong>
                </div>
                <div class="hero-action__sequence" role="list" aria-label="Ciclo do assistente">
                  <span class="is-active" data-action-option="run" role="listitem"><i>01</i>CORRER</span>
                  <span data-action-option="eat" role="listitem"><i>02</i>COMER</span>
                  <span data-action-option="pushup" role="listitem"><i>03</i>FLEXÃO</span>
                </div>
                <div class="hero-action__progress" aria-hidden="true"><i data-action-progress></i></div>
                <p>Três segundos para cada parte de uma rotina que precisa caber no mesmo dia.</p>
              </div>
            </div>
            ${accountantScene()}
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

  function applyHeroAction(index) {
    if (!heroStage || index === heroActionIndex) return;
    heroActionIndex = index;
    const action = heroActions[index];
    const controller = appView.querySelector("[data-action-controller]");
    controller?.querySelector("[data-action-number]")?.replaceChildren(action.number);
    controller?.querySelector("[data-action-label]")?.replaceChildren(action.label);
    controller?.querySelectorAll("[data-action-option]").forEach(option => {
      const active = option.dataset.actionOption === action.id;
      option.classList.toggle("is-active", active);
      if (active) option.setAttribute("aria-current", "true");
      else option.removeAttribute("aria-current");
    });
    heroStage.querySelectorAll("[data-character-pose]").forEach(pose => pose.classList.toggle("is-active", pose.dataset.characterPose === action.id));
    heroStage.querySelector("[data-character-state]")?.replaceChildren(action.state);
    heroStage.dataset.action = action.id;
    heroStage.dataset.actionChangedAt = performance.now().toFixed(1);
  }

  function normalizedHeroElapsed(now) {
    return ((now - heroCycleOrigin) % heroCycleDuration + heroCycleDuration) % heroCycleDuration;
  }

  function heroActionTick() {
    if (!heroStage || !heroPlaying) return;
    heroElapsed = normalizedHeroElapsed(performance.now());
    const index = Math.min(heroActions.length - 1, Math.floor(heroElapsed / heroActionDuration));
    const progress = (heroElapsed % heroActionDuration) / heroActionDuration;
    applyHeroAction(index);
    heroStage.style.setProperty("--action-progress", progress.toFixed(4));
    heroActionFrame = requestAnimationFrame(heroActionTick);
  }

  function setHeroPlayback(shouldPlay) {
    if (!heroStage || shouldPlay === heroPlaying) return;
    const now = performance.now();
    heroPlaying = shouldPlay;
    heroStage.classList.toggle("is-paused", !shouldPlay);
    cancelAnimationFrame(heroActionFrame);
    heroActionFrame = 0;

    if (shouldPlay) {
      heroCycleOrigin = now - heroElapsed;
      heroActionFrame = requestAnimationFrame(heroActionTick);
    } else {
      heroElapsed = normalizedHeroElapsed(now);
    }
  }

  function syncHeroPlayback() {
    setHeroPlayback(Boolean(heroStage && heroInView && !document.hidden));
  }

  function stopHeroExperience() {
    cancelAnimationFrame(heroActionFrame);
    heroActionFrame = 0;
    heroVisibilityObserver?.disconnect();
    heroVisibilityObserver = null;
    heroStage = null;
    heroInView = false;
    heroPlaying = false;
    heroElapsed = 0;
    heroActionIndex = -1;
  }

  function setupHeroExperience() {
    heroStage = appView.querySelector("[data-character-stage]");
    if (!heroStage) return;

    heroElapsed = 0;
    heroCycleOrigin = performance.now();
    heroInView = true;
    applyHeroAction(0);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!heroStage) return;
      heroStage.classList.remove("is-loading");
      heroStage.classList.add("is-ready");
    }));

    heroVisibilityObserver = new IntersectionObserver(entries => {
      heroInView = entries.some(entry => entry.isIntersecting);
      syncHeroPlayback();
    }, { threshold: 0 });
    heroVisibilityObserver.observe(appView.querySelector(".hero-scene"));
    syncHeroPlayback();
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
    stopHeroExperience();
    document.body.dataset.view = route;
    appView.innerHTML = route === "today" ? todayTemplate() : areaTemplate(routeContent[route]);
    setupHeroExperience();
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
  document.addEventListener("visibilitychange", syncHeroPlayback);
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
