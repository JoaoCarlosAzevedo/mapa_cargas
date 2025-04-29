import twebchannel from "./twebchannel.js";

twebchannel.connect(() => {
  console.log("Websocket Connected!");
});

twebchannel.onReceiveAdvplToJs(function (key, value) {
  console.log("KEY: " + key + " VALUE: " + value);
});

twebchannel.advplToJs = function (key, value) {
  console.log("KEY: " + key + " VALUE: " + value);

  if (key == "JSON") {
    loadData(value);
  }

  if (key == "ADDITEM") {
    addItem(value);
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

twebchannel.connect(() => {
  console.log("Websocket Connected!");
});

var map = L.map("map").setView([-21.3712, -45.5117], 6); // Centraliza em São Paulo

// Adicionando o mapa base do OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// define uma funcao para recebimento dos advplToJs
twebchannel.advplToJs = function (key, value) {
  if (key === "JSON_INI") {
    refreshLocations(value);
  }

  if (key === "JSON") {
    refreshLocations(value);
  }
};

let markersLayer = L.layerGroup().addTo(map);

// Função para carregar locais   do JSON
function refreshLocations(locationsString) {
  let locations = JSON.parse(locationsString);

  markersLayer.clearLayers(); // Remove antigos marcadores

  locations.forEach((location) => {
    let marker = L.marker([location.lat, location.lng], {
    //icon: location.marcado ? customIcons.changed : customIcons.default,
    icon: customIcons[location.legenda]
    });

      let popupContent = `
        <div style="font-size: 14px; line-height: 1.4; word-break: break-word;">
        <h3 style="margin: 0;">${location.UF} - ${location.CIDADE}</h3>
        <b>${location.title}</b> 
        <div><b>Pedido:</b> ${location.ID}</div>
        <div><b>Status Ped.:</b> ${location.status}</div>
        <div><b>Produto:</b> ${location.produto}</div>
        <div><b>Entrega:</b> ${location.entrega}</div>
        <div><b>Quant.:</b> ${location.quantidade.toFixed(0)}</div>
        <div><b>Obs.:</b> ${location.obs}</div>
        <div><b>Veículo:</b> ${location.placa}</div>
        </div>
    `;
 
    marker.on("mouseover", () => marker.bindPopup(popupContent).openPopup());
    marker.on("mouseout", () => marker.closePopup());

    marker.on("click", () => {
      twebchannel.jsToAdvpl("MARK", location.ID);
    });

    markersLayer.addLayer(marker); // Adiciona à camada
  }); 
}


