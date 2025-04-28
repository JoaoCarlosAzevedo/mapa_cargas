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
  default: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  changed: L.icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
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
      icon: location.marcado ? customIcons.changed : customIcons.default,
    });

 /*    let popupContent = `
            <h3>${location.UF} - ${location.CIDADE}</h3>
            <b>${location.title}</b> 
            <br><b>Pedido:</b> ${location.ID}
            <br><b>Produto:</b> ${location.produto}
            <br><b>Entrega:</b> ${location.entrega}
            <br><b>Quant.:</b> ${location.quantidade.toFixed(0)}
            <br><b>Obs:</b> ${location.obs}
            <br><b>Veículo:</b> ${location.placa}
        `; */
      let popupContent = `
        <div style="font-size: 14px; line-height: 1.4; word-break: break-word;">
        <h3 style="margin: 0;">${location.UF} - ${location.CIDADE}</h3>
        <b>${location.title}</b> 
        <div><b>Pedido:</b> ${location.ID}</div>
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

// Função para carregar locais   do JSON
//function loadLocations() {
//    fetch('locations.json')
//        .then(response => response.json())
//        .then(locations => {
//            locations.forEach(location => {
//                let marker = L.marker([location.lat, location.lng], { icon: customIcons.default })
//                    .addTo(map)
//                /*     .bindPopup(`
//                        <h3>${location.UF} - ${location.CIDADE}</h3>
//                        <b>${location.title}</b>
//                        <br>
//                        <b>Pedido ${location.ID}</b>
//                        `); */
//
//                let popupContent = `
//                        <h3>${location.UF} - ${location.CIDADE}</h3>
//                        <b>${location.title}</b>
//                        <br>
//                        <b>Pedido ${location.ID}</b>
//                        `;
//                // Exibir popup ao passar o mouse
//                marker.on('mouseover', function () {
//                    marker.bindPopup(popupContent).openPopup();
//                });
//
//                // Fechar popup ao tirar o mouse
//                marker.on('mouseout', function () {
//                    marker.closePopup();
//                });
//
//
//                // Evento de clique no marcador para exibir no console
//                   marker.on('click', function () {
//
//                       twebchannel.jsToAdvpl("MARK", location.ID);
//                       //let currentIcon = marker.options.icon;
//                        //marker.setIcon(currentIcon === customIcons.default ? customIcons.changed : customIcons.default);
//
//                   });
//                   //twebchannel.jsToAdvpl("KEY", "YAHOOOO!");
//            });
//        })
//        .catch(error => console.error("Erro ao carregar locais:", error));
//};
//
//loadLocations(); //
