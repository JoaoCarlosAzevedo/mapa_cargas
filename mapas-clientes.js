import twebchannel from "./twebchannel.js";

twebchannel.connect(() => {
  console.log("Websocket Connected!");
});

twebchannel.onReceiveAdvplToJs(function (key, value) {
  console.log("KEY: " + key + " VALUE: " + value);
});


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
};

// Função para carregar locais   do JSON
function refreshLocations(locationsString) {
  let locations = JSON.parse(locationsString);

// Adicionar camada de tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  locations.forEach((location) => {
     // Criar marcador para cada localização
    let marker = L.marker([location.lat, location.lng]).addTo(map);

    // Criar conteúdo do popup
    let popupContent = `<b>${location.title}</b><br>
                            Latitude: ${location.lat}<br>
                            Longitude: ${location.lng}`;

      // Adicionar popup ao marcador
      marker.bindPopup(popupContent);

      // Mostrar popup ao passar o mouse
      marker.on('mouseover', function () {
          marker.openPopup();
      });

      // Fechar popup ao sair do mouse
      marker.on('mouseout', function () {
          marker.closePopup();
      });

    //markersLayer.addLayer(marker); // Adiciona à camada
  }); 
}


 