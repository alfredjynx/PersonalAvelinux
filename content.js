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
  