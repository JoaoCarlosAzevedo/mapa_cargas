import twebchannel from "./twebchannel.js";
/* 
fetch("locations.json")
  .then((response) => (response.ok ? response.text() : null))
  .then((text) => {
    if (text) refreshLocations(text);
  })
  .catch(() => {}); */

twebchannel.connect(() => { 
  console.log("Websocket Connected!");
});

twebchannel.onReceiveAdvplToJs(function (key, value) {
  console.log("KEY: " + key + " VALUE: " + value);
});

twebchannel.advplToJs = function (key, value) {
  console.log("KEY: " + key + " VALUE: " + value);

  if (key === "JSON_INI" || key === "JSON") {
    refreshLocations(value);
  }
};

// Ícones personalizados para os marcadores
var customIcons = {
  red: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  green: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  yellow: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  blue: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

/** Cores do botão “Marcar” alinhadas à legenda do ícone do marcador */
var legendaButtonStyle = {
  red: { bg: "#e53935", color: "#fff" },
  green: { bg: "#43a047", color: "#fff" },
  yellow: { bg: "#fdd835", color: "#333" },
  blue: { bg: "#1e88e5", color: "#fff" },
};

var map = L.map("map").setView([-21.3712, -45.5117], 6); // Centraliza em São Paulo

// Adicionando o mapa base do OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

function coordKey(lat, lng) {
  return `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
}

/** Agrupa pedidos pela mesma lat/lng (mesmo ponto no mapa). */
function groupByCoordinates(locations) {
  const groups = new Map();
  for (const loc of locations) {
    const key = coordKey(loc.lat, loc.lng);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(loc);
  }
  return [...groups.values()];
}

function formatQuantidade(q) {
  const n = Number(q);
  return Number.isFinite(n) ? n.toFixed(0) : String(q ?? "");
}

function markButtonLabel(loc) {
  return loc.marcado === true ? "Desmarcar Pedido" : "Marcar Pedido";
}

function pedidoDetailsHtml(location) {
  return `
        <b>${location.title}</b>
        <div><b>Pedido:</b> ${location.ID}</div>
        <div><b>Status Ped.:</b> ${location.status}</div>
        <div><b>Produto:</b> ${location.produto}</div>
        <div><b>Entrega:</b> ${location.entrega}</div>
        <div><b>Quant.:</b> ${formatQuantidade(location.quantidade)}</div>
        <div><b>Obs.:</b> ${location.obs}</div>
        <div><b>Veículo:</b> ${location.placa}</div>`;
}

function buildGroupedPopupHtml(items) {
  const first = items[0];
  const n = items.length;
  const head = `
        <h3 style="margin: 0 0 8px 0;">${first.UF} - ${first.CIDADE}</h3>
        <div style="font-size: 12px; color: #555; margin-bottom: 8px;">${n} pedido(s) neste ponto</div>`;

  if (n === 1) {
    return `
        <div style="font-size: 14px; line-height: 1.4; word-break: break-word;">
        ${head}
        ${pedidoDetailsHtml(first)}
        </div>`;
  }

  const btn = legendaButtonStyle[first.legenda] || legendaButtonStyle.blue;
  const markBtn = `
            <button type="button" class="mapa-popup-mark" style="margin-top:10px;width:100%;box-sizing:border-box;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;background:${btn.bg};color:${btn.color};">
              ${markButtonLabel(first)}
            </button>`;

  return `
        <div class="mapa-popup-wrap" style="display:flex;flex-direction:row;align-items:stretch;gap:6px;max-width:360px;font-size:14px;line-height:1.4;word-break:break-word;">
          <button type="button" class="mapa-popup-prev" aria-label="Pedido anterior" style="flex:0 0 auto;align-self:center;border:1px solid #ccc;background:#f5f5f5;border-radius:6px;cursor:pointer;font-size:22px;line-height:1;padding:4px 10px;">‹</button>
          <div class="mapa-popup-main" style="flex:1;min-width:0;">
            ${head}
            <div class="mapa-popup-body">${pedidoDetailsHtml(first)}</div>
            <div class="mapa-popup-counter" style="text-align:center;font-size:11px;color:#666;margin-top:8px;">1 / ${n}</div>
            ${markBtn}
          </div>
          <button type="button" class="mapa-popup-next" aria-label="Próximo pedido" style="flex:0 0 auto;align-self:center;border:1px solid #ccc;background:#f5f5f5;border-radius:6px;cursor:pointer;font-size:22px;line-height:1;padding:4px 10px;">›</button>
        </div>`;
}

function updateGroupedPopupBody(marker) {
  const popup = marker.getPopup();
  const el = popup && popup.getElement();
  if (!el || !marker._pedidosGrupo) return;

  const items = marker._pedidosGrupo;
  const i = marker._pedidoIndex ?? 0;
  const loc = items[i];
  const body = el.querySelector(".mapa-popup-body");
  const counter = el.querySelector(".mapa-popup-counter");
  if (body) body.innerHTML = pedidoDetailsHtml(loc);
  if (counter) counter.textContent = `${i + 1} / ${items.length}`;
  const markBtnEl = el.querySelector(".mapa-popup-mark");
  if (markBtnEl) markBtnEl.textContent = markButtonLabel(loc);
}

function attachGroupedPopupNav(marker) {
  marker.on("popupopen", () => {
    const el = marker.getPopup().getElement();
    if (!el || !marker._pedidosGrupo || marker._pedidosGrupo.length < 2) return;

    marker._pedidoIndex = marker._pedidoIndex ?? 0;
    L.DomEvent.disableClickPropagation(el);

    const onNav = (ev) => {
      const t = ev.target;
      const items = marker._pedidosGrupo;
      if (t.closest(".mapa-popup-prev")) {
        marker._pedidoIndex = (marker._pedidoIndex - 1 + items.length) % items.length;
        updateGroupedPopupBody(marker);
        L.DomEvent.stop(ev);
      } else if (t.closest(".mapa-popup-next")) {
        marker._pedidoIndex = (marker._pedidoIndex + 1) % items.length;
        updateGroupedPopupBody(marker);
        L.DomEvent.stop(ev);
      } else if (t.closest(".mapa-popup-mark")) {
        emitMarkPedido(marker);
        L.DomEvent.stop(ev);
      }
    };

    L.DomEvent.on(el, "click", onNav);
    marker.once("popupclose", () => {
      L.DomEvent.off(el, "click", onNav);
    });
  });
}

/** Permite passar o mouse do marcador para o popup (ex.: setas) sem fechar. */
function bindHoverPopup(marker) {
  let closeTimer = null;
  const cancelClose = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(() => marker.closePopup(), 200);
  };

  marker.on("mouseover", () => {
    cancelClose();
    marker.openPopup();
  });
  marker.on("mouseout", scheduleClose);

  marker.on("popupopen", () => {
    const el = marker.getPopup().getElement();
    if (!el) return;
    L.DomEvent.on(el, "mouseenter", cancelClose);
    L.DomEvent.on(el, "mouseleave", scheduleClose);
    marker.once("popupclose", () => {
      L.DomEvent.off(el, "mouseenter", cancelClose);
      L.DomEvent.off(el, "mouseleave", scheduleClose);
    });
  });
}

function emitMarkPedido(marker) {
  const items = marker._pedidosGrupo;
  if (!items || !items.length) return;
  const idx = marker._pedidoIndex ?? 0;
  console.log("MARK: " + JSON.stringify(items[idx]) ); 
  twebchannel.jsToAdvpl("MARK", items[idx].recno);
}

// Função para carregar locais do JSON
function refreshLocations(locationsString) {
  let locations = JSON.parse(locationsString);

  markersLayer.clearLayers();

  const grupos = groupByCoordinates(locations);

  grupos.forEach((items) => {
    const first = items[0];
    const marker = L.marker([first.lat, first.lng], {
      icon: customIcons[first.legenda] || customIcons.blue,
    });

    marker._pedidosGrupo = items;
    marker._pedidoIndex = 0;

    const popupContent = buildGroupedPopupHtml(items);
    marker.bindPopup(popupContent, { maxWidth: 400 });
    attachGroupedPopupNav(marker);
    bindHoverPopup(marker);

    if (items.length === 1) {
      marker.on("click", () => emitMarkPedido(marker));
    }

    markersLayer.addLayer(marker);
  });
}
