import twebchannel from './twebchannel.js';
 
twebchannel.connect( () => { console.log('Websocket Connected!'); } );

twebchannel.onReceiveAdvplToJs(function (key, value) {
    console.log("KEY: " + key + " VALUE: " + value);
}); 

twebchannel.advplToJs = function(key, value) {
    console.log("KEY: " + key + " VALUE: " + value);

    if(key == "JSON") {
        loadData(value)
    }  

    if(key == "ADDITEM") {
        addItem(value)
    }  
} 



function addItem(json) {
        let item = JSON.parse(json);

        const supplyList = document.getElementById('supplyList');

        let countNew = data.supplies.push(item);

        const supplyItem = document.createElement('div');

        supplyItem.className = 'supply-item';
        supplyItem.innerHTML = ` 
            <input type="checkbox" data-index="${countNew - 1 }">
            <div class="supply-details">
                <div class="supply-type">${item.type}... ${item.date}</div>
                <div class="supply-info">${item.driver}... ${item.time} R$ ${item.price.toFixed(2)}</div>
                <div class="supply-info">${item.total.toFixed(2)}</div>
                <div class="bico">Bico: ${item.bico}</div>
            </div>
        `;
        supplyList.appendChild(supplyItem);

}

function loadData(json) {  
    let data = JSON.parse(json);

    const supplyList = document.getElementById('supplyList');

        // Create supply items
        data.supplies.forEach((supply, index) => {
            const supplyItem = document.createElement('div');
            supplyItem.className = 'supply-item';
            supplyItem.innerHTML = `
                <input type="checkbox" data-index="${index}">
                <div class="supply-details">
                    <div class="supply-type">${supply.type}... ${supply.date}</div>
                    <div class="supply-info">${supply.driver}... ${supply.time} R$ ${supply.price.toFixed(2)}</div>
                    <div class="supply-info">${supply.total.toFixed(2)}</div>
                    <div class="bico">Bico: ${supply.bico}</div>
                </div>
            `;
            supplyList.appendChild(supplyItem);
        });

    

        // Get checked items functionality
        const getCheckedBtn = document.getElementById('getCheckedBtn');
        getCheckedBtn.addEventListener('click', function () {
            const checkedBoxes = document.querySelectorAll('.supply-item input[type="checkbox"]:checked');
            const checkedItems = Array.from(checkedBoxes).map(checkbox => {
                const index = checkbox.getAttribute('data-index');
                return data.supplies[index];
            });

            if (checkedItems.length > 0) {
                console.log('Itens selecionados:', checkedItems);

                twebchannel.jsToAdvpl("MARK", checkedItems); 

                alert(`${checkedItems.length} item(s) selecionado(s)! Verifique o console para detalhes.`);
            } else {
                alert('Nenhum item selecionado!');
            }
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            const supplyItems = document.querySelectorAll('.supply-item');

            console.log( supplyItems ) 

            supplyItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });

}