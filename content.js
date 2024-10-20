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

// Function to track DOM changes
function trackDOMChanges(mutationsList) {
  mutationsList.forEach(mutation => {
    // Track added nodes
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

    // Track removed nodes
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
    
    // Track attribute changes
    if (mutation.type === 'attributes') {
      domChanges.push({
        type: 'Attribute Modified',
        node: mutation.target.nodeName,
        attributeName: mutation.attributeName,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  // Send changes to the background script
  browser.runtime.sendMessage({ action: 'domChange', changes: domChanges });
}

// Set up MutationObserver to track changes in the DOM
const observer = new MutationObserver(trackDOMChanges);

// Start observing the entire document
observer.observe(document, {
  childList: true, // Tracks addition/removal of nodes
  attributes: true, // Tracks changes to attributes
  subtree: true // Observes the entire DOM tree
});
