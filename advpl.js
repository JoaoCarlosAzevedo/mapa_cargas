import twebchannel from "./twebchannel.js";

twebchannel.connect(() => {
  console.log("Websocket Connected!");
});

twebchannel.onReceiveAdvplToJs(function (key, value) {

});

twebchannel.advplToJs = function (key, value) {


  if (key == "JSON") {
    loadData(value);
  }

  if (key == "ADDITEM") {
    addItem(value);
  }

  if (key == "GETAFERI") {
    markAferidos();
  }
};

var data;

  // Get checked items functionality
  const getCheckedBtn = document.getElementById("getCheckedBtn");
  getCheckedBtn.addEventListener("click", function () {
    const checkedBoxes = document.querySelectorAll(
      '.supply-item input[type="checkbox"]:checked'
    );
    const checkedItems = Array.from(checkedBoxes).map((checkbox) => {
      const index = checkbox.getAttribute("data-index");
      return data.supplies[index];
    });

    if (checkedItems.length > 0) {
 

      twebchannel.jsToAdvpl("MARK", checkedItems);

      //alert(`${checkedItems.length} item(s) selecionado(s)! Verifique o console para detalhes.`);
    } else {
      //alert('Nenhum item selecionado!');
    }
  });
  
function markAferidos() {
  const checkedBoxes = document.querySelectorAll(
    '.supply-item input[type="checkbox"]:checked'
  );
  const checkedItems = Array.from(checkedBoxes).map((checkbox) => {
    const index = checkbox.getAttribute("data-index");
    return data.supplies[index];
  });

  if (checkedItems.length > 0) {


    twebchannel.jsToAdvpl("MARK_AFERIDOS", checkedItems);
  }  
}

function addItem(json) {
  let item = JSON.parse(json);
  const supplyList = document.getElementById("supplyList");

  let countNew = data.supplies.push(item); // Mantém lógica original

  const supplyItem = document.createElement("div");
  supplyItem.className = "supply-item newly-added"; // Aplica classe de animação

  supplyItem.innerHTML = ` 
        <input type="checkbox" data-index="${countNew - 1}">
        <div class="supply-details">
            <div class="supply-type">⛽ ${item.type}</div>

            <div class="supply-info">
                <span class="label">Frentista:</span> <span class="value">${
                  item.driver
                }</span>
            </div>

            <div class="supply-info">
                <span class="label">Litros:</span> <span class="value">${item.liters.toFixed(
                  3
                )}</span> |
                <span class="label">Valor:</span> <span class="value">R$ ${item.price.toFixed(
                  2
                )}</span>
            </div>

            <div class="supply-info">
                <span class="label">Total:</span> <span class="value destaque">R$ ${item.total.toFixed(
                  2
                )}</span> | <span class="label">Pagamento:</span> <span class="value"> ${item.tppag} </span>
            </div>

            <div class="bico">🚰 Bico: ${item.bico}</div>
            <div class="supply-date">${item.date} - ${item.time}</div>
        </div>
    `;

  // supplyList.prepend(supplyItem); // adiciona no topo
  supplyList.appendChild(supplyItem); // adiciona no final da lista

  // Remove classe de destaque após 2 segundos
  setTimeout(() => {
    supplyItem.classList.remove("newly-added");
  }, 2000);
}

function loadData(json) {
  data = JSON.parse(json);

  const supplyList = document.getElementById("supplyList");

  // Limpar o conteúdo existente
  supplyList.innerHTML = "";

  // Create supply items
  data.supplies.forEach((supply, index) => {
    const supplyItem = document.createElement("div");
    supplyItem.className = "supply-item";
    supplyItem.innerHTML = `
    <input type="checkbox" data-index="${index}">
    <div class="supply-details">
        <div class="supply-type">⛽ ${supply.type}</div>

        <div class="supply-info">
            <span class="label">Frentista:</span> <span class="value">${
              supply.driver
            }</span>
        </div>

        <div class="supply-info">
            <span class="label">Litros:</span> <span class="value">${supply.liters.toFixed(
              3
            )}</span> |
            <span class="label">Valor:</span> <span class="value">R$ ${supply.price.toFixed(
              2
            )}</span>
        </div>

        <div class="supply-info">
            <span class="label">Total:</span> <span class="value destaque">R$ ${supply.total.toFixed(
              2
            )}</span> | <span class="label">Pagamento:</span> <span class="value"> ${supply.tppag} </span>
        </div> 

        <div class="bico">🚰 Bico: ${supply.bico}</div>
        <div class="supply-date">${supply.date} - ${supply.time}</div>
    </div>
`;
    supplyList.appendChild(supplyItem);
  });



  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const supplyItems = document.querySelectorAll(".supply-item");


    supplyItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });
  });
}
