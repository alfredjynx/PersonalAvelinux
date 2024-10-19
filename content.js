// content.js
function getLocalStorageItems() {
    let items = {};
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      items[key] = value;
    }
    return items;
  }
  
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getLocalStorage") {
      const localStorageData = getLocalStorageItems();
      sendResponse({ data: localStorageData });
    }
  });
  