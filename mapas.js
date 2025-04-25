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
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    changed: L.icon({
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    })
};

twebchannel.connect( () => { console.log('Websocket Connected!'); } );

var map = L.map('map').setView([-21.3712, -45.5117], 6); // Centraliza em São Paulo

// Adicionando o mapa base do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
  

// define uma funcao para recebimento dos advplToJs
twebchannel.advplToJs = function(key, value) {
    
    if(key==="JSON_INI") {
        refreshLocations(value);
    }

    if(key === "JSON") {
        refreshLocations(value);
    }  
}

// Função para carregar locais   do JSON
function refreshLocations(locationsString) { 
    let locations = JSON.parse(locationsString); 

    locations.forEach(location => { 
                let marker = L.marker([location.lat, location.lng], { icon: customIcons.default })
                    .addTo(map) 
                /*     .bindPopup(`
                        <h3>${location.UF} - ${location.CIDADE}</h3>
                        <b>${location.title}</b> 
                        <br>
                        <b>Pedido ${location.ID}</b>
                        `); */

                let popupContent = `
                        <h3>${location.UF} - ${location.CIDADE}</h3>
                        <b>${location.title}</b> 
                        <br>
                        <b>Pedido ${location.ID}</b> 
                        <br>
                        <b>Produto ${location.produto}</b>
                        <br>
                        <b>Entrega ${location.entrega}</b>
                        <br>
                        <b>Quant. ${location.quantidade.toFixed(0)}</b>
                        <br>
                        <b>Observação. ${location.obs}</b>
                        <br>
                        <b>Veiculo. ${location.placa}</b>
                        `;
                // Exibir popup ao passar o mouse
                marker.on('mouseover', function () {
                    marker.bindPopup(popupContent).openPopup();
                });

                // Fechar popup ao tirar o mouse
                marker.on('mouseout', function () {
                    marker.closePopup();
                });
                
                if (location.marcado) {
                    marker.setIcon(customIcons.changed);
                } else {
                    marker.setIcon(customIcons.default);
                }

                // Evento de clique no marcador para exibir no console
                   marker.on('click', function () {
                       
                       twebchannel.jsToAdvpl("MARK", location.ID); 
                       //let currentIcon = marker.options.icon;
                       // marker.setIcon(currentIcon === customIcons.default ? customIcons.changed : customIcons.default);
                 
                   }); 
                   //twebchannel.jsToAdvpl("KEY", "YAHOOOO!");
            });
};


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