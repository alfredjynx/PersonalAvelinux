// Listagem de storage
function getLocalStorageItems() {
    let items = {};
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      items[key] = value;
    }
    return items;
  }
  
// Browser fica esperando a chamada do popup.js pra retornar a lista de informações de storage
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLocalStorage") {
      const localStorageData = getLocalStorageItems();
      sendResponse({ data: localStorageData });
    }
  });



let domChanges = [];

// Função que recebe uma lista de mutações realizada na página
function trackDOMChanges(mutationsList) {
  mutationsList.forEach(mutation => {


    // Adição de nós
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        domChanges.push({
          type: 'Added',
          node: node.nodeName,
          time: new Date().toLocaleTimeString(),
          content: node.textContent ? node.textContent.slice(0, 50) : 'No content'
        });
      });
    }

    // Remocão de nós
    if (mutation.removedNodes.length > 0) {
      mutation.removedNodes.forEach(node => {
        domChanges.push({
          type: 'Removed',
          node: node.nodeName,
          time: new Date().toLocaleTimeString(),
          content: node.textContent ? node.textContent.slice(0, 50) : 'No content'
        });
      });
    }
    
    // Mudança de atributos
    if (mutation.type === 'attributes') {
      domChanges.push({
        type: 'Attribute Modified',
        node: mutation.target.nodeName,
        attributeName: mutation.attributeName,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  // Retorna as mudanças
  browser.runtime.sendMessage({ action: 'domChange', changes: domChanges });
}

// MutationObserver é uma classe da API de Browser que fica esperando e catalogando as mudanças
const observer = new MutationObserver(trackDOMChanges);

// Inicialização do observador
observer.observe(document, {
  childList: true, // Verifica as mudanças de nós (adição e remoção)
  attributes: true, // Verifica mudanças nos atributos
  subtree: true // Verifica a árvore do DOM inteira
});
