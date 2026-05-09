/* ══════════════════════════════════════════════
   Autómatas Finitos — lógica principal
   ══════════════════════════════════════════════ */
const API = "http://localhost:8080";
const AUTOMATAS = {
    telemetria: {
        nombre: "Telemetría",
        descripcion: "HDR → (TEMP | HUM)* → CRC",
        ejemplo: "HDR,TEMP,HUM,CRC",
        ayuda: "Ej: HDR,TEMP,HUM,CRC — separa símbolos con comas.",
        endpoints: {
            afnd: `${API}/api/telemetria/afnd`,
            probar: `${API}/api/telemetria/probar`,
            afd: `${API}/api/telemetria/convertir`,
            minimizado: `${API}/api/telemetria/minimizar`,
        },
    },
    ecommerce: {
        nombre: "Ecommerce",
        descripcion: "HOME → SEARCH* → CART",
        ejemplo: "HOME,SEARCH,CART",
        ayuda: "Ej: HOME,SEARCH,CART — búsquedas opcionales.",
        endpoints: {
            afnd: `${API}/api/ecommerce/afnd`,
            probar: `${API}/api/ecommerce/probar`,
            afd: `${API}/api/ecommerce/convertir`,
            minimizado: `${API}/api/ecommerce/minimizar`,
        },
    },
    adn: {
        nombre: "ADN",
        descripcion: "K → G → X* → F",
        ejemplo: "K,G,X,F",
        ayuda: "Ej: K,G,X,F — X puede repetirse.",
        endpoints: {
            afnd: `${API}/api/adn/afnd`,
            probar: `${API}/api/adn/probar`,
            afd: `${API}/api/adn/convertir`,
            minimizado: `${API}/api/adn/minimizar`,
        },
    },
};

/* ── Estado global ── */
const ESTADO = {
    automataId: "telemetria",
    automata: null,
    analisis: null,
    pasoActual: 0,
    tabActivo: "afnd",
    reproduciendo: false,
    temporizador: null,
};

/* ── Nodos DOM ── */
const $ = (id) => document.getElementById(id);
const UI = {
    selectorAutomatas: $("selectorAutomatas"),
    entradaCadena: $("entradaCadena"),
    botonAnalizar: $("botonAnalizar"),
    botonEjemplo: $("botonEjemplo"),
    botonLimpiar: $("botonLimpiar"),
    botonAnterior: $("botonAnterior"),
    botonSiguiente: $("botonSiguiente"),
    botonReproducir: $("botonReproducir"),
    timelineRecorrido: $("timelineRecorrido"),
    vistaAutomata: $("vistaAutomata"),
    mensajeEstado: $("mensajeEstado"),
    etiquetaAutomata: $("etiquetaAutomata"),
    subtituloVista: $("subtituloVista"),
    estadoTipo: $("estadoTipo"),
    metricaEstados: $("metricaEstados"),
    metricaTransiciones: $("metricaTransiciones"),
    metricaTipo: $("metricaTipo"),
    metricaResultado: $("metricaResultado"),
    ayudaCadena: $("ayudaCadena"),
};

/* ══════════════════ UTILIDADES ══════════════════ */
function parsearCadena(texto) {
    return texto.split(",").map(v => v.trim()).filter(v => v !== "");
}
function textoEstados(valor) {
    if (!valor) return [];
    return String(valor).split(",").map(s => s.trim()).filter(s => s !== "");
}
function claveTransicion(origen, simbolo, destino) {
    return `${origen}||${simbolo}||${destino}`;
}
function mapaTransiciones(automata) {
    const mapa = new Map();
    for (const t of automata.transiciones || []) {
        if (!mapa.has(t.origen)) mapa.set(t.origen, new Map());
        const ps = mapa.get(t.origen);
        if (!ps.has(t.simbolo)) ps.set(t.simbolo, []);
        ps.get(t.simbolo).push(t.destino);
    }
    return mapa;
}
function simularDeterminista(automata, cadena) {
    const mapa = mapaTransiciones(automata);
    const rec = [];
    let cur = automata.estadoInicial || "";
    rec.push(cur);
    for (const s of cadena) {
        cur = cur ? (mapa.get(cur)?.get(s)?.[0] || "") : "";
        rec.push(cur);
    }
    return rec;
}
function esDeterminista(automata) {
    const visto = new Set();
    for (const t of automata.transiciones || []) {
        const k = `${t.origen}||${t.simbolo}`;
        if (visto.has(k)) return false;
        visto.add(k);
    }
    return true;
}
function pasoActivo(analisis, tipo, indice) {
    const serie = analisis?.[tipo]?.recorrido || [];
    if (!serie.length) return [];
    const val = serie[Math.min(indice, serie.length - 1)];
    return tipo === "afnd" ? textoEstados(val) : (val ? [val] : []);
}
function transicionesActivas(analisis, tipo, indice) {
    const automata = analisis?.[tipo]?.automata;
    const cadena = analisis?.cadena || [];
    const activas = new Set();
    if (!automata || indice === 0) return activas;
    const anterior = pasoActivo(analisis, tipo, indice - 1);
    const actual = pasoActivo(analisis, tipo, indice);
    const simbolo = cadena[indice - 1];
    for (const origen of anterior) {
        for (const t of automata.transiciones || []) {
            if (t.origen === origen && t.simbolo === simbolo && actual.includes(t.destino))
                activas.add(claveTransicion(t.origen, t.simbolo, t.destino));
        }
    }
    return activas;
}
function resultadoAceptado(automata, recorrido, tipo) {
    const ultimo = recorrido[recorrido.length - 1];
    if (!ultimo) return false;
    const finales = new Set(automata.estadosAceptacion || []);
    if (tipo === "afnd") return textoEstados(ultimo).some(e => finales.has(e));
    return finales.has(ultimo);
}

/* ══════════════════════════════════════════
   DIAGRAMA SVG
   - Layout lineal (izq → der) o en grilla
   - Flechas que tocan el perímetro del nodo
   - Bucles claramente visibles arriba del nodo
   - Aristas bidireccionales curvadas
══════════════════════════════════════════ */

const R = 30;      // radio del nodo
const PAD = 80;    // margen del viewBox

function calcularPosiciones(estados, W, H) {
    const n = estados.length;
    if (n === 0) return [];
    // Para hasta 6 estados: fila única horizontal
    // Para más: distribución en filas de 4
    const cols = n <= 6 ? n : 4;
    const rows = Math.ceil(n / cols);
    const cellW = (W - PAD * 2) / cols;
    const cellH = rows === 1 ? 0 : (H - PAD * 2) / (rows - 1);
    return estados.map((estado, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
            estado,
            x: PAD + cellW * col + cellW / 2,
            y: rows === 1 ? H / 2 : PAD + cellH * row,
        };
    });
}

/* Punto donde la línea desde (fx,fy) llega al perímetro del nodo (tx,ty) */
function borde(fx, fy, tx, ty, r = R) {
    const dx = tx - fx, dy = ty - fy;
    const d = Math.max(Math.hypot(dx, dy), 0.001);
    return { x: tx - (dx / d) * r, y: ty - (dy / d) * r };
}

/* Punto sobre cuadrática bezier en t */
function quadAt(ox, oy, cx, cy, dx, dy, t) {
    const mt = 1 - t;
    return {
        x: mt * mt * ox + 2 * mt * t * cx + t * t * dx,
        y: mt * mt * oy + 2 * mt * t * cy + t * t * dy,
    };
}

function renderEtiquetaEstado(estado) {
    const partes = String(estado).split(",");
    if (partes.length === 1) return `<tspan x="0" dy="0.35em">${partes[0]}</tspan>`;
    const step = 13;
    const offsetY = -((partes.length - 1) * step) / 2;
    return partes.map((p, i) =>
        `<tspan x="0" dy="${i === 0 ? offsetY : step}">${p}</tspan>`
    ).join("");
}

function renderDiagrama(automata, tipo, analisis, indice) {
    const estados = automata.estados || [];
    if (!estados.length) return '<div class="empty-state">Sin estados.</div>';

    const n = estados.length;
    const cols = n <= 6 ? n : 4;
    const rows = Math.ceil(n / cols);

    const W = Math.max(cols * 130 + PAD * 2, 500);
    const H = rows === 1 ? 180 : rows * 140 + PAD;

    const posiciones = calcularPosiciones(estados, W, H);
    const mapPos = new Map(posiciones.map(p => [p.estado, p]));
    const activos = new Set(pasoActivo(analisis, tipo, indice));
    const activasTrans = transicionesActivas(analisis, tipo, indice);

    // IDs únicos por diagrama para evitar colisiones entre SVGs
    const uid = tipo;

    /* ── Aristas ── */
    const paresCurvados = new Set();
    const selfCount = new Map();
    const edges = (automata.transiciones || []).map(t => {
        const o = mapPos.get(t.origen), d = mapPos.get(t.destino);
        if (!o || !d) return "";
        const esActiva = activasTrans.has(claveTransicion(t.origen, t.simbolo, t.destino));
        const arrowId = `arr_${uid}${esActiva ? "_a" : ""}`;
        const cls = `edge${esActiva ? " active" : ""}`;

        /* Bucle propio */
        if (t.origen === t.destino) {
            const k = t.origen;
            const idx = selfCount.get(k) || 0;
            selfCount.set(k, idx + 1);
            const lift = 62 + idx * 20;
            // Control points del arco
            const cpLx = o.x - lift * 0.8, cpLy = o.y - lift;
            const cpRx = o.x + lift * 0.8, cpRy = o.y - lift;
            const sx = o.x - R * 0.65, sy = o.y - R * 0.65;
            const ex = o.x + R * 0.65, ey = o.y - R * 0.65;
            const lx = o.x, ly = o.y - lift - 14;
            return `<g>
        <path class="${cls}" marker-end="url(#${arrowId})"
          d="M ${sx} ${sy} C ${cpLx} ${cpLy}, ${cpRx} ${cpRy}, ${ex} ${ey}"/>
        <text class="edge-label" x="${lx}" y="${ly}" text-anchor="middle">${t.simbolo}</text>
      </g>`;
        }

        /* Determinar si hay arista inversa para curvar */
        const hayInversa = (automata.transiciones || []).some(
            x => x.origen === t.destino && x.destino === t.origen
        );
        const parKey = [t.origen, t.destino].sort().join("||");
        const yaVisto = paresCurvados.has(parKey);
        if (hayInversa) paresCurvados.add(parKey);

        // Sentido de curvatura: primera arista arriba, segunda abajo
        const lado = (!hayInversa) ? 0 : (yaVisto ? -1 : 1);
        const curvAmt = 45;

        const dx = d.x - o.x, dy = d.y - o.y;
        const len = Math.max(Math.hypot(dx, dy), 1);
        const nx = -dy / len, ny = dx / len;

        // Punto de control
        const cpx = (o.x + d.x) / 2 + nx * lado * curvAmt;
        const cpy = (o.y + d.y) / 2 + ny * lado * curvAmt;

        // Inicio sobre perímetro del origen → hacia cp
        const s = borde(cpx, cpy, o.x, o.y, R);
        // Fin sobre perímetro del destino
        // Evaluar dirección de llegada con t≈0.9 de la curva
        const near = quadAt(s.x, s.y, cpx, cpy, d.x, d.y, 0.9);
        const e = borde(near.x, near.y, d.x, d.y, R);

        // Etiqueta: desplazada en la dirección normal
        const labelOffset = hayInversa ? 18 : 14;
        const lx = cpx + nx * lado * labelOffset;
        const ly = cpy + ny * lado * labelOffset - (hayInversa ? 0 : 4);

        return `<g>
      <path class="${cls}" marker-end="url(#${arrowId})"
        d="M ${s.x} ${s.y} Q ${cpx} ${cpy} ${e.x} ${e.y}"/>
      <text class="edge-label" x="${lx}" y="${ly}" text-anchor="middle">${t.simbolo}</text>
    </g>`;
    }).join("");

    /* ── Nodos ── */
    const nodes = posiciones.map(p => {
        const isFinal = (automata.estadosAceptacion || []).includes(p.estado);
        const isInitial = automata.estadoInicial === p.estado;
        const isActive = activos.has(p.estado);
        return `<g class="node${isFinal ? " final" : ""}${isInitial ? " initial" : ""}${isActive ? " active" : ""}"
      transform="translate(${p.x},${p.y})">
      <circle class="node-circle" r="${R}"/>
      ${isFinal ? `<circle class="node-ring" r="${R - 6}" fill="none"/>` : ""}
      <text text-anchor="middle" dominant-baseline="central">${renderEtiquetaEstado(p.estado)}</text>
    </g>`;
    }).join("");

    /* ── Flecha de inicio ── */
    const ip = mapPos.get(automata.estadoInicial) || posiciones[0];
    const ax = ip.x - R - 40;
    const initArrow = ip ? `<g>
    <line class="edge init-arrow" x1="${ax}" y1="${ip.y}" x2="${ip.x - R - 2}" y2="${ip.y}"
      marker-end="url(#arr_${uid})"/>
    <text class="edge-label" x="${ax}" y="${ip.y - 12}" text-anchor="middle" font-size="11">inicio</text>
  </g>` : "";

    return `<div class="diagram-box">
    <svg class="diagram" viewBox="0 0 ${W} ${H}"
      xmlns="http://www.w3.org/2000/svg"
      style="min-height:${H}px"
      aria-label="Diagrama de autómata ${tipo}">
      <defs>
        <marker id="arr_${uid}" viewBox="0 0 10 10" markerWidth="7" markerHeight="7"
          refX="8" refY="5" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(160,190,215,0.9)"/>
        </marker>
        <marker id="arr_${uid}_a" viewBox="0 0 10 10" markerWidth="7" markerHeight="7"
          refX="8" refY="5" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#ff9f45"/>
        </marker>
      </defs>
      ${initArrow}
      ${edges}
      ${nodes}
    </svg>
  </div>`;
}

/* ══════════════════ TABLAS ══════════════════ */
function renderTablaEstados(automata, tipo, analisis, indice) {
    const activos = new Set(pasoActivo(analisis, tipo, indice));
    const rows = (automata.estados || []).map(e => {
        const activo = activos.has(e);
        return `<tr class="${activo ? "active-row" : ""}">
      <td>${e}</td>
      <td>${automata.estadoInicial === e ? "✓" : ""}</td>
      <td>${(automata.estadosAceptacion || []).includes(e) ? "✓" : ""}</td>
      <td>${activo ? "●" : ""}</td>
    </tr>`;
    }).join("");
    return `<div class="table-block">
    <div class="table-block-header"><span class="table-block-title">Estados</span></div>
    <div class="table-scroll">
      <table class="tbl">
        <thead><tr><th>Estado</th><th>Inicial</th><th>Acept.</th><th>Activo</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function renderTablaTransiciones(automata, tipo, analisis, indice) {
    const alfabeto = automata.alfabeto || [];
    const mapa = mapaTransiciones(automata);
    const activas = transicionesActivas(analisis, tipo, indice);
    const headerCols = alfabeto.map(s => `<th>${s}</th>`).join("");
    const rows = (automata.estados || []).map(e => {
        const cols = alfabeto.map(s => {
            const dests = mapa.get(e)?.get(s) || [];
            const val = dests.length ? dests.join(", ") : "∅";
            const esActiva = dests.some(d => activas.has(claveTransicion(e, s, d)));
            return `<td class="${esActiva ? "active-cell" : ""}">${val}</td>`;
        }).join("");
        return `<tr><td>${e}</td>${cols}</tr>`;
    }).join("");
    return `<div class="table-block">
    <div class="table-block-header"><span class="table-block-title">Transiciones δ</span></div>
    <div class="table-scroll">
      <table class="tbl">
        <thead><tr><th>Estado</th>${headerCols}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ══════════════════ RESULT BANNER ══════════════════ */
function renderResultBanner(analisis) {
    const aceptada = resultadoAceptado(
        analisis.afnd.automata, analisis.afnd.recorrido, "afnd"
    );
    const cadena = analisis.cadena;
    const cls = aceptada ? "accepted" : "rejected";
    const icono = aceptada ? "✓" : "✕";
    const titulo = aceptada ? "CADENA ACEPTADA" : "CADENA RECHAZADA";
    const tokens = cadena.length
        ? cadena.map(t => `<span class="token">${t}</span>`).join("")
        : `<span class="token muted-token">∅ cadena vacía — estado inicial</span>`;
    return `<div class="result-banner ${cls}">
    <div class="result-icon">${icono}</div>
    <div class="result-text">
      <strong>${titulo}</strong>
      <span>Recorrido sobre el AFND original</span>
      <div class="cadena-tokens">${tokens}</div>
    </div>
  </div>`;
}

/* ══════════════════ PANEL ══════════════════ */
function renderPanel(nombre, tipo, analisis, indice) {
    const automata = analisis[tipo].automata;
    const recorrido = analisis[tipo].recorrido;
    const aceptada = resultadoAceptado(automata, recorrido, tipo);
    const determinista = esDeterminista(automata);
    const tag = tipo === "afnd" ? "Original" : tipo === "afd" ? "Antes de minimizar" : "Minimizado";

    return `<div class="automata-panel">
    <div class="automata-panel-header">
      <div>
        <h3>${nombre}</h3>
        <div class="meta">${tag}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <span class="status-badge status-neutral">Estados: ${(automata.estados || []).length}</span>
        <span class="status-badge status-neutral">Trans.: ${(automata.transiciones || []).length}</span>
        <span class="status-badge ${determinista ? "status-ok" : "status-bad"}">${determinista ? "AFD" : "AFND"}</span>
        <span class="status-badge ${aceptada ? "status-ok" : "status-bad"}">${aceptada ? "Aceptada ✓" : "Rechazada ✗"}</span>
      </div>
    </div>

    <!-- Diagrama a ancho completo -->
    <div class="diagram-wrap">
      ${renderDiagrama(automata, tipo, analisis, indice)}
    </div>

    <!-- Tablas debajo -->
    <div class="tables-row">
      ${renderTablaEstados(automata, tipo, analisis, indice)}
      ${renderTablaTransiciones(automata, tipo, analisis, indice)}
    </div>
  </div>`;
}

/* ══════════════════ TABS ══════════════════ */
const TABS = [
    { id: "afnd", label: "AFND", badge: "Original" },
    { id: "afd", label: "AFD", badge: "Det." },
    { id: "minimizado", label: "Minimizado", badge: "Min." },
];

function renderTabsBar(analisis) {
    return `<div class="tabs-bar" id="tabsBar">
    ${TABS.map(t => {
        const acep = resultadoAceptado(analisis[t.id].automata, analisis[t.id].recorrido, t.id);
        const dot = acep ? "🟢" : "🔴";
        return `<button class="tab-btn ${ESTADO.tabActivo === t.id ? "active" : ""}"
        data-tab="${t.id}" type="button">
        ${t.label} <span class="tab-badge">${t.badge}</span> ${dot}
      </button>`;
    }).join("")}
  </div>`;
}

/* ══════════════════ TIMELINE ══════════════════ */
function renderTimeline(analisis) {
    const cadena = analisis?.cadena || [];
    const pasos = analisis?.afnd?.recorrido?.length || 0;
    if (!pasos) { UI.timelineRecorrido.innerHTML = ""; return; }
    UI.timelineRecorrido.innerHTML = Array.from({ length: pasos }, (_, i) => {
        const etiqueta = i === 0 ? "Inicio" : cadena[i - 1] || "∅";
        const estados = pasoActivo(analisis, "afnd", i).join(", ") || "∅";
        return `<button class="step-chip ${ESTADO.pasoActual === i ? "active" : ""}" data-step="${i}" type="button">
      <div class="small">Paso ${i}</div>
      <div>${etiqueta}</div>
      <div class="small">${estados}</div>
    </button>`;
    }).join("");
}

/* ══════════════════ RESUMEN / MÉTRICAS ══════════════════ */
function actualizarResumen(automata, analisis) {
    UI.etiquetaAutomata.textContent = automata.nombre;
    UI.subtituloVista.textContent = `${automata.descripcion}. ${automata.ayuda}`;
    UI.estadoTipo.textContent = "AFND / AFD";
    UI.metricaEstados.textContent = String((analisis.afnd.automata.estados || []).length);
    UI.metricaTransiciones.textContent = String((analisis.afnd.automata.transiciones || []).length);
    UI.metricaTipo.textContent = esDeterminista(analisis.afnd.automata) ? "N/A" : "AFND";

    const aceptada = resultadoAceptado(analisis.afnd.automata, analisis.afnd.recorrido, "afnd");
    UI.metricaResultado.textContent = aceptada ? "Aceptada" : "Rechazada";
    UI.mensajeEstado.className = `alert-shell ${aceptada ? "ok" : "bad"}`;
    UI.mensajeEstado.innerHTML = `
    <strong>${aceptada ? "CADENA ACEPTADA ✓" : "CADENA RECHAZADA ✗"}</strong>
    <div class="compact-note">${automata.descripcion}</div>`;
}

/* ══════════════════ RENDERIZADO PRINCIPAL ══════════════════ */
function mostrarVistaEspera(msg = "") {
    UI.vistaAutomata.innerHTML = `<div class="empty-state">${msg || "Escribe una cadena y pulsa <strong>Analizar</strong>."}</div>`;
    UI.timelineRecorrido.innerHTML = "";
}

function renderizarVista() {
    if (!ESTADO.analisis) {
        mostrarVistaEspera();
        return;
    }
    const a = ESTADO.analisis;
    const banner = renderResultBanner(a);
    const tabsBar = renderTabsBar(a);
    const panelMap = {
        afnd: () => renderPanel("AFND original", "afnd", a, ESTADO.pasoActual),
        afd: () => renderPanel("AFD determinizado", "afd", a, ESTADO.pasoActual),
        minimizado: () => renderPanel("AFD minimizado", "minimizado", a, ESTADO.pasoActual),
    };
    const contenido = (panelMap[ESTADO.tabActivo] || panelMap.afnd)();
    UI.vistaAutomata.innerHTML = banner + tabsBar + contenido;

    document.getElementById("tabsBar").addEventListener("click", e => {
        const btn = e.target.closest(".tab-btn");
        if (!btn) return;
        ESTADO.tabActivo = btn.dataset.tab;
        renderizarVista();
    });

    renderTimeline(a);
    actualizarResumen(ESTADO.automata, a);
    UI.botonAnterior.disabled = ESTADO.pasoActual <= 0;
    UI.botonSiguiente.disabled = ESTADO.pasoActual >= (a.afnd.recorrido.length - 1);
}

/* ══════════════════ REPRODUCCIÓN ══════════════════ */
function detenerReproduccion() {
    ESTADO.reproduciendo = false;
    clearInterval(ESTADO.temporizador);
    ESTADO.temporizador = null;
    UI.botonReproducir.textContent = "▷";
}
function avanzarPaso(delta) {
    if (!ESTADO.analisis) return;
    const max = ESTADO.analisis.afnd.recorrido.length - 1;
    ESTADO.pasoActual = Math.min(Math.max(ESTADO.pasoActual + delta, 0), max);
    renderizarVista();
}

/* ══════════════════ HINT DE INPUT ══════════════════ */
function setHint(texto, tipo = "neutral") {
    // tipo: "neutral" | "pending" | "ok" | "bad"
    if (!UI.ayudaCadena) return;
    UI.ayudaCadena.textContent = texto;
    UI.ayudaCadena.className = `compact-note hint-${tipo}`;
}

function actualizarHint() {
    const val = UI.entradaCadena.value.trim();
    if (val === "") {
        setHint(`Escribe una cadena. Ej: ${ESTADO.automata?.ejemplo || ""}`, "pending");
    } else {
        setHint(`Presiona Analizar o Enter para procesar.`, "pending");
    }
}

/* ══════════════════ SELECCIÓN DE AUTÓMATA ══════════════════ */
function seleccionarAutomata(id, primeraVez = false) {
    ESTADO.automataId = id;
    ESTADO.automata = AUTOMATAS[id];
    ESTADO.analisis = null;
    ESTADO.pasoActual = 0;

    document.querySelectorAll(".selector-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.automata === id)
    );

    UI.etiquetaAutomata.textContent = ESTADO.automata.nombre;
    UI.estadoTipo.textContent = "AFND / AFD";
    UI.entradaCadena.placeholder = ESTADO.automata.ejemplo;

    if (primeraVez) {
        // Arranque inicial: cargar el ejemplo directamente
        UI.entradaCadena.value = ESTADO.automata.ejemplo;
        analizarAutomata();
    } else {
        // Cambio de autómata: limpiar campo, NO analizar todavía
        UI.entradaCadena.value = "";
        actualizarHint();
        UI.mensajeEstado.className = "alert-shell";
        UI.mensajeEstado.innerHTML = `
      <strong>${ESTADO.automata.nombre}</strong>
      <div class="compact-note">${ESTADO.automata.descripcion}</div>`;
        mostrarVistaEspera(`Autómata <strong>${ESTADO.automata.nombre}</strong> listo. Escribe una cadena y pulsa <strong>Analizar</strong>.`);
    }
}

/* ══════════════════ ANÁLISIS ══════════════════ */
async function fetchJSON(url, opts = {}) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}
function normalizarAutomata(automata) {
    if (!automata?.estados) return automata;
    const inicial = automata.estadoInicial;
    const finales = new Set(automata.estadosAceptacion || []);
    // Ordenar: inicial primero, luego el resto alfabéticamente,
    // estados de aceptación al final
    const ordenados = [...automata.estados].sort((a, b) => {
        if (a === inicial) return -1;
        if (b === inicial) return 1;
        const aFinal = finales.has(a), bFinal = finales.has(b);
        if (aFinal && !bFinal) return 1;
        if (!aFinal && bFinal) return -1;
        return String(a).localeCompare(String(b));
    });
    return { ...automata, estados: ordenados };
}
async function analizarAutomata() {
    if (!ESTADO.automata) return;
    detenerReproduccion();
    setHint(ESTADO.automata.ayuda, "neutral");

    const cadena = parsearCadena(UI.entradaCadena.value);
    const cfg = ESTADO.automata.endpoints;

    UI.mensajeEstado.className = "alert-shell";
    UI.mensajeEstado.textContent = "Cargando datos del autómata…";
    UI.vistaAutomata.innerHTML = '<div class="empty-state">Cargando…</div>';

    try {
        const [afnd, afd, minimizado, simAfnd] = await Promise.all([
            fetchJSON(cfg.afnd),
            fetchJSON(cfg.afd),
            fetchJSON(cfg.minimizado),
            fetchJSON(cfg.probar, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cadena }),
            }),
        ]);

        ESTADO.analisis = {
            cadena,
            afnd: { automata: afnd, recorrido: simAfnd.recorrido || [] },
            afd: { automata: normalizarAutomata(afd), recorrido: simularDeterminista(afd, cadena) },
            minimizado: { automata: normalizarAutomata(minimizado), recorrido: simularDeterminista(minimizado, cadena) },
        };
        ESTADO.pasoActual = 0;
        renderizarVista();
    } catch (err) {
        UI.mensajeEstado.className = "alert-shell bad";
        UI.mensajeEstado.innerHTML = `
      <strong>No se pudo cargar la simulación</strong>
      <div class="compact-note">Verifica que el backend esté en el puerto 8080.</div>`;
        UI.vistaAutomata.innerHTML = '<div class="empty-state">Error al obtener los datos.</div>';
    }
}

/* ══════════════════ EVENTOS ══════════════════ */

// Selector de autómata — NO analiza al cambiar
UI.selectorAutomatas.addEventListener("click", e => {
    const btn = e.target.closest(".selector-btn");
    if (!btn || btn.dataset.automata === ESTADO.automataId) return;
    seleccionarAutomata(btn.dataset.automata, false);
});

// Analizar (click explícito)
UI.botonAnalizar.addEventListener("click", analizarAutomata);

// Cargar ejemplo
UI.botonEjemplo.addEventListener("click", () => {
    if (!ESTADO.automata) return;
    UI.entradaCadena.value = ESTADO.automata.ejemplo;
    analizarAutomata();
});

// Limpiar — NO dispara análisis, solo resetea
UI.botonLimpiar.addEventListener("click", () => {
    UI.entradaCadena.value = "";
    ESTADO.analisis = null;
    ESTADO.pasoActual = 0;
    detenerReproduccion();
    actualizarHint();
    UI.mensajeEstado.className = "alert-shell";
    UI.mensajeEstado.innerHTML = `
    <strong>${ESTADO.automata?.nombre || "Autómata"}</strong>
    <div class="compact-note">Escribe una cadena y presiona Analizar.</div>`;
    mostrarVistaEspera();
});

UI.botonAnterior.addEventListener("click", () => avanzarPaso(-1));
UI.botonSiguiente.addEventListener("click", () => avanzarPaso(1));

UI.botonReproducir.addEventListener("click", () => {
    if (!ESTADO.analisis) return;
    if (ESTADO.reproduciendo) { detenerReproduccion(); renderizarVista(); return; }
    ESTADO.reproduciendo = true;
    UI.botonReproducir.textContent = "⏸";
    ESTADO.temporizador = setInterval(() => {
        const max = ESTADO.analisis.afnd.recorrido.length - 1;
        if (ESTADO.pasoActual >= max) { detenerReproduccion(); renderizarVista(); return; }
        ESTADO.pasoActual += 1;
        renderizarVista();
    }, 1100);
});

UI.timelineRecorrido.addEventListener("click", e => {
    const btn = e.target.closest(".step-chip");
    if (!btn || !ESTADO.analisis) return;
    ESTADO.pasoActual = Number(btn.dataset.step);
    renderizarVista();
});

// Input: actualizar hint, NO analizar automáticamente
UI.entradaCadena.addEventListener("input", actualizarHint);

// Enter en el input → analizar
UI.entradaCadena.addEventListener("keydown", e => {
    if (e.key === "Enter") analizarAutomata();
});

/* ── Arranque ── */
document.addEventListener("DOMContentLoaded", () => {
    seleccionarAutomata("telemetria", true);
});